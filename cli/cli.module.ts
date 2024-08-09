import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { loggingConfigLoad } from "../src/config/logging.config";
import { passwordConfigLoad } from "../src/config/password.config";
import { PasswordService } from "../src/services/password.service";
import { PrismaService } from "../src/services/prisma.service";
import { UserService } from "../src/services/user.service";

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
