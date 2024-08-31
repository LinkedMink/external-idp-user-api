import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { LoginResponseDto, NonceResponseDto } from "../dto/login.dto.js";
import { AllowAnonymous } from "../framework/authentication.decorator.js";
import { ZodValidationPipe } from "../framework/zod-validation.pipe.js";
import { ethereumLoginDtoSchema, EthereumLoginTransformedDto } from "../schemas/login.schema.js";
import { EthereumLoginService } from "../services/login-providers/ethereum-login.service.js";

@Controller("login/ethereum")
@AllowAnonymous()
export class EthereumLoginController {
  constructor(private readonly ethereumLoginService: EthereumLoginService) {}

  @Get()
  getByEthereum(): Promise<NonceResponseDto> {
    return this.ethereumLoginService.init();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  postByEthereum(
    @Body(new ZodValidationPipe(ethereumLoginDtoSchema)) dto: EthereumLoginTransformedDto
  ): Promise<LoginResponseDto> {
    return this.ethereumLoginService.login(dto);
  }
}
