import { Controller, Post, Body } from '@nestjs/common';
import { MindmapService } from './mindmap.service';
import { UpdateMindmapDto } from './dto/update-mindmap.dto';
import { CreateCreativeMindmapDto } from './dto/create-creative-mindmap.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('mindmap')
@Controller('mindmap')
export class MindmapController {
  constructor(private readonly mindmapService: MindmapService) {}

  @Post('create-creative')
  @ApiResponse({ status: 201, description: 'Mindmap created successfully' })
  async creativeCreate(
    @Body() createCreativeMindmapDto: CreateCreativeMindmapDto,
  ) {
    return await this.mindmapService.create(createCreativeMindmapDto);
  }
}
