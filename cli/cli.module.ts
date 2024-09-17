import { ConsoleLogger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { loggingConfigLoad, LoggingConfigType } from "../src/config/logging.config.js";
import { passwordConfigLoad } from "../src/config/password.config.js";
import { PasswordService } from "../src/services/password.service.js";
import { PrismaService } from "../src/services/prisma.service.js";
import { UserService } from "../src/services/user.service.js";
import { WinstonLoggerService } from "../src/services/winston-logger.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [loggingConfigLoad, passwordConfigLoad],
    }),
  ],
  providers: [
    {
      provide: ConsoleLogger,
      useClass: WinstonLoggerService,
    },
    {
      provide: PasswordService,
      useClass: PasswordService,
    },
    {
      // TODO not sure why it's not auto resolving dependencies
      provide: PrismaService,
      useFactory: (logger: ConsoleLogger, loggingConfig: LoggingConfigType) =>
        new PrismaService(logger, loggingConfig),
      inject: [ConsoleLogger, loggingConfigLoad.KEY],
    },
    {
      provide: UserService,
      useFactory: (prismaService: PrismaService, passwordService: PasswordService) =>
        new UserService(prismaService, passwordService),
      inject: [PrismaService, PasswordService],
    },
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CliModule {}
