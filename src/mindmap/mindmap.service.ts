import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { CreateMindmapDto } from './dto/create-mindmap.dto';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { extractMermaidCode } from 'src/utils/parser';
import { Env, MindmapType } from 'src/constant';
import { getDocFromUrl } from 'src/utils/file';
import { ConfigService } from '@nestjs/config';
import { RagService } from 'src/rag/rag.service';
import { DocumentInterface } from '@langchain/core/documents';

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
        7. Do not have any comment in mindmap.
        8. The language used in mindmap must be the same with the language used in the user's input
        9. Use icons at the begin on nodes' name to make the mindmap more exciting.
        
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
}
