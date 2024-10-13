import {Controller, Get} from '@nestjs/common';

@ApiTags('common')
@Controller()
export class AppController {

  @Get('ping')
  @ApiResponse({ status: 200})
  ping() {
    return {message: "pong"}
  }
}
