import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Env } from 'src/constant';
import { Document } from '@langchain/core/documents';
import { getArrayNumber } from 'src/utils/file';
import { v4 as uuidv4 } from 'uuid';
import { Database } from 'src/types/supabase';

@Injectable()
export class RagService {
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
      tableName: 'documents',
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
      .from('documents')
      .select('*')
      .in('id', ids);

    await supabase.from('retrieve_documents').delete();

    await supabase.from('retrieve_documents').insert(docs);

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'retrieve_documents',
      queryName: 'match_documents',
    });

    return vectorStore.asRetriever();
  }
}
