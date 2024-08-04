import { z } from "zod";
import { UserClaimsDbModel } from "../interfaces/db.types";

export const userCreateDtoSchema = z.object({
  username: z.string().min(4),
  // TODO options for complexity
  password: z.string().min(8),
  isLocked: z.boolean().default(false),
  // TODO support complex claims
  claims: z.record(z.string().min(1), z.string().min(1)).default({}),
});

export const userUpdateDtoSchema = userCreateDtoSchema.partial();

export type UserCreateDto = z.infer<typeof userCreateDtoSchema>;
export type UserUpdateDto = z.infer<typeof userUpdateDtoSchema>;

export type UserResponseDto = Omit<
  UserClaimsDbModel,
  "claims" | "passwordHash" | "passwordSalt"
> & {
  claims: Record<string, string>;
};
