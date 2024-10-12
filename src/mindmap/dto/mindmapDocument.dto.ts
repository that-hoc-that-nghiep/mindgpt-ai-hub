import { IsOptional, IsString } from 'class-validator';

export class MindmapDocument {
  @IsString()
  type: string;

  @IsString()
  url: string;
}
