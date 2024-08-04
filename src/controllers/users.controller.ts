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
import { Claims, ClaimsAccessLevel } from "../config/user.const";
import {
  UserCreateDto,
  userCreateDtoSchema,
  UserUpdateDto,
  userUpdateDtoSchema,
} from "../dto/user.dto";
import { RequiredClaims } from "../framework/authentication.decorator";
import { UsersTransformInterceptor } from "../framework/users-transform.interceptor";
import { ZodValidationPipe } from "../framework/zod-validation.pipe";
import { UserContextService } from "../services/user-context.service";
import { UserService } from "../services/user.service";

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
  post(@Body(new ZodValidationPipe(userCreateDtoSchema)) dto: UserCreateDto) {
    return this.userService.create(dto, this.userContextService.user.sub);
  }

  @Patch(":id")
  patch(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(userUpdateDtoSchema)) dto: UserUpdateDto
  ) {
    return this.userService.updateById(id, dto, this.userContextService.user.sub);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.userService.deleteById(id);
  }
}
