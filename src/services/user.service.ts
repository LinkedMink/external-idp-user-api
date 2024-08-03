import { Injectable, NotImplementedException } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { PrismaService } from "./prisma.service";
import { LoginMethod } from "../config/user.const";

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService
  ) {}

  findById(id: number) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  findByUsername(username: string) {
    return this.prismaService.user.findUnique({ where: { username } });
  }

  create() {
    throw new NotImplementedException();
  }

  createToken(userId: number, loginMethod: LoginMethod, value: string) {
    return this.prismaService.userToken.create({
      data: {
        userId,
        loginMethod,
        value,
        // TODO
        validUntil: new Date(Date.now() + 120 * 60 * 1000),
      },
    });
  }

  lockUser(_id: number) {
    throw new NotImplementedException();
  }

  unlockUser(_id: number) {
    throw new NotImplementedException();
  }
}
