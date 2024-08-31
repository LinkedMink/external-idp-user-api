import {
  ConsoleLogger,
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { loggingConfigLoad, LoggingConfigType } from "../config/logging.config.js";

@Injectable()
export class PrismaService
  extends PrismaClient<{ log: { emit: "event"; level: Prisma.LogLevel }[] }>
  implements OnModuleInit, OnApplicationShutdown
{
  constructor(
    private readonly logger: ConsoleLogger,
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

    logger.setContext(PrismaService.name);

    Array.from(loggingConfig.orderedLogLevelsMap).forEach(levelMapEntry => {
      const [nestLevels, prismaLevel] = levelMapEntry[1];
      const nestLevel = nestLevels[nestLevels.length - 1];
      this.$on(prismaLevel, event => {
        if (isQueryEvent(event)) {
          this.logger[nestLevel]({
            message: event.query,
            duration: event.duration,
          });
        } else {
          this.logger[nestLevel](event.message);
        }
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

function isQueryEvent(event: Prisma.QueryEvent | Prisma.LogEvent): event is Prisma.QueryEvent {
  return !!(event as Prisma.QueryEvent).query;
}
