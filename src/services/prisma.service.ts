import {
  ConsoleLogger,
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { loggingConfigLoad, LoggingConfigType } from "../config/logging.config.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  private static readonly SchemaName = "external_idp";

  constructor(
    private readonly logger: ConsoleLogger,
    @Inject(loggingConfigLoad.KEY)
    loggingConfig: LoggingConfigType,
  ) {
    // TODO Inject database config
    const adapter = new PrismaPg(
      {
        connectionString: process.env.DATABASE_URL,
      },
      {
        schema: PrismaService.SchemaName,
      },
    );

    super({
      adapter,
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "error" },
      ],
    });

    this.logger.setContext(PrismaService.name);

    Array.from(loggingConfig.orderedLogLevelsMap).forEach((levelMapEntry) => {
      const [nestLevels, prismaLevel] = levelMapEntry[1];
      const nestLevel = nestLevels[nestLevels.length - 1];
      (
        this.$on as <E extends Prisma.LogLevel>(
          eventType: E,
          callback: (event: E extends "query" ? Prisma.QueryEvent : Prisma.LogEvent) => void,
        ) => void
      )(prismaLevel, (event) => {
        if ("query" in event) {
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
