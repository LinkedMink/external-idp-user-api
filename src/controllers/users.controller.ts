import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { UserService } from "../services/user.service";

@Controller()
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  get(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }
}
