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
      '350a90b5-499f-4000-a1e8-8b40964e5a2f',
      'a67d94fb-9127-4fef-b970-b16320ee2212',
      '92024fc0-d98f-4278-8ec6-281cf2a9b280',
      '08bb4f6e-940d-45fc-8803-ce954f695929',
      'be737b17-2cba-4679-af94-0a62806d66b3',
      '29e61784-4724-45c0-9f13-85e656e0e11a',
    ],
  })
  @IsArray()
  documentsId: string[];
}
