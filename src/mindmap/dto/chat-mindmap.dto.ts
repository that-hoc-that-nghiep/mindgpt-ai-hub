import { IsArray, IsString } from 'class-validator';
import { BaseMindmapDto } from './base-mindmap.dto';
import { MessageDto } from './message.dto';
import { SelectedNodeDto } from './selected-node.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMindmapDto extends BaseMindmapDto {
  @IsString()
  @ApiProperty({
    default:
      '```mermaid\ngraph TB\n\n%% Nodes\nA["🚀 Hoạt động | Khả năng"]\nB["🔧 Ngôn ngữ lập trình"]\nC["📚 Chứng chỉ"]\nD["📜 Kinh nghiệm làm việc"]\nE["🌟 Giải thưởng | Thành tích"]\nF["📅 Coursera - Giao tiếp máy tính"]\nG["📅 F-Talent Code 2023"]\nH["💼 CMED.VN"]\nI["🎓 JS Club"]\nJ["🔨 Typescript"]\nK["🔨 Java"]\nL["🔨 C"]\n\n%% Edges\nA --> B\nB --> C\nC --> D\nD --> E\nE --> F\nF --> G\nG --> H\nH --> I\nI --> J\nJ --> K\nK --> L\n```',
  })
  mermaid: string;

  @IsString()
  @ApiProperty({
    default: 'Anh ấy đạt được những giải thưởng gì?',
  })
  prompt: string;

  @IsArray()
  @ApiProperty({
    default: [
      {
        role: 'user',
        content: 'Kết thúc mỗi câu trả lời hãy thêm từ Thưa chủ nhân',
      },
      { role: 'ai', content: 'Tôi đã hiểu. Thưa chủ nhân' },
    ],
  })
  conversation: MessageDto[];

  @IsArray()
  @ApiProperty({
    default: [
      {
        id: 'A',
        name: '📄 Đào Xuân Quý - Resume',
      },
      {
        id: 'E',
        name: '🌟 Giải thưởng | Thành tích',
      },
    ],
  })
  selectedNodes: SelectedNodeDto[];
}
