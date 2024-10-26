import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { SelectedNodeDto } from './selected-node.dto';
import { BaseMindmapDto } from './base-mindmap.dto';

export class GenQuizDto extends BaseMindmapDto {
  @IsNumber()
  @ApiProperty({
    default: 5,
  })
  questionNumber: number;

  @IsString()
  @ApiProperty({
    default:
      '```mermaid\ngraph TB\n\n%% Nodes\nA["🚀 Hoạt động | Khả năng"]\nB["🔧 Ngôn ngữ lập trình"]\nC["📚 Chứng chỉ"]\nD["📜 Kinh nghiệm làm việc"]\nE["🌟 Giải thưởng | Thành tích"]\nF["📅 Coursera - Giao tiếp máy tính"]\nG["📅 F-Talent Code 2023"]\nH["💼 CMED.VN"]\nI["🎓 JS Club"]\nJ["🔨 Typescript"]\nK["🔨 Java"]\nL["🔨 C"]\n\n%% Edges\nA --> B\nB --> C\nC --> D\nD --> E\nE --> F\nF --> G\nG --> H\nH --> I\nI --> J\nJ --> K\nK --> L\n```',
  })
  mermaid: string;

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
