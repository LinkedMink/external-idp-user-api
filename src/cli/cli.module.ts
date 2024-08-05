import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { loggingConfigLoad } from "../config/logging.config";
import { passwordConfigLoad } from "../config/password.config";
import { PasswordService } from "../services/password.service";
import { PrismaService } from "../services/prisma.service";
import { UserService } from "../services/user.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loggingConfigLoad, passwordConfigLoad],
    }),
  ],
  providers: [PasswordService, PrismaService, UserService],
})
export class CliModule {}
