import { IsArray, IsString } from 'class-validator';
import { BaseMindmapDto } from './base-mindmap.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SelectedNodeDto } from './selected-node.dto';

export class EditMindmapDto extends BaseMindmapDto {
  @IsString()
  @ApiProperty({
    default:
      '```mermaid\ngraph TB\n\n%% Nodes\nA["🚀 Hoạt động | Khả năng"]\nB["🔧 Ngôn ngữ lập trình"]\nC["📚 Chứng chỉ"]\nD["📜 Kinh nghiệm làm việc"]\nE["🌟 Giải thưởng | Thành tích"]\nF["📅 Coursera - Giao tiếp máy tính"]\nG["📅 F-Talent Code 2023"]\nH["💼 CMED.VN"]\nI["🎓 JS Club"]\nJ["🔨 Typescript"]\nK["🔨 Java"]\nL["🔨 C"]\n\n%% Edges\nA --> B\nB --> C\nC --> D\nD --> E\nE --> F\nF --> G\nG --> H\nH --> I\nI --> J\nJ --> K\nK --> L\n```',
  })
  mermaid: string;

  @IsString()
  @ApiProperty({
    default: 'Chi tiết hơn',
  })
  prompt: string;

  @IsArray()
  @ApiProperty({
    default: [
      {
        id: 'E',
        name: '🌟 Giải thưởng | Thành tích',
      },
    ],
  })
  slectedNodes: SelectedNodeDto[];
}
