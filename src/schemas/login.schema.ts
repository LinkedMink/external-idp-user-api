import {
  zodSchemaEip4361Message,
  zodTransformStringToEip4361Message,
} from "@linkedmink/eip-4361-parser/zod";
import { z } from "zod";

export const passwordLoginDtoSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const ethereumLoginDtoSchema = z.object({
  message: zodTransformStringToEip4361Message.pipe(
    zodSchemaEip4361Message.required({ requestId: true })
  ),
  signature: z.string().min(1),
});

export type EthereumLoginTransformedDto = z.infer<typeof ethereumLoginDtoSchema>;
