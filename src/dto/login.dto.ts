import { z } from "zod";

export const passwordLoginDtoSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type PasswordLoginDto = z.infer<typeof passwordLoginDtoSchema>;

export interface LoginResponseDto {
  token: string;
}
