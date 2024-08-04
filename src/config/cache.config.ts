import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";
import { stringToJsonSchema } from "../utility/zod-schema";

const cacheConfigSchema = stringToJsonSchema.pipe(
  z.object({
    ttlMs: z.number().int().min(3000).default(5000),
    maxEntries: z.number().int().min(10).default(100),
    redis: z
      .object({
        url: z.string().url(),
        keyPrefix: z.string().min(1).optional(),
      })
      .optional(),
  })
);

export const cacheConfigLoad = registerAs("cache", () =>
  cacheConfigSchema.parse(process.env.CACHE)
);

export type CacheConfigType = ConfigType<typeof cacheConfigLoad>;
