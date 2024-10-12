import { IsEnum, IsString } from 'class-validator';

export class MessageDto {
  @IsEnum(['user', 'ai'])
  role: string;

  @IsString()
  content: string;
}
