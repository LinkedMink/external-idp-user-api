import { Injectable, NotImplementedException } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { PrismaService } from "./prisma.service";

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

  lockUser(_id: number) {
    throw new NotImplementedException();
  }

  unlockUser(_id: number) {
    throw new NotImplementedException();
  }
}
