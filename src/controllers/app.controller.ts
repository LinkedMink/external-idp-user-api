import { Controller, Get } from "@nestjs/common";
import { HealthResponseDto } from "../dto/health.dto";
import { AllowAnonymous } from "../framework/authentication.decorator";

@Controller()
@AllowAnonymous()
export class AppController {
  @Get()
  get(): HealthResponseDto {
    return {
      timestamp: new Date(),
      isHealthy: true,
    };
  }
}
