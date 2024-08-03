import { Injectable, NotImplementedException } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { PrismaService } from "./prisma.service";
import { LoginMethod } from "../config/user.const";

@Injectable()
export class UserService {
  // TODO add options
  private static readonly LockoutTimeoutMs = 60 * 60 * 1000;
  private static readonly FailedCountMax = 10;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService
  ) {}

  findById(id: number) {
    return this.prismaService.user.findUnique({ where: { id }, include: { claims: true } });
  }

  findByUsername(username: string) {
    return this.prismaService.user.findUnique({ where: { username }, include: { claims: true } });
  }

  create() {
    throw new NotImplementedException();
  }

  createToken(id: number, loginMethod: LoginMethod, value: string) {
    return this.prismaService.user.update({
      where: { id },
      data: {
        accessFailedCount: null,
        tokens: {
          create: {
            loginMethod,
            value,
          },
        },
      },
    });
  }

  lockUser(id: number, isIndefinite = false) {
    return this.prismaService.user.update({
      where: { id },
      data: {
        isLocked: true,
        isLockedUntil: isIndefinite ? null : this.getLockedUntil(),
        accessFailedCount: null,
      },
    });
  }

  unlockUser(id: number) {
    return this.prismaService.user.update({
      where: { id },
      data: { isLocked: false, isLockedUntil: null, accessFailedCount: null },
    });
  }

  setAccessFailedCount(id: number, accessFailedCount: number) {
    if (accessFailedCount > UserService.FailedCountMax) {
      return this.lockUser(id);
    }

    return this.prismaService.user.update({
      where: { id },
      data: { accessFailedCount },
    });
  }

  private getLockedUntil() {
    return new Date(Date.now() + UserService.LockoutTimeoutMs);
  }
}
