import type { LogLevel as NestLogLevel } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";
import type { Prisma } from "@prisma/client";
import { config } from "winston";
import { z } from "zod";
import { stringToJsonSchema } from "../utility/zod-schema";

export const LogLevels = {
  error: config.npm.levels.error,
  warn: config.npm.levels.warn,
  info: config.npm.levels.info,
  debug: config.npm.levels.debug,
} as const;

type LogLevel = keyof typeof LogLevels;

const OrderedLogLevelsMap = new Map<LogLevel, [NestLogLevel[], Prisma.LogLevel]>([
  ["error", [["fatal", "error"], "error"]],
  ["warn", [["warn"], "warn"]],
  ["info", [["log"], "info"]],
  ["debug", [["verbose", "debug"], "query"]],
]);

const loggingConfigSchema = stringToJsonSchema.optional().pipe(
  z
    .object({
      level: z.enum(Object.keys(LogLevels) as ["error", "warn", "info", "debug"]).default("info"),
      isStackTraceLogged: z.boolean().default(process.env.NODE_ENV !== "production"),
    })
    .optional()
    .transform(config => ({
      ...config,
      orderedLogLevelsMap: OrderedLogLevelsMap,
    }))
);

export const loggingConfigLoad = registerAs("logging", () =>
  loggingConfigSchema.parse(process.env.LOGGING)
);

export type LoggingConfigType = ConfigType<typeof loggingConfigLoad>;
