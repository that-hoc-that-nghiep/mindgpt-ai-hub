import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Env } from 'src/constant';
import { Document } from '@langchain/core/documents';
import { getArrayNumber } from 'src/utils/file';

@Injectable()
export class RagService {
  constructor(
    private readonly configSerivce: ConfigService<typeof Env, true>,
  ) {}

  async getRetrieval(docs: Document<Record<string, any>>[]) {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
    });

    const supabase = createClient(
      this.configSerivce.get('SUPABASE_URL'),
      this.configSerivce.get('SUPABASE_KEY'),
    );

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'documents',
      queryName: 'match_documents',
    });

    await vectorStore.delete({
      ids: getArrayNumber(1, 100),
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const allSplits = await splitter.splitDocuments(docs);

    await vectorStore.addDocuments(allSplits, { ids: getArrayNumber(1, 100) });

    return vectorStore.asRetriever();
  }
}
