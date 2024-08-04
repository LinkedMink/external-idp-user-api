import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { loggingConfigLoad } from "./config/logging.config";
import { passwordConfigLoad } from "./config/password.config";
import { signingConfigLoad } from "./config/signing.config";
import { AppController } from "./controllers/app.controller";
import { LoginController } from "./controllers/login.controller";
import { UsersController } from "./controllers/users.controller";
import { LoginService } from "./services/login.service";
import { PasswordService } from "./services/password.service";
import { PrismaService } from "./services/prisma.service";
import { TokenSigningService } from "./services/token-signing.service";
import { UserService } from "./services/user.service";

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loggingConfigLoad, passwordConfigLoad, signingConfigLoad],
    }),
  ],
  controllers: [AppController, LoginController, UsersController],
  providers: [LoginService, PasswordService, PrismaService, TokenSigningService, UserService],
})
export class AppModule {}
