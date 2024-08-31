import {
  CanActivate,
  ConsoleLogger,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ContextIdFactory, ModuleRef, Reflector } from "@nestjs/core";
import { RequestWithJwt } from "../interfaces/request.types.js";
import { TokenSigningService } from "../services/token-signing.service.js";
import { UserContextService } from "../services/user-context.service.js";
import { IS_ANONYMOUS_ALLOWED_KEY } from "./authentication.decorator.js";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly reflector: Reflector,
    private readonly tokenSigningService: TokenSigningService,
    private readonly moduleRef: ModuleRef
  ) {
    logger.setContext(AuthenticationGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAnonymousAllowed = this.reflector.getAllAndOverride<boolean>(IS_ANONYMOUS_ALLOWED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isAnonymousAllowed) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithJwt>();

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

    const requestContextId = ContextIdFactory.getByRequest(request);
    const userContextService = await this.moduleRef.resolve(UserContextService, requestContextId);
    userContextService.user = payload;
    if (request.res) {
      request.res.locals["user"] = payload;
    }

    return true;
  }
}
