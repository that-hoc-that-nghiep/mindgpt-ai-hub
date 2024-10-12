import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LLMModel, MindmapType } from 'src/constant';
import { MindmapDocument } from './mindmap-document.dto';
import { BaseMindmapDto } from './base-mindmap.dto';

export class CreateMindmapDto extends BaseMindmapDto {
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
