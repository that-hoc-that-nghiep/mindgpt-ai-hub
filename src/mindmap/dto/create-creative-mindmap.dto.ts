import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { LLMModel } from 'src/constant';

export class CreateCreativeMindmapDto {
  @ApiProperty({
    enum: LLMModel,
  })
  @IsEnum(LLMModel)
  llm: LLMModel;

  @ApiProperty()
  @IsString()
  prompt: string;

  @ApiProperty()
  @IsNumber()
  depth: number;

  @ApiProperty()
  @IsNumber()
  child: number;
}
