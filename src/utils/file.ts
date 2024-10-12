import fs from 'fs/promises';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';

export const extractTextFromFile = async (
  filePath: string,
  fileType: string,
) => {
  const response = await fetch(filePath);
  switch (fileType) {
    case 'pdf':
      const pdf = await response.blob();
      const pdfLoader = new WebPDFLoader(pdf, {});

      const docs = await pdfLoader.load();
      return docs[0];
  }
};
