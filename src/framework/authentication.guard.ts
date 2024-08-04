import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ContextIdFactory, ModuleRef, Reflector } from "@nestjs/core";
import { TokenSigningService } from "../services/token-signing.service";
import { IS_ANONYMOUS_ALLOWED_KEY } from "./authentication.decorator";
import { RequestWithJwt } from "../interfaces/request.types";
import { UserContextService } from "../services/user-context.service";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tokenSigningService: TokenSigningService,
    private readonly moduleRef: ModuleRef
  ) {}

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

    request.res!.locals["user"] = payload;
    const requestContextId = ContextIdFactory.getByRequest(request);
    const userContextService = await this.moduleRef.resolve(UserContextService, requestContextId);
    userContextService.user = payload;

    return true;
  }
}
