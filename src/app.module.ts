import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { cacheConfigFactory, cacheConfigLoad } from "./config/cache.config";
import { loggingConfigLoad } from "./config/logging.config";
import { passwordConfigLoad } from "./config/password.config";
import { signingConfigLoad } from "./config/signing.config";
import { AppController } from "./controllers/app.controller";
import { LoginController } from "./controllers/login.controller";
import { UsersController } from "./controllers/users.controller";
import { AuthenticationGuard } from "./framework/authentication.guard";
import { ClaimsGuard } from "./framework/claims.guard";
import { LoginService } from "./services/login.service";
import { PasswordService } from "./services/password.service";
import { PrismaService } from "./services/prisma.service";
import { TokenSigningService } from "./services/token-signing.service";
import { UserContextService } from "./services/user-context.service";
import { UserService } from "./services/user.service";

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: cacheConfigFactory,
      inject: [cacheConfigLoad.KEY],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cacheConfigLoad, loggingConfigLoad, passwordConfigLoad, signingConfigLoad],
    }),
  ],
  controllers: [AppController, LoginController, UsersController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClaimsGuard,
    },
    LoginService,
    PasswordService,
    PrismaService,
    TokenSigningService,
    UserContextService,
    UserService,
  ],
})
export class AppModule {}
