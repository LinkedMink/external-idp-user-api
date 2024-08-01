import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  get() {
    return {
      timestamp: new Date(),
    };
  }
}
