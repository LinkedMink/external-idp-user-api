import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CLAIMS_KEY } from "./authentication.decorator";
import { Claim } from "../config/user.const";
import { ResponseWithJwt } from "../interfaces/request.types";

@Injectable()
export class ClaimsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredClaims = this.reflector.getAllAndOverride<Claim[]>(CLAIMS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredClaims) {
      return true;
    }

    const response = context.switchToHttp().getRequest<ResponseWithJwt>();
    return requiredClaims.every(claim => !!response.locals.user[claim]);
  }
}
