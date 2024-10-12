import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MindmapService } from './mindmap.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMindmapDto } from './dto/create-mindmap.dto';
import { MindmapType } from 'src/constant';

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
}
