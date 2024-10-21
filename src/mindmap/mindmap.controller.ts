import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Put,
  Logger,
  Res,
  HttpStatus,
  Delete,
  Patch,
} from '@nestjs/common';
import { MindmapService } from './mindmap.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMindmapDto } from './dto/create-mindmap.dto';
import { MindmapType } from 'src/constant';
import { ChatMindmapDto } from './dto/chat-mindmap.dto';
import { EditMindmapDto } from './dto/edit-mindmap.dto';
import { GenQuizDto } from './dto/gen-quiz.dto';
import { SuggestNoteDto } from './dto/suggest-note.dto';
import { Response } from 'express';
import { DeleteDocsDto } from './dto/delete-docs.dto';

@ApiTags('mindmap')
@Controller('mindmap')
export class MindmapController {
  private readonly logger = new Logger(MindmapController.name);
  constructor(private readonly mindmapService: MindmapService) {}

  @Post('create')
  @ApiResponse({ status: 201, description: 'Mindmap created successfully' })
  async create(
    @Body() createMindmapDto: CreateMindmapDto,
    @Res() res: Response,
  ) {
    try {
      if (
        createMindmapDto.type === MindmapType.SUMMARY &&
        createMindmapDto.document === null
      ) {
        throw new BadRequestException('Document is required in summary type');
      }
      return res
        .status(HttpStatus.CREATED)
        .json(await this.mindmapService.create(createMindmapDto));
    } catch (error) {
      this.logger.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

  @Post('chat')
  @ApiResponse({ status: 200 })
  async chat(@Body() chatMindmapDto: ChatMindmapDto, @Res() res: Response) {
    try {
      if (
        chatMindmapDto.type === MindmapType.SUMMARY &&
        chatMindmapDto.document === null
      ) {
        throw new BadRequestException('Document is required in summary type');
      }
      return res
        .status(HttpStatus.OK)
        .json(await this.mindmapService.chat(chatMindmapDto));
    } catch (error) {
      this.logger.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

  @Put('edit')
  @ApiResponse({ status: 200 })
  async edit(@Body() editMindmapDto: EditMindmapDto, @Res() res: Response) {
    try {
      if (
        editMindmapDto.type === MindmapType.SUMMARY &&
        editMindmapDto.document === null
      ) {
        throw new BadRequestException('Document is required in summary type');
      }
      return res
        .status(HttpStatus.OK)
        .json(await this.mindmapService.edit(editMindmapDto));
    } catch (error) {
      this.logger.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

  @Post('gen-quiz')
  @ApiResponse({ status: 200 })
  async genQuiz(@Body() genQuizDto: GenQuizDto, @Res() res: Response) {
    try {
      if (
        genQuizDto.type === MindmapType.SUMMARY &&
        genQuizDto.document === null
      ) {
        throw new BadRequestException('Document is required in summary type');
      }
      return res
        .status(HttpStatus.CREATED)
        .json(await this.mindmapService.genQuiz(genQuizDto));
    } catch (error) {
      this.logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }

  @Post('suggest-note')
  @ApiResponse({ status: 200 })
  async suggestNote(
    @Body() suggestNoteDto: SuggestNoteDto,
    @Res() res: Response,
  ) {
    try {
      if (
        suggestNoteDto.type === MindmapType.SUMMARY &&
        suggestNoteDto.document === null
      ) {
        throw new BadRequestException('Document is required in summary type');
      }
      return res
        .status(HttpStatus.OK)
        .json(await this.mindmapService.suggest(suggestNoteDto));
    } catch (error) {
      this.logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }

  @Patch('delete-docs')
  @ApiResponse({ status: 204 })
  async deleteDocs(@Body() deleteDocsDto: DeleteDocsDto, @Res() res: Response) {
    try {
      this.mindmapService.deleteDocs(deleteDocsDto);
      return res.status(HttpStatus.NO_CONTENT);
    } catch (error) {
      this.logger.error(error);
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
}
