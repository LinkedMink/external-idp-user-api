import { CanActivate, ConsoleLogger, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ResponseWithJwt } from "../interfaces/request.types.js";
import { CLAIMS_KEY, RequiredClaimsEntries } from "./authentication.decorator.js";

@Injectable()
export class ClaimsGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly reflector: Reflector
  ) {
    logger.setContext(ClaimsGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredClaims = this.reflector.getAllAndOverride<RequiredClaimsEntries | undefined>(
      CLAIMS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredClaims) {
      return true;
    }

    const response = context.switchToHttp().getResponse<ResponseWithJwt>();
    const user = response.locals.user;

    const hasClaims = requiredClaims.every(([key, value]) => user[key] === value);
    if (!hasClaims) {
      this.logger.warn(
        `User does not have required claims: sub=${user.sub}, required=${requiredClaims.toString()}`
      );
    }

    return hasClaims;
  }
}
