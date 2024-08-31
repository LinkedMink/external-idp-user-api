import { z } from "zod";

export const userCreateDtoSchema = z.object({
  username: z.string().min(4),
  // TODO options for complexity
  password: z.string().min(8),
  isLocked: z.boolean().default(false),
  // TODO support complex claims
  claims: z.record(z.string().min(1), z.string().min(1)).default({}),
});

export const userUpdateDtoSchema = userCreateDtoSchema.partial();

export type UserCreateTransformedDto = z.infer<typeof userCreateDtoSchema>;
export type UserUpdateTransformedDto = z.infer<typeof userUpdateDtoSchema>;
