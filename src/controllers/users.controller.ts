import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { RequiredClaims } from "../framework/authentication.decorator";
import { Claims } from "../config/user.const";

@Controller()
@RequiredClaims(Claims.USER_ADMIN)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  get(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }
}
