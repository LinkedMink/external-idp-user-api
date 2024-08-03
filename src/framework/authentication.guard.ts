import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type { Query } from "express-serve-static-core";
import { TokenSigningService } from "../services/token-signing.service";
import type { JWTPayload } from "jose";
import { Reflector } from "@nestjs/core";
import { IS_ANONYMOUS_ALLOWED_KEY } from "./authentication.decorator";

type RequestWithJwt = Request<
  {
    [key: string]: string;
  },
  unknown,
  unknown,
  Query,
  { user: JWTPayload }
>;

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tokenSigningService: TokenSigningService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAnonymousAllowed = this.reflector.getAllAndOverride<boolean>(IS_ANONYMOUS_ALLOWED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isAnonymousAllowed) {
      return true;
    }

    const request = context.switchToHttp().getResponse() as RequestWithJwt;

    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    if (!token || type !== "Bearer") {
      this.logger.warn(`No Bearer token in Authorization header: IP=${request.ip}`);
      throw new UnauthorizedException();
    }

    const payload = await this.tokenSigningService.verify(token);
    if (!payload) {
      this.logger.warn(`Failed to verify access token: IP=${request.ip}`);
      throw new UnauthorizedException();
    }

    this.logger.debug(`Verified user token: IP=${request.ip}, sub=${payload.sub}`);

    request.res!.locals["user"] = payload;
    return true;
  }
}
