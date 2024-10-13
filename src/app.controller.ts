import {Controller, Get} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('common')
@Controller()
export class AppController {

  @Get('ping')
  @ApiResponse({ status: 200})
  ping() {
    return {message: "pong"}
  }
}
