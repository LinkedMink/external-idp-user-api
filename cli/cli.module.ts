import { ConsoleLogger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { loggingConfigLoad } from "../src/config/logging.config.js";
import { passwordConfigLoad } from "../src/config/password.config.js";
import { PasswordService } from "../src/services/password.service.js";
import { PrismaService } from "../src/services/prisma.service.js";
import { UserService } from "../src/services/user.service.js";
import { WinstonLoggerService } from "../src/services/winston-logger.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loggingConfigLoad, passwordConfigLoad],
    }),
  ],
  providers: [
    {
      provide: ConsoleLogger,
      useClass: WinstonLoggerService,
    },
    PasswordService,
    PrismaService,
    UserService,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CliModule {}
