import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Put,
  Logger,
} from '@nestjs/common';
import { MindmapService } from './mindmap.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMindmapDto } from './dto/create-mindmap.dto';
import { MindmapType } from 'src/constant';
import { ChatMindmapDto } from './dto/chat-mindmap.dto';
import { EditMindmapDto } from './dto/edit-mindmap.dto';
import { GenQuizDto } from './dto/gen-quiz.dto';
import { SuggestNoteDto } from './dto/suggest-note.dto';

@ApiTags('mindmap')
@Controller('mindmap')
export class MindmapController {
  private readonly logger = new Logger(MindmapController.name);
  constructor(private readonly mindmapService: MindmapService) {}

  @Post('create')
  @ApiResponse({ status: 201, description: 'Mindmap created successfully' })
  async create(@Body() createMindmapDto: CreateMindmapDto) {
    try {
      if (
        createMindmapDto.type === MindmapType.SUMMARY &&
        createMindmapDto.document === null
      ) {
        throw new BadRequestException('Document is required in summary type');
      }
      return await this.mindmapService.create(createMindmapDto);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Post('chat')
  @ApiResponse({ status: 200 })
  async chat(@Body() chatMindmapDto: ChatMindmapDto) {
    return await this.mindmapService.chat(chatMindmapDto);
  }

  @Put('edit')
  @ApiResponse({ status: 200 })
  async edit(@Body() editMindmapDto: EditMindmapDto) {
    return await this.mindmapService.edit(editMindmapDto);
  }

  @Post('gen-quiz')
  @ApiResponse({ status: 200 })
  async genQuiz(@Body() genQuizDto: GenQuizDto) {
    return await this.mindmapService.genQuiz(genQuizDto);
  }

  @Post('suggest-note')
  @ApiResponse({ status: 200 })
  async suggestNote(@Body() suggestNoteDto: SuggestNoteDto) {
    return await this.mindmapService.suggest(suggestNoteDto);
  }
}
