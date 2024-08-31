import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { Claims, ClaimsAccessLevel } from "../config/user.const.js";
import { RequiredClaims } from "../framework/authentication.decorator.js";
import { UsersTransformInterceptor } from "../framework/users-transform.interceptor.js";
import { ZodValidationPipe } from "../framework/zod-validation.pipe.js";
import {
  userCreateDtoSchema,
  UserCreateTransformedDto,
  userUpdateDtoSchema,
  UserUpdateTransformedDto,
} from "../schemas/user.schema.js";
import { UserContextService } from "../services/user-context.service.js";
import { UserService } from "../services/user.service.js";

@Controller("users")
@RequiredClaims([Claims.USERS, ClaimsAccessLevel.ADMIN])
@UseInterceptors(new UsersTransformInterceptor())
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly userContextService: UserContextService
  ) {}

  @Get(":id")
  get(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Post()
  post(@Body(new ZodValidationPipe(userCreateDtoSchema)) dto: UserCreateTransformedDto) {
    return this.userService.create(dto, this.userContextService.user.sub);
  }

  @Patch(":id")
  patch(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(userUpdateDtoSchema)) dto: UserUpdateTransformedDto
  ) {
    return this.userService.updateById(id, dto, this.userContextService.user.sub);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.userService.deleteById(id);
  }
}
