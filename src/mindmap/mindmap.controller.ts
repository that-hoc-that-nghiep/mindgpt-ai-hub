import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MindmapService } from './mindmap.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMindmapDto } from './dto/create-mindmap.dto';
import { MindmapType } from 'src/constant';
import { ChatMindmapDto } from './dto/chat-mindmap.dto';

@ApiTags('mindmap')
@Controller('mindmap')
export class MindmapController {
  constructor(private readonly mindmapService: MindmapService) {}

  @Post('create')
  @ApiResponse({ status: 201, description: 'Mindmap created successfully' })
  async create(@Body() createMindmapDto: CreateMindmapDto) {
    if (
      createMindmapDto.type === MindmapType.SUMMARY &&
      createMindmapDto.document === null
    ) {
      throw new BadRequestException('Document is required in summary type');
    }
    return await this.mindmapService.create(createMindmapDto);
  }

  @Post('chat')
  @ApiResponse({ status: 200 })
  async chat(@Body() chatMindmapDto: ChatMindmapDto) {
    return await this.mindmapService.chat(chatMindmapDto);
  }
}
