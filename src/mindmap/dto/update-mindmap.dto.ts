import { PartialType } from '@nestjs/mapped-types';
import { CreateCreativeMindmapDto } from './create-creative-mindmap.dto';

export class UpdateMindmapDto extends PartialType(CreateCreativeMindmapDto) {}
