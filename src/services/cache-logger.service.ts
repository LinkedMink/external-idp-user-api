import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cache } from "cache-manager";
import { isNativeError } from "util/types";

type SingleKeyError<T> = {
  operation: "get" | "set" | "del" | "reset";
  error: unknown;
  key?: string;
  data?: T;
};
type MultiKeyError<T> = {
  operation: "mget" | "mset" | "mdel";
  error: unknown;
  keys: string[];
  data?: T[];
};

@Injectable()
export class CacheLoggerService implements OnModuleInit {
  private readonly cacheLogger = new Logger(CacheLoggerService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  onModuleInit() {
    this.cacheManager.on("error", event => {
      const keys = CacheLoggerService.isSingleKeyError(event) ? event.key : event.keys.toString();
      const message = `Error performing operation on key(s): op=${event.operation}; keys=${keys}; `;
      if (isNativeError(event.error)) {
        this.cacheLogger.error(message + event.error.message, event.error.stack);
      } else {
        this.cacheLogger.error(`${message}${event.error as string}`);
      }
    });
  }

  private static isSingleKeyError<T>(
    value: SingleKeyError<T> | MultiKeyError<T>
  ): value is SingleKeyError<T> {
    return !!(value as SingleKeyError<T>).key;
  }
}
