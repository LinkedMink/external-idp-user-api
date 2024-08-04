import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";
import { stringToJsonSchema } from "../utility/zod-schema";

const passwordConfigSchema = stringToJsonSchema.pipe(
  z.object({
    saltBytes: z.number().int().min(8).default(16),
    hashBytes: z.number().int().min(16).default(32),
  })
);

export const passwordConfigLoad = registerAs("password", () =>
  passwordConfigSchema.parse(process.env.PASSWORD)
);

export type PasswordConfigType = ConfigType<typeof passwordConfigLoad>;
