import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Claims, DEFAULT_MODIFIED_BY, LoginMethod } from "../config/user.const.js";
import { IdDbModel, UserClaimsDbModel } from "../interfaces/db.types.js";
import { UserCreateTransformedDto, UserUpdateTransformedDto } from "../schemas/user.schema.js";
import { PasswordService } from "./password.service.js";
import {
  handleDuplicateRecord,
  handleNotFound,
  resolveOrHandleDbError,
} from "./prisma-handlers.func.js";
import { PrismaService } from "./prisma.service.js";

/**
 * TODO Use cache manager as intermediary to DB
 */
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

  async create(
    dto: UserCreateTransformedDto,
    modifiedBy = DEFAULT_MODIFIED_BY
  ): Promise<UserClaimsDbModel> {
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

  async createByProvider(
    username: string,
    loginMethod: LoginMethod,
    claims: Record<string, string> = {}
  ): Promise<UserClaimsDbModel> {
    const modifiedBy = `${loginMethod}(${username})`;
    const resultPromise = this.prismaService.user.create({
      include: { claims: true },
      data: {
        createdBy: modifiedBy,
        updatedBy: modifiedBy,
        username: username,
        isLocked: false,
        claims: {
          create: [
            ...Object.entries(claims).map(([key, value]) => ({ key, value })),
            { key: Claims.LOGIN_METHOD, value: loginMethod },
          ],
        },
      },
    });
    return resolveOrHandleDbError(resultPromise, handleDuplicateRecord);
  }

  async updateById(
    id: number,
    dto: UserUpdateTransformedDto,
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
