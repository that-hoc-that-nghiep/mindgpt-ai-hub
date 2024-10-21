export const Env: Record<string, string> = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  SUPABASE_URL: 'SUPABASE_URL',
  SUPABASE_KEY: 'SUPABASE_KEY',
};

export enum MindmapType {
  CREATIVE = 'creative',
  SUMMARY = 'summary',
}

export enum LLMModel {
  GPT_4o = 'gpt-4o',
  GPT_4o_mini = 'gpt-4o-mini',
}

export enum DocumentType {
  PDF = 'pdf',
  DOCX = 'docx',
  WEB = 'web',
  YOUTUBE = 'youtube',
}
