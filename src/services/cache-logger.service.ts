/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class CacheLoggerService implements OnModuleInit {
  private readonly cacheLogger = new Logger(CacheLoggerService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  onModuleInit() {
    this.cacheManager.on("set", (event) => {
      if (event.error instanceof Error) {
        this.cacheLogger.warn(
          `Error setting: key=${event.key}; value=${event.value}; ${event.error.message}` +
            event.error.message,
          event.error.stack,
        );
      }
    });

    this.cacheManager.on("clear", (error) => {
      if (error instanceof Error) {
        this.cacheLogger.warn(`Error clearing: ${error.message}`, error.stack);
      }
    });

    this.cacheManager.on("del", (event) => {
      if (event.error instanceof Error) {
        this.cacheLogger.warn(
          `Error deleting: key=${event.key}; ${event.error.message}`,
          event.error.stack,
        );
      }
    });

    this.cacheManager.on("refresh", (event) => {
      if (event.error instanceof Error) {
        this.cacheLogger.warn(
          `Error refreshing: key=${event.key}; value=${event.value}; ${event.error.message}`,
          event.error.stack,
        );
      }
    });
  }
}
