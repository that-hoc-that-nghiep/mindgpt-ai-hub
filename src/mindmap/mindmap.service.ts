import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { CreateMindmapDto } from './dto/create-mindmap.dto';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  extractExplanation,
  extractMermaidCode,
  getMarkdownMessage,
  nodesToString,
  parseMarkdownQuestionToJson,
  parseMermaidCode,
} from 'src/utils/parser';
import { MindmapType } from 'src/constant';
import { getDocFromUrl } from 'src/utils/file';
import { RagService } from 'src/rag/rag.service';
import { DocumentInterface } from '@langchain/core/documents';
import { ChatMindmapDto } from './dto/chat-mindmap.dto';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { EditMindmapDto } from './dto/edit-mindmap.dto';
import { GenQuizDto } from './dto/gen-quiz.dto';
import { SuggestNoteDto } from './dto/suggest-note.dto';
import { AIResponseDto } from './dto/ai-response.dto';
import { DeleteDocsDto } from './dto/delete-docs.dto';

@Injectable()
export class MindmapService {
  private readonly logger = new Logger(MindmapService.name);
  constructor(private readonly ragSerivice: RagService) {}

  async create(createMindmapDto: CreateMindmapDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      'system',
      `You are an expert mindmap designer and your task is to design an intuitive, detailed and easy-to-understand mindmap for summarizing documents or knowledge with following requirements:
        1. The mindmap should help users grasp the core ideas and their relationships quickly.
        2. Use Mermaid syntax to visualize the mindmap, including components such as the central concept, main topics, and subtopics. The graph should be undirected and hierarchical. (e.g:
          graph TB
          A["📘 Node A Label"]
          B["📏 Node B Label"]
          C["📐 Node C Label"]
          D["📊 Node D Label"]
          E["📈 Node E Label"]
          F["📌 Node F Label"]
          G["📌 Node G Label"]

          A --> B
          A --> C
          B --> D
          B --> E
          C --> F
          C --> G
        )
        3. Always include Node IDs and wrap Node names in quotes (e.g., A["Central Concept"]).
        4. The depth of the mindmap should be {depth} levels and each parent node must have {child} child nodes (except root node).
        5. Separate the node and edge definitions, list nodes first and then connect them by edges (-->).
        6. Make sure all the nodes and edges are connected (e.g., A --> B, B --> C, C --> D, D --> E, E --> F, F --> G).
        7. Do not have any comment (remove all "%% comment") in mermaid.
        8. The language used in mindmap must be the same with the language used in the user's input
        9. Use icons at the begin on nodes' name to make the mindmap more exciting.
        10.If there are documents context, You are only allowed to use the information contained in this resource. Absolutely not create other information outside the document
        11. The structure of the mermaid must be similar to a tree structure (each child node can only have one parent node except root node but parent node can have many child node).
        
        {context}`,
      'user',
      '{input}',
    ]);

    const llm = new ChatOpenAI({
      model: createMindmapDto.llm,
    });

    let context: DocumentInterface<Record<string, any>>[] = [];
    let ids: string[] = [];

    if (createMindmapDto.type === MindmapType.SUMMARY) {
      try {
        const docs = await getDocFromUrl(
          createMindmapDto.document.url,
          createMindmapDto.document.type,
        );

        ids = await this.ragSerivice.addToVectorStore(docs);

        const retriever = await this.ragSerivice.getRetrieval(ids);

        this.logger.log(`Documents id: ${ids.join(', ')}`);

        context = await retriever.invoke('');
      } catch (error) {
        this.logger.error(error);
        return new BadRequestException(error.message);
      }
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke(
      {
        input:
          createMindmapDto.type === MindmapType.CREATIVE
            ? createMindmapDto.prompt
            : 'Summary this document, the language of mindmap content is same as document language',
        depth: createMindmapDto.depth,
        child: createMindmapDto.child,
        context,
      },
      {
        timeout: 20000,
      },
    );

    console.log(AIResponseDto.of(extractMermaidCode(res), ids));

    this.logger.log(`Mermaid: ${res}`);
    return AIResponseDto.of(extractMermaidCode(res), ids);
  }

  async chat(chatMindmapDto: ChatMindmapDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert mindmap designer and your task is answer user's question for summarizing mindmap or provide knowledge from mindmap with following requirements:
        1. The language used in answer must be the same with the language used in the user's input.
        2. Answers have a specific layout structure.
        3. It is allowed to refer to the mermaid diagram to understand the content of the mindmap, however, it is only allowed to answer questions related to the nodes selected by the user.
        4. If there are documents context, you are only allowed to answer the knowledge contained in the documents and mermaid. Absolutely do not arbitrarily create answers
        5. Do not include selected nodes in the answer
        6. Answer must be in markdown format

        {context}`,
      ],
      new MessagesPlaceholder('chatHistory'),
      ['user', '{input}'],
    ]);

    const llm = new ChatOpenAI({
      model: chatMindmapDto.llm,
    });

    let context: DocumentInterface<Record<string, any>>[] = [];

    if (chatMindmapDto.type === MindmapType.SUMMARY) {
      const retriever = await this.ragSerivice.getRetrieval(
        chatMindmapDto.documentsId,
      );
      context = await retriever.invoke('');
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke({
      input: `${chatMindmapDto.prompt}. Vui lòng giải thích những node này: ${nodesToString(chatMindmapDto.selectedNodes)}. Toàn bộ mindmap thể hiện dưới dạng mermaid: ${parseMermaidCode(chatMindmapDto.mermaid)}`,
      chatHistory: chatMindmapDto.conversation.map((message) => {
        if (message.role === 'user') {
          return new HumanMessage(message.content);
        } else {
          return new AIMessage(message.content);
        }
      }),
      context,
    });

    this.logger.log(`Chat response: ${res}`);

    return AIResponseDto.of(
      getMarkdownMessage(res),
      chatMindmapDto.documentsId,
    );
  }

  async edit(editMindmapDto: EditMindmapDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      'system',
      `You are an expert mindmap designer and your task is edit an existing mindmap based on the user's input with following requirements:
        1. Changes are only allowed to the nodes that the user has selected and requested. Absolutely do not edit other nodes.
        2. The mindmap should help users grasp the core ideas and their relationships quickly.
        3. Use Mermaid syntax to visualize the mindmap, including components such as the central concept, main topics, and subtopics. The graph should be undirected and hierarchical. (e.g:
          graph TB
          A["📘 Node A Label"]
          B["📏 Node B Label"]
          C["📐 Node C Label"]
          D["📊 Node D Label"]
          E["📈 Node E Label"]
          F["📌 Node F Label"]
          G["📌 Node G Label"]

          A --> B
          A --> C
          B --> D
          B --> E
          C --> F
          C --> G
        )
        4. Always include Node IDs and wrap Node names in quotes (e.g., A["Central Concept"]).
        5. Separate the node and edge definitions, list nodes first and then connect them by edges (-->). 
        6. Make sure all the nodes and edges are connected (e.g., A --> B, B --> C, C --> D, D --> E, E --> F, F --> G).
        7. Do not have any comment (remove all "%% comment") in mermaid.
        8. The language used in mindmap must be the same with the language used in the user's input
        9. Use icons at the begin on nodes' name to make the mindmap more exciting.
        10. If there are documents context, You are only allowed to use the information contained in this resource. Absolutely not create other information outside the document
        11. Do not edit the IDs of other nodes. If there is a new node, the ID will follow the syntax <parent node ID> + <suffix> (e.g.: parent node ID is E so when adding a new node it will be E1)
        12. Create the mindmap mermaid first then explain the change below in markdown (do not include node ID in explain). Split the mindmap and explanation with this symbol ---.
        13. The structure of the mermaid must be similar to a tree structure (each child node can only have one parent node except root node but parent node can have many child node).

        {context}`,
      'user',
      '{input}',
    ]);

    const llm = new ChatOpenAI({
      model: editMindmapDto.llm,
    });

    let context: DocumentInterface<Record<string, any>>[] = [];

    if (editMindmapDto.type === MindmapType.SUMMARY) {
      const retriever = await this.ragSerivice.getRetrieval(
        editMindmapDto.documentsId,
      );
      context = await retriever.invoke('');
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke({
      input: `${editMindmapDto.prompt}. Vui lòng chỉnh sửa những node này: ${nodesToString(editMindmapDto.selectedNodes)}. Toàn bộ mindmap thể hiện dưới dạng mermaid: ${parseMermaidCode(editMindmapDto.mermaid)}`,
      context,
    });

    this.logger.log(`Edit mindmap mermaid: ${res}`);

    return AIResponseDto.of(
      { mindmap: extractMermaidCode(res), message: extractExplanation(res) },
      editMindmapDto.documentsId,
    );
  }

  async genQuiz(genQuizDto: GenQuizDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      'system',
      `You are an expert mindmap designer and your task is generate a quiz to help them memorize the core ideas and their relationships based on the user's mindmap with following requirements:
        1. Output format is markdown, answer have ID and correct answer anote with > character:
          ### What is his name?
            - A: Answer 1
            - B: Answer 2
            - C: Answer 3
            - D: Answer 4
          > A
          ### How old is he?
            - A: Answer 1
            - B: Answer 2
            - C: Answer 3
            - D: Answer 4
          > C
        2. Questions can only be created related to the nodes the user selects. Absolutely do not create questions from other nodes. Mermaid diagrams are only used to understand context.
        3. Only one correct answer, the remaining answers are not too ridiculous will make the question easy.
        4. The language used in question and answer must be the same with the language used in the mermaid input.
        5. You can use icons to make the question more exciting.
        6.If there are documents context, You are only allowed to use the information contained in this resource. Absolutely not create other information outside the document (except for wrong answers).
        7. Just generate the question and answer according to the mardown structure above, no need for additional opening or closing context.
        8. Generate questions only the exact number of questions requested by the user is allowed.

        {context}`,
      'user',
      '{input}',
    ]);

    const llm = new ChatOpenAI({
      model: genQuizDto.llm,
    });

    let context: DocumentInterface<Record<string, any>>[] = [];

    if (genQuizDto.type === MindmapType.SUMMARY) {
      const retriever = await this.ragSerivice.getRetrieval(
        genQuizDto.documentsId,
      );
      context = await retriever.invoke('');
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke({
      input: `Please generate a quiz with ${genQuizDto.questionNumber} question based on these nodes: ${nodesToString(genQuizDto.selectedNodes)}. Full mermaid diagram: ${parseMermaidCode(genQuizDto.mermaid)}`,
      context,
    });

    this.logger.log(`Quiz markdown: ${res}`);

    return AIResponseDto.of(
      parseMarkdownQuestionToJson(res),
      genQuizDto.documentsId,
    );
  }

  async suggest(suggestNoteDto: SuggestNoteDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      'system',
      `You are an information analysis expert. Your task is to help users learn information from a mind map based on your document or knowledge source with the following requirements:
        1. The language used in answer must be the same with the language used in the user's mindmap.
        2. Answers have a specific layout structure.
        3. It is allowed to refer to the mermaid diagram to understand the content of the mindmap, however, it is only allowed to answer questions related to the nodes selected by the user.
        4. If there are documents context, you are only allowed to answer the knowledge contained in the documents and mermaid. Absolutely do not arbitrarily create answers
        5. Do not include selected node ID in the answer

        {context}`,
      'user',
      '{input}',
    ]);

    const llm = new ChatOpenAI({
      model: suggestNoteDto.llm,
    });

    let context: DocumentInterface<Record<string, any>>[] = [];

    if (suggestNoteDto.type === MindmapType.SUMMARY) {
      const retriever = await this.ragSerivice.getRetrieval(
        suggestNoteDto.documentsId,
      );
      context = await retriever.invoke('');
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke({
      input: `Please help me find out information about this node ${nodesToString([suggestNoteDto.selectedNode])}, based on mindmap ${parseMermaidCode(suggestNoteDto.mermaid)}`,
      context,
    });

    this.logger.log(`Suggestion: ${res}`);

    return AIResponseDto.of(getMarkdownMessage(res), suggestNoteDto.documentsId);
  }

  async deleteDocs(deleteDocsDto: DeleteDocsDto) {
    this.logger.log(`Delete documents id: ${deleteDocsDto.ids.join(', ')}`);
    await this.ragSerivice.deleteDocs(deleteDocsDto.ids);
  }
}
