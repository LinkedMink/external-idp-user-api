import { z } from "zod";

export const stringToJsonSchema = z.string().transform((input, ctx) => {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" });
    return z.NEVER;
  }
});
