import { Module } from '@nestjs/common';
import { MindmapService } from './mindmap.service';
import { MindmapController } from './mindmap.controller';
import { RagModule } from 'src/rag/rag.module';

@Module({
  imports: [RagModule],
  controllers: [MindmapController],
  providers: [MindmapService],
})
export class MindmapModule {}
