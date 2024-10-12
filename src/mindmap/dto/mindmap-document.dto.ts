import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MindmapDocument {
  @IsString()
  @ApiProperty({
    default: 'pdf',
  })
  type: string;

  @IsString()
  @ApiProperty({
    default:
      'https://znacytaqncsguiyhgtgj.supabase.co/storage/v1/object/public/document/Resume_quydx.pdf',
  })
  url: string;
}
