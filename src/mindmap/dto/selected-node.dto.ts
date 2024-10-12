import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SelectedNodeDto {
  @IsString()
  @ApiProperty({
    default: 'A',
  })
  id: string;

  @IsString()
  @ApiProperty({
    default: 'Dao Xuan Quy',
  })
  name: string;
}
