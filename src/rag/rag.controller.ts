import { Controller, Logger, Post } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  private readonly logger = new Logger(RagController.name);
  constructor(private readonly ragService: RagService) {}

  @Post('upload')
  async uploadDoc() {
    try {
      return await this.ragService.uploadDoc();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
