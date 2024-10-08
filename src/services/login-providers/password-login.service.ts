import { BadRequestException, ConsoleLogger, Injectable } from "@nestjs/common";
import { LoginMethods } from "../../config/user.const.js";
import { ValidationErrorDto } from "../../dto/errors.dto.js";
import { PasswordLoginDto } from "../../dto/login.dto.js";
import { UserDbModel } from "../../interfaces/db.types.js";
import { PasswordService } from "../password.service.js";
import { TokenSigningService } from "../token-signing.service.js";
import { UserService } from "../user.service.js";

const GENERIC_ERROR: ValidationErrorDto = {
  formErrors: ["Entered credentials are incorrect"],
  fieldErrors: {},
};

@Injectable()
export class PasswordLoginService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly tokenSigningService: TokenSigningService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService
  ) {
    logger.setContext(PasswordLoginService.name);
  }

  async login(dto: PasswordLoginDto) {
    const user = await this.userService.findByUsername(dto.username);
    if (!user) {
      this.logger.verbose(`Login attempt for not-existent user: ${dto.username}`);
      throw new BadRequestException(GENERIC_ERROR);
    }

    if (!user.passwordHash || !user.passwordSalt) {
      this.logger.verbose(`Login attempt for user without password: userId=${user.id}`);
      this.handleFailedAttempt(user);
    }

    if (user.isLocked) {
      if (user.isLockedUntil && Date.now() > user.isLockedUntil.getTime()) {
        await this.userService.unlockUser(user.id);
      } else {
        this.logger.verbose(`Login attempt from locked account: userId=${user.id}`);
        const error: ValidationErrorDto = {
          formErrors: [
            `The user has been locked${user.isLockedUntil ? ` until ${user.isLockedUntil.toISOString()}.` : ". Contact an administrator."}`,
          ],
          fieldErrors: {},
        };
        this.handleFailedAttempt(user, error);
      }
    }

    const isPasswordMatch = await this.passwordService.compareHash(
      dto.password,
      user.passwordSalt,
      user.passwordHash
    );
    if (!isPasswordMatch) {
      this.logger.verbose(`Login attempt with mismatched password: userId=${user.id}`);
      this.handleFailedAttempt(user);
    }

    const claims = Object.fromEntries(user.claims.map(c => [c.key, c.value]));
    const token = await this.tokenSigningService.sign(user.username, claims);
    await this.userService.createToken(user.id, LoginMethods.PASSWORD, token);

    return { token };
  }

  private handleFailedAttempt(user: UserDbModel, error = GENERIC_ERROR): never {
    void this.userService.setAccessFailedCount(
      user.id,
      user.accessFailedCount ? user.accessFailedCount + 1 : 1
    );
    throw new BadRequestException(error);
  }
}
