import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube';
import { PlaywrightWebBaseLoader } from '@langchain/community/document_loaders/web/playwright';
import { BadRequestException } from '@nestjs/common';
import { DocumentType } from 'src/constant';
import { Document } from '@langchain/core/documents';

export const getDocFromUrl = async (
  filePath: string,
  fileType: DocumentType,
) => {
  try {
    const response = await fetch(filePath);
    let docs: Document<Record<string, any>>[] = [];

    switch (fileType) {
      case DocumentType.PDF:
        const pdf = await response.blob();
        const pdfLoader = new WebPDFLoader(pdf, {});

        docs = await pdfLoader.load();
        return docs;

      case DocumentType.WEB:
        const webLoader = new CheerioWebBaseLoader(filePath, {
          selector: 'article',
        });
        docs = await webLoader.load();
        return docs;

      case DocumentType.YOUTUBE:
        const youtubeLoader = YoutubeLoader.createFromUrl(filePath, {
          addVideoInfo: true,
        });

        docs = await youtubeLoader.load();
        return docs;
    }
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};

export const getArrayNumber = (from: number, to: number) => {
  return Array.from({ length: to - from + 1 }, (_, i) => i + from);
};
