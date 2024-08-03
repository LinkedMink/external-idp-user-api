import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { TokenSigningService } from "./token-signing.service";
import { UserService } from "./user.service";
import { PasswordLoginDto } from "../dto/login.dto";
import { ValidationErrorDto } from "../dto/errors.dto";

const GENERIC_ERROR: ValidationErrorDto = {
  formErrors: ["Entered credentials are incorrect"],
  fieldErrors: {},
};

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private readonly tokenSigningService: TokenSigningService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService
  ) {}

  async login(dto: PasswordLoginDto) {
    const user = await this.userService.findByUsername(dto.username);
    if (!user || !user.passwordHash || !user.passwordSalt) {
      this.logger.verbose(
        `Login attempt ${!user ? `for not-existent user: ${dto.username}` : "for user without password"}`
      );
      throw new BadRequestException(GENERIC_ERROR);
    }

    if (user.isLocked) {
      if (user.isLockedUntil && Date.now() > user.isLockedUntil.getTime()) {
        this.userService.unlockUser(user.id);
      } else {
        this.logger.verbose(`Login attempt from locked account: userId=${user.id}`);
        throw new BadRequestException(GENERIC_ERROR);
      }
    }

    const isPasswordMatch = this.passwordService.compareHash(
      dto.password,
      user.passwordSalt,
      user.passwordHash
    );
    if (!isPasswordMatch) {
      this.logger.verbose(`Login attempt with mismatched password: userId=${user.id}`);
      throw new BadRequestException(GENERIC_ERROR);
    }

    // TODO save token
    const token = await this.tokenSigningService.sign(user.username);

    return { token };
  }
}
