import { Body, Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { RequiredClaims } from "../framework/authentication.decorator";
import { Claims } from "../config/user.const";
import { ZodValidationPipe } from "../framework/zod-validation.pipe";
import {
  UserCreateDto,
  userCreateDtoSchema,
  UserUpdateDto,
  userUpdateDtoSchema,
} from "../dto/user.dto";

@Controller()
@RequiredClaims(Claims.USER_ADMIN)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  get(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Get()
  post(@Body(new ZodValidationPipe(userCreateDtoSchema)) dto: UserCreateDto) {
    return this.userService.create(dto);
  }

  @Get(":id")
  patch(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(userUpdateDtoSchema)) dto: UserUpdateDto
  ) {
    return this.userService.update(id, dto);
  }

  @Get(":id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }
}
