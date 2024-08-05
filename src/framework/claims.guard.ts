import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ResponseWithJwt } from "../interfaces/request.types";
import { CLAIMS_KEY, RequiredClaimsEntries } from "./authentication.decorator";

@Injectable()
export class ClaimsGuard implements CanActivate {
  private readonly logger = new Logger(ClaimsGuard.name);

  constructor(private readonly reflector: Reflector) {}

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
