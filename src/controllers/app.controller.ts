import { Controller, Get } from "@nestjs/common";
import { JsonWebKey } from "node:crypto";
import { HealthResponseDto } from "../dto/health.dto.js";
import { AllowAnonymous } from "../framework/authentication.decorator.js";
import { TokenSigningService } from "../services/token-signing.service.js";

@Controller()
@AllowAnonymous()
export class AppController {
  constructor(private readonly tokenSigningService: TokenSigningService) {}

  @Get()
  get(): HealthResponseDto {
    return {
      timestamp: new Date(),
      isHealthy: true,
    };
  }

  @Get("keys")
  getKeys(): { keys: JsonWebKey[] } {
    return {
      keys: [this.tokenSigningService.publicKey],
    };
  }
}
