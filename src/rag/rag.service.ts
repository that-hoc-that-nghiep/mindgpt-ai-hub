import { Injectable } from '@nestjs/common';
import { extractTextFromFile } from 'src/utils/file';

@Injectable()
export class RagService {
  async uploadDoc() {
    const filePathTest =
      'https://znacytaqncsguiyhgtgj.supabase.co/storage/v1/object/public/document/vim-tutor.txt';
    const docs = await extractTextFromFile(filePathTest, 'pdf');
  }
}
