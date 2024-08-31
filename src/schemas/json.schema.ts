import { z } from "zod";

export type JsonLiteral = string | number | boolean | null;
export type JsonToken = JsonLiteral | { [key: string]: JsonToken } | JsonToken[];

export const stringToJsonSchema = z.string().transform((input, ctx) => {
  try {
    return JSON.parse(input) as JsonToken;
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" });
    return z.NEVER;
  }
});
