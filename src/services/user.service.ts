import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DEFAULT_MODIFIED_BY, LoginMethod } from "../config/user.const";
import { UserCreateDto, UserUpdateDto } from "../dto/user.dto";
import { IdDbModel, UserClaimsDbModel } from "../interfaces/db.types";
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

  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService
  ) {}

  findById(id: number): Promise<UserClaimsDbModel> {
    const resultPromise = this.prismaService.user.findUniqueOrThrow({
      where: { id },
      include: { claims: true },
    });
    return resolveOrHandleDbError(resultPromise, handleNotFound);
  }

  findByUsername(username: string): Promise<UserClaimsDbModel | null> {
    return this.prismaService.user.findUnique({ where: { username }, include: { claims: true } });
  }

  async create(dto: UserCreateDto, modifiedBy = DEFAULT_MODIFIED_BY): Promise<UserClaimsDbModel> {
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

  async updateById(
    id: number,
    dto: UserUpdateDto,
    modifiedBy = DEFAULT_MODIFIED_BY
  ): Promise<UserClaimsDbModel> {
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

  deleteById(id: number): Promise<IdDbModel> {
    const resultPromise = this.prismaService.user.delete({
      select: { id: true },
      where: { id },
    });
    return resolveOrHandleDbError(resultPromise, handleNotFound);
  }

  createToken(id: number, loginMethod: LoginMethod, value: string): Promise<IdDbModel> {
    return this.prismaService.user.update({
      select: { id: true },
      where: { id },
      data: {
        updatedBy: DEFAULT_MODIFIED_BY,
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

  lockUser(id: number, isIndefinite = false): Promise<IdDbModel> {
    return this.prismaService.user.update({
      select: { id: true },
      where: { id },
      data: {
        updatedBy: DEFAULT_MODIFIED_BY,
        isLocked: true,
        isLockedUntil: isIndefinite ? null : UserService.getLockedUntil(),
        accessFailedCount: null,
      },
    });
  }

  unlockUser(id: number): Promise<IdDbModel> {
    return this.prismaService.user.update({
      select: { id: true },
      where: { id },
      data: {
        updatedBy: DEFAULT_MODIFIED_BY,
        isLocked: false,
        isLockedUntil: null,
        accessFailedCount: null,
      },
    });
  }

  setAccessFailedCount(id: number, accessFailedCount: number): Promise<IdDbModel> {
    if (accessFailedCount > UserService.FailedCountMax) {
      return this.lockUser(id);
    }

    return this.prismaService.user.update({
      select: { id: true },
      where: { id },
      data: { updatedBy: DEFAULT_MODIFIED_BY, accessFailedCount },
    });
  }

  private static getLockedUntil() {
    return new Date(Date.now() + UserService.LockoutTimeoutMs);
  }
}
