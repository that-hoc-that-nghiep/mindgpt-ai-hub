import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { BadRequestException } from '@nestjs/common';

export const getDocFromUrl = async (filePath: string, fileType: string) => {
  try {
    const response = await fetch(filePath);
    switch (fileType) {
      case 'pdf':
        const pdf = await response.blob();
        const pdfLoader = new WebPDFLoader(pdf, {});

        const docs = await pdfLoader.load();
        return docs;
    }
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};

export const getArrayNumber = (from: number, to: number) => {
  return Array.from({ length: to - from + 1 }, (_, i) => i + from);
};
