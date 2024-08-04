import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { LoginMethod } from "../config/user.const";
import { UserCreateDto, UserUpdateDto } from "../dto/user.dto";
import { PasswordService } from "./password.service";
import {
  handleDuplicateRecord,
  handleNotFound,
  resolveOrHandleDbError,
} from "./prisma-handlers.func";
import { PrismaService } from "./prisma.service";

@Injectable()
export class UserService {
  // TODO add options
  private static readonly LockoutTimeoutMs = 60 * 60 * 1000;
  private static readonly FailedCountMax = 10;
  private static readonly DefaultModifiedBy = "system";

  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService
  ) {}

  findById(id: number) {
    const resultPromise = this.prismaService.user.findUniqueOrThrow({
      where: { id },
      include: { claims: true },
    });
    return resolveOrHandleDbError(resultPromise, handleNotFound);
  }

  findByUsername(username: string) {
    return this.prismaService.user.findUnique({ where: { username }, include: { claims: true } });
  }

  async create(dto: UserCreateDto, modifiedBy = UserService.DefaultModifiedBy) {
    const password = await this.passwordService.createHash(dto.password);
    const resultPromise = this.prismaService.user.create({
      include: { claims: true },
      data: {
        createdBy: modifiedBy,
        updatedBy: modifiedBy,
        username: dto.username,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        isLocked: dto.isLocked,
        claims: {
          create: Object.entries(dto.claims).map(([key, value]) => ({ key, value })),
        },
      },
    });
    return resolveOrHandleDbError(resultPromise, handleDuplicateRecord);
  }

  async updateById(id: number, dto: UserUpdateDto, modifiedBy = UserService.DefaultModifiedBy) {
    const password = dto.password ? await this.passwordService.createHash(dto.password) : undefined;
    const claims: Prisma.UserClaimUpdateManyWithoutUserNestedInput | undefined = dto.claims
      ? {
          upsert: Object.entries(dto.claims).map(([key, value]) => ({
            where: { userId_key: { userId: id, key } },
            update: { key, value },
            create: { key, value },
          })),
          deleteMany: {
            userId: id,
            key: { notIn: Object.keys(dto.claims) },
          },
        }
      : undefined;

    const resultPromise = this.prismaService.user.update({
      where: { id },
      include: { claims: true },
      data: {
        updatedBy: modifiedBy,
        username: dto.username,
        passwordHash: password?.hash,
        passwordSalt: password?.salt,
        isLocked: dto.isLocked,
        claims,
      },
    });
    return resolveOrHandleDbError(resultPromise, handleNotFound, handleDuplicateRecord);
  }

  deleteById(id: number) {
    const resultPromise = this.prismaService.user.delete({
      where: { id },
      include: { claims: true },
    });
    return resolveOrHandleDbError(resultPromise, handleNotFound);
  }

  createToken(id: number, loginMethod: LoginMethod, value: string) {
    return this.prismaService.user.update({
      where: { id },
      data: {
        updatedBy: UserService.DefaultModifiedBy,
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
        updatedBy: UserService.DefaultModifiedBy,
        isLocked: true,
        isLockedUntil: isIndefinite ? null : UserService.getLockedUntil(),
        accessFailedCount: null,
      },
    });
  }

  unlockUser(id: number) {
    return this.prismaService.user.update({
      where: { id },
      data: {
        updatedBy: UserService.DefaultModifiedBy,
        isLocked: false,
        isLockedUntil: null,
        accessFailedCount: null,
      },
    });
  }

  setAccessFailedCount(id: number, accessFailedCount: number) {
    if (accessFailedCount > UserService.FailedCountMax) {
      return this.lockUser(id);
    }

    return this.prismaService.user.update({
      where: { id },
      data: { updatedBy: UserService.DefaultModifiedBy, accessFailedCount },
    });
  }

  private static getLockedUntil() {
    return new Date(Date.now() + UserService.LockoutTimeoutMs);
  }
}
