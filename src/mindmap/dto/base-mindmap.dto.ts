import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { LLMModel, MindmapType } from 'src/constant';
import { MindmapDocument } from './mindmap-document.dto';

export class BaseMindmapDto {
  @ApiProperty({
    enum: LLMModel,
  })
  @IsEnum(LLMModel)
  llm: LLMModel;

  @ApiProperty({
    enum: MindmapType,
    default: 'summary',
  })
  @IsEnum(MindmapType)
  type: MindmapType;

  @ApiProperty({
    type: () => MindmapDocument || null,
  })
  @IsOptional()
  @IsObject()
  document: MindmapDocument | null;
}
