import { Injectable } from '@nestjs/common';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { CreateMindmapDto } from './dto/create-mindmap.dto';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  extractMermaidCode,
  nodesToString,
  parseMermaidCode,
} from 'src/utils/parser';
import { Env, MindmapType } from 'src/constant';
import { getDocFromUrl } from 'src/utils/file';
import { ConfigService } from '@nestjs/config';
import { RagService } from 'src/rag/rag.service';
import { DocumentInterface } from '@langchain/core/documents';
import { ChatMindmapDto } from './dto/chat-mindmap.dto';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { EditMindmapDto } from './dto/edit-mindmap.dto';
import { GenQuizDto } from './dto/gen-quiz.dto';

@Injectable()
export class MindmapService {
  constructor(
    private readonly configSerivce: ConfigService<typeof Env, true>,
    private readonly ragSerivice: RagService,
  ) {}
  async create(createMindmapDto: CreateMindmapDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      'system',
      `You are an expert mindmap designer and your task is to design an intuitive, detailed and easy-to-understand mindmap for summarizing documents or knowledge with following requirements:
        1. The mindmap should help users grasp the core ideas and their relationships quickly.
        2. Use Mermaid syntax to visualize the mindmap, including components such as the central concept, main topics, and subtopics. The graph should be undirected and hierarchical. (e.g:
          graph TB
          A["📘 Toán 12"]
          B["📏 Hình học không gian"]
          C["📐 Đại số"]
          D["📊 Hình học tọa độ"]
          E["📈 Phương trình bậc hai"]
          F["📌 Cấp số cộng"]
          G["📌 Cấp số nhân"]

          A --> B
          A --> C
          B --> D
          B --> E
          C --> F
          C --> G
        )
        3. Always include Node IDs and wrap Node names in quotes (e.g., A["Central Concept"]).
        4. The depth of the mindmap should be {depth} levels and each parent node must have {child} child nodes (except master node).
        5. Separate the node and edge definitions, list nodes first and then connect them by edges (-->). Each child node is only allowed to have one parent node.
        6. Make sure all the nodes and edges are connected (e.g., A --> B, B --> C, C --> D, D --> E, E --> F, F --> G).
        7. Do not have any comment (remove all "%% comment") in mermaid.
        8. The language used in mindmap must be the same with the language used in the user's input
        9. Use icons at the begin on nodes' name to make the mindmap more exciting.
        10.If there are documents context, You are only allowed to use the information contained in this resource. Absolutely not create other information outside the document
        
        {context}`,
      'user',
      '{input}',
    ]);

    const llm = new ChatOpenAI({
      model: createMindmapDto.llm,
    });

    let context: DocumentInterface<Record<string, any>>[] = [];

    if (createMindmapDto.type === MindmapType.SUMMARY) {
      const docs = await getDocFromUrl(
        createMindmapDto.document.url,
        createMindmapDto.document.type,
      );

      const retrieval = await this.ragSerivice.getRetrieval(docs);

      context = await retrieval.invoke('');
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke({
      input:
        createMindmapDto.type === MindmapType.CREATIVE
          ? createMindmapDto.prompt
          : 'Summary this document, the language of mindmap content is same as document language',
      depth: createMindmapDto.depth,
      child: createMindmapDto.child,
      context,
    });

    return extractMermaidCode(res);
  }

  async chat(chatMindmapDto: ChatMindmapDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert mindmap designer and your task is answer user's question for summarizing mindmap or provide knowledge from mindmap with following requirements:
        1. Required answer in markdown format.
        2. The language used in answer must be the same with the language used in the user's input.
        3. Answers have a specific layout structure.
        4. It is allowed to refer to the mermaid diagram to understand the content of the mindmap, however, it is only allowed to answer questions related to the nodes selected by the user.
        5. If there are documents context, you are only allowed to answer the knowledge contained in the documents and mermaid. Absolutely do not arbitrarily create answers
        6. Do not include selected nodes in the answer

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
      const docs = await getDocFromUrl(
        chatMindmapDto.document.url,
        chatMindmapDto.document.type,
      );

      const retrieval = await this.ragSerivice.getRetrieval(docs);

      context = await retrieval.invoke('');
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke({
      input: `${chatMindmapDto.prompt}. Please look at these nodes: ${nodesToString(chatMindmapDto.slectedNodes)}. Full mermaid diagram: ${parseMermaidCode(chatMindmapDto.mermaid)}`,
      chatHistory: chatMindmapDto.conversation.map((message) => {
        if (message.role === 'user') {
          return new HumanMessage(message.content);
        } else {
          return new AIMessage(message.content);
        }
      }),
      context,
    });

    return res;
  }

  async edit(editMindmapDto: EditMindmapDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      'system',
      `You are an expert mindmap designer and your task is edit an existing mindmap based on the user's input with following requirements:
        1. Changes are only allowed to the nodes that the user has selected and requested. Absolutely do not edit other nodes.
        2. The mindmap should help users grasp the core ideas and their relationships quickly.
        3. Use Mermaid syntax to visualize the mindmap, including components such as the central concept, main topics, and subtopics. The graph should be undirected and hierarchical. (e.g:
          graph TB
          A["📘 Toán 12"]
          B["📏 Hình học không gian"]
          C["📐 Đại số"]
          D["📊 Hình học tọa độ"]
          E["📈 Phương trình bậc hai"]
          F["📌 Cấp số cộng"]
          G["📌 Cấp số nhân"]

          A --> B
          A --> C
          B --> D
          B --> E
          C --> F
          C --> G
        )
        4. Always include Node IDs and wrap Node names in quotes (e.g., A["Central Concept"]).
        5. Separate the node and edge definitions, list nodes first and then connect them by edges (-->). Each child node is only allowed to have one parent node.
        6. Make sure all the nodes and edges are connected (e.g., A --> B, B --> C, C --> D, D --> E, E --> F, F --> G).
        7. Do not have any comment (remove all "%% comment") in mermaid.
        8. The language used in mindmap must be the same with the language used in the user's input
        9. Use icons at the begin on nodes' name to make the mindmap more exciting.
        
        {context}`,
      'user',
      '{input}',
    ]);

    const llm = new ChatOpenAI({
      model: editMindmapDto.llm,
    });

    let context: DocumentInterface<Record<string, any>>[] = [];

    if (editMindmapDto.type === MindmapType.SUMMARY) {
      const docs = await getDocFromUrl(
        editMindmapDto.document.url,
        editMindmapDto.document.type,
      );

      const retrieval = await this.ragSerivice.getRetrieval(docs);

      context = await retrieval.invoke('');
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke({
      input: `${editMindmapDto.prompt}. Please edit at these nodes: ${nodesToString(editMindmapDto.slectedNodes)}. Full mermaid diagram: ${parseMermaidCode(editMindmapDto.mermaid)}`,
      context,
    });

    return extractMermaidCode(res);
  }

  async genQuiz(genQuizDto: GenQuizDto) {
    const prompt = ChatPromptTemplate.fromMessages([
      'system',
      `You are an expert mindmap designer and your task is generate a quiz to help them memorize the core ideas and their relationships based on the user's mindmap with following requirements:
        1. Output format is markdown:
          ### What is his name?
            - Answer 1
            - Answer 2
            - Answer 3
            - Answer 4
          ### How old is he?
            - Answer 1
            - Answer 2
            - Answer 3
            - Answer 4
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
      const docs = await getDocFromUrl(
        genQuizDto.document.url,
        genQuizDto.document.type,
      );

      const retrieval = await this.ragSerivice.getRetrieval(docs);

      context = await retrieval.invoke('');
    }

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const res = await chain.invoke({
      input: `Please generate a quiz with ${genQuizDto.questionNumber} question based on these nodes: ${nodesToString(genQuizDto.slectedNodes)}. Full mermaid diagram: ${parseMermaidCode(genQuizDto.mermaid)}`,
      context,
    });

    return res;
  }
}
