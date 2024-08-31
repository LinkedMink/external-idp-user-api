import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { LoginResponseDto, PasswordLoginDto } from "../dto/login.dto.js";
import { AllowAnonymous } from "../framework/authentication.decorator.js";
import { ZodValidationPipe } from "../framework/zod-validation.pipe.js";
import { passwordLoginDtoSchema } from "../schemas/login.schema.js";
import { PasswordLoginService } from "../services/login-providers/password-login.service.js";

@Controller("login")
@AllowAnonymous()
export class PasswordLoginController {
  constructor(private readonly passwordLoginService: PasswordLoginService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  post(
    @Body(new ZodValidationPipe(passwordLoginDtoSchema)) dto: PasswordLoginDto
  ): Promise<LoginResponseDto> {
    return this.passwordLoginService.login(dto);
  }
}
