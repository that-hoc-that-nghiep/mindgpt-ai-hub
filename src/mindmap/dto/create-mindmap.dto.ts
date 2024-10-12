import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LLMModel, MindmapType } from 'src/constant';
import { MindmapDocument } from './mindmapDocument.dto';

export class CreateMindmapDto {
  @ApiProperty({
    enum: LLMModel,
  })
  @IsEnum(LLMModel)
  llm: LLMModel;

  @ApiProperty({
    enum: MindmapType,
  })
  @IsEnum(MindmapType)
  type: MindmapType;

  @ApiProperty({
    type: () => MindmapDocument || null,
  })
  @IsOptional()
  @IsObject()
  document: MindmapDocument | null;

  @ApiProperty({
    default: 'Summary about Dao Xuan Quy',
  })
  @IsString()
  prompt: string;

  @ApiProperty({
    minimum: 1,
    default: 3,
  })
  @IsNumber()
  @IsOptional()
  depth: number;

  @ApiProperty({
    minimum: 1,
    default: 3,
  })
  @IsNumber()
  @IsOptional()
  child: number;
}
