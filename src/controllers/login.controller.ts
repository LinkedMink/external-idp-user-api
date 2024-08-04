import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import { LoginResponseDto, PasswordLoginDto, passwordLoginDtoSchema } from "../dto/login.dto";
import { ZodValidationPipe } from "../framework/zod-validation.pipe";
import { LoginService } from "../services/login.service";

@Controller("login")
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  post(
    @Body(new ZodValidationPipe(passwordLoginDtoSchema)) dto: PasswordLoginDto
  ): Promise<LoginResponseDto> {
    return this.loginService.login(dto);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  postByKey(
    @Body(new ZodValidationPipe(passwordLoginDtoSchema)) dto: PasswordLoginDto
  ): Promise<LoginResponseDto> {
    return this.loginService.login(dto);
  }

  @Post(":providerId")
  @HttpCode(HttpStatus.OK)
  postById(@Param("providerId", ParseIntPipe) _providerId: number): Promise<LoginResponseDto> {
    throw new NotImplementedException();
  }
}
