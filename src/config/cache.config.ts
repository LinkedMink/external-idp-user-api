import KeyvRedis from "@keyv/redis";
import { CacheManagerOptions, CacheOptions } from "@nestjs/cache-manager";
import { ConsoleLogger } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";
import { stringToJsonSchema } from "../schemas/json.schema.js";

const cacheConfigSchema = stringToJsonSchema.pipe(
  z.object({
    ttlMs: z.number().int().min(3000).default(5000),
    maxEntries: z.number().int().min(10).default(100),
    redis: z
      .object({
        url: z.url(),
        keyPrefix: z.string().min(1).optional(),
      })
      .optional(),
  }),
);

export const cacheConfigLoad = registerAs("cache", () =>
  cacheConfigSchema.parse(process.env.CACHE),
);

export type CacheConfigType = ConfigType<typeof cacheConfigLoad>;

export const cacheConfigFactory = (
  cacheConfig: CacheConfigType,
  logger: ConsoleLogger,
): CacheOptions<CacheManagerOptions> => {
  // TODO no in-memory support
  // if (!cacheConfig.redis) {
  //   logger.log("No Redis config set, use in-memory cache", "CacheConfig");
  //   return {
  //     ttl: cacheConfig.ttlMs,
  //     stores: [
  //       new KeyvAdapter()
  //     ],
  //   };
  // }

  logger.setContext("Redis");
  // const client = createClient({
  //   socket: {
  //     reconnectStrategy: (retries: number) =>
  //       retries < 5 ? 500 : new Error("Failed to connect to Redis after 5 tries"),
  //   },
  //   ...cacheConfig.redis,
  // })
  //   .on("connect", () => {
  //     logger.verbose("Connecting to Redis");
  //   })
  //   .on("ready", () => {
  //     logger.log("Connection to Redis ready for commands");
  //   })
  //   .on("end", () => {
  //     logger.verbose("Disconnected from Redis");
  //   })
  //   .on("reconnecting", () => {
  //     logger.verbose("Connecting to Redis");
  //   })
  //   .on("error", (error) => {
  //     if (isNativeError(error)) {
  //       logger.error(error.message, error.stack);
  //     } else {
  //       logger.error(error);
  //     }
  //   });
  const redisKv = new KeyvRedis(
    {
      socket: {
        reconnectStrategy: (retries: number) =>
          retries < 5 ? 500 : new Error("Failed to connect to Redis after 5 tries"),
      },
      url: cacheConfig.redis?.url,
    },
    { namespace: cacheConfig.redis?.keyPrefix },
  );

  // await client.connect();
  return {
    ttl: cacheConfig.ttlMs,
    stores: [redisKv],
  };

  // try {
  //   await client.connect();
  //   return {
  //     ttl: cacheConfig.ttlMs,
  //     max: cacheConfig.maxEntries,
  //     stores: [
  //       // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  //       createKeyv(client) as Keyv,
  //     ],
  //   };
  // } catch (error) {
  //   logger.error(error);
  //   logger.warn("Using in-memory cache instead of Redis", "CacheConfig");
  //   return {
  //     ttl: cacheConfig.ttlMs,
  //     max: cacheConfig.maxEntries,
  //     store: "memory",
  //   };
  // }
};
