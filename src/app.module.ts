import { CacheModule } from "@nestjs/cache-manager";
import { ConsoleLogger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { cacheConfigFactory, cacheConfigLoad } from "./config/cache.config.js";
import { loggingConfigLoad } from "./config/logging.config.js";
import { passwordConfigLoad } from "./config/password.config.js";
import { signingConfigLoad } from "./config/signing.config.js";
import { AppController } from "./controllers/app.controller.js";
import { PasswordLoginController } from "./controllers/password-login.controller.js";
import { UsersController } from "./controllers/users.controller.js";
import { AuthenticationGuard } from "./framework/authentication.guard.js";
import { ClaimsGuard } from "./framework/claims.guard.js";
import { CacheLoggerService } from "./services/cache-logger.service.js";
import { PasswordLoginService } from "./services/login-providers/password-login.service.js";
import { PasswordService } from "./services/password.service.js";
import { PrismaService } from "./services/prisma.service.js";
import { TokenSigningService } from "./services/token-signing.service.js";
import { UserContextService } from "./services/user-context.service.js";
import { UserService } from "./services/user.service.js";
import { WinstonLoggerService } from "./services/winston-logger.service.js";
import { EthereumLoginController } from "./controllers/ethereum-login.controller.js";
import { EthereumLoginService } from "./services/login-providers/ethereum-login.service.js";

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: cacheConfigFactory,
      inject: [cacheConfigLoad.KEY, ConsoleLogger],
      extraProviders: [
        CacheLoggerService,
        {
          provide: ConsoleLogger,
          useClass: WinstonLoggerService,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [cacheConfigLoad, loggingConfigLoad, passwordConfigLoad, signingConfigLoad],
    }),
  ],
  controllers: [AppController, EthereumLoginController, PasswordLoginController, UsersController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClaimsGuard,
    },
    {
      provide: ConsoleLogger,
      useClass: WinstonLoggerService,
    },
    EthereumLoginService,
    PasswordLoginService,
    PasswordService,
    PrismaService,
    TokenSigningService,
    UserContextService,
    UserService,
  ],
})
export class AppModule {}
