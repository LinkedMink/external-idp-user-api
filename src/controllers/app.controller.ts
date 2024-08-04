import { Controller, Get } from "@nestjs/common";
import { HealthResponseDto } from "../dto/health.dto";

@Controller()
export class AppController {
  @Get()
  get(): HealthResponseDto {
    return {
      timestamp: new Date(),
      isHealthy: true,
    };
  }
}
