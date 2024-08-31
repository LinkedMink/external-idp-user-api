import { Eip4361Message, verifyEip4361Message } from "@linkedmink/eip-4361-parser";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { BadRequestException, ConsoleLogger, Inject, Injectable } from "@nestjs/common";
import { ethers } from "ethers";
import { randomBytes, randomUUID } from "node:crypto";
import { isNativeError } from "node:util/types";
import { LoginMethods } from "../../config/user.const.js";
import { ValidationErrorDto } from "../../dto/errors.dto.js";
import { EthereumLoginTransformedDto } from "../../schemas/login.schema.js";
import { TokenSigningService } from "../token-signing.service.js";
import { UserService } from "../user.service.js";

@Injectable()
export class EthereumLoginService {
  private static readonly RequestIdKeyPrefix = "eth:id";
  private static readonly RequestIdTtlMs = 60_000;
  private static readonly NonceBytes = 12;
  // TODO maybe use proportional value of transactions with count
  private static readonly MinEthTransactions = 5;

  constructor(
    private readonly logger: ConsoleLogger,
    private readonly tokenSigningService: TokenSigningService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    logger.setContext(EthereumLoginService.name);
  }

  async init() {
    const requestId = randomUUID();
    const nonce = randomBytes(EthereumLoginService.NonceBytes).toString("hex");

    await this.cacheManager.set(
      `${EthereumLoginService.RequestIdKeyPrefix}:${requestId}`,
      nonce,
      EthereumLoginService.RequestIdTtlMs
    );

    this.logger.debug(`Starting login with ID: ${requestId}, ${nonce}`);

    return { nonce, requestId };
  }

  async login(dto: EthereumLoginTransformedDto) {
    const nonceKey = `${EthereumLoginService.RequestIdKeyPrefix}:${dto.message.requestId}`;
    const nonce = await this.cacheManager.get<string>(nonceKey);

    if (!nonce) {
      const nonceError: ValidationErrorDto = {
        formErrors: ["No login has started for the signed message"],
        fieldErrors: {},
      };
      throw new BadRequestException(nonceError);
    }

    await this.verifyMessage(dto.message, dto.signature, nonce);

    const user = await this.getUserRecord(dto.message.address);

    const claims = Object.fromEntries(user.claims.map(c => [c.key, c.value]));
    const token = await this.tokenSigningService.sign(user.username, claims);

    await Promise.all([
      this.cacheManager.del(nonceKey),
      this.userService.createToken(user.id, LoginMethods.PASSWORD, token),
    ]);

    return { token };
  }

  private async getUserRecord(address: string) {
    const user = await this.userService.findByUsername(address);
    if (user) {
      return user;
    }

    const transactionCount = await ethers.getDefaultProvider().getTransactionCount(address);
    if (transactionCount < EthereumLoginService.MinEthTransactions) {
      const verifyError: ValidationErrorDto = {
        formErrors: ["The account does not have sufficient transaction history."],
        fieldErrors: {},
      };
      throw new BadRequestException(verifyError);
    }

    return this.userService.createByProvider(address, LoginMethods.ETHEREUM);
  }

  private async verifyMessage(message: Eip4361Message, signature: string, nonce: string) {
    try {
      // TODO get allowed domains
      await verifyEip4361Message(message, { signature, nonce }, {});
    } catch (error) {
      if (isNativeError(error)) {
        const verifyError: ValidationErrorDto = {
          formErrors: [error.message],
          fieldErrors: {},
        };
        throw new BadRequestException(verifyError);
      }

      throw error;
    }
  }
}
