import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { loggingConfigLoad, LoggingConfigType } from "../config/logging.config";

@Injectable()
export class PrismaService
  extends PrismaClient<{ log: { emit: "event"; level: Prisma.LogLevel }[] }>
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    @Inject(loggingConfigLoad.KEY)
    loggingConfig: LoggingConfigType
  ) {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "error" },
      ],
    });

    Array.from(loggingConfig.orderedLogLevelsMap).forEach(levelMapEntry => {
      const [nestLevels, prismaLevel] = levelMapEntry[1];
      const nestLevel = nestLevels[nestLevels.length - 1];
      this.$on(prismaLevel, event => {
        this.logger[nestLevel](event);
      });
    });
  }

  onModuleInit() {
    return this.$connect();
  }

  onApplicationShutdown(_signal?: string) {
    return this.$disconnect();
  }
}
