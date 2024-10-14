import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Env } from 'src/constant';
import { Document } from '@langchain/core/documents';
import { getArrayNumber } from 'src/utils/file';
import { v4 as uuidv4 } from 'uuid';
import { Database } from 'src/types/supabase';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly configSerivce: ConfigService<typeof Env, true>,
  ) {}

  async addToVectorStore(docs: Document<Record<string, any>>[]) {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
    });

    const supabase = createClient<Database>(
      this.configSerivce.get('SUPABASE_URL'),
      this.configSerivce.get('SUPABASE_KEY'),
    );

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'all_documents',
      queryName: 'match_documents',
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const allSplits = await splitter.splitDocuments(docs);

    const ids = Array.from({ length: allSplits.length }, () => uuidv4());

    await vectorStore.addDocuments(allSplits, { ids });

    return ids;
  }

  async getRetrieval(ids: string[]) {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
    });

    const supabase = createClient<Database>(
      this.configSerivce.get('SUPABASE_URL'),
      this.configSerivce.get('SUPABASE_KEY'),
    );

    const { data: docs } = await supabase
      .from('all_documents')
      .select('*')
      .in('id', ids);

    this.logger.log(
      `Search documents: ${JSON.stringify(docs.map((doc) => doc.id))}`,
    );

    await supabase.from('documents').delete().neq('id', 0);

    await supabase.from('documents').insert(
      docs.map(({ content, embedding, metadata }) => ({
        content,
        embedding,
        metadata,
      })),
    );

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'retrieve_documents',
      queryName: 'match_documents',
    });

    return vectorStore.asRetriever();
  }
}
