import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsObject, IsOptional } from 'class-validator';
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

  @ApiProperty({
    default: [
    "9507b06e-2da5-47f3-a25c-7b8a8b5b251b",
    "8d50f01c-e880-4465-837c-ef86c5957093",
    "11139a5d-6219-4028-9ca7-c962190b5c6c",
    "3c5bf991-5e3d-4e49-b1ce-3ca3eb252eb2",
    "221298c5-2873-43f5-ae9a-68d6282e30f8",
    "c6f2192f-1cf4-4a49-9025-3e6cf2d8d92e"
  ]
  })
  @IsArray()
  documentsId: string[];
}
