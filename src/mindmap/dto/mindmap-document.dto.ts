import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from 'src/constant';

export class MindmapDocument {
  @IsEnum(DocumentType)
  @ApiProperty({
    default: DocumentType.PDF,
  })
  type: DocumentType;

  @IsString()
  @ApiProperty({
    default:
      'https://znacytaqncsguiyhgtgj.supabase.co/storage/v1/object/public/document/Resume_quydx.pdf',
  })
  url: string;
}
