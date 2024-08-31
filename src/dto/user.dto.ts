export type UserCreateDto = {
  username: string;
  password: string;
  isLocked?: boolean;
  claims?: Record<string, string>;
};

export type UserUpdateDto = Partial<UserCreateDto>;

export type UserResponseDto = {
  id: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  username: string;
  accessFailedCount: number | null;
  isLocked: boolean;
  isLockedUntil: Date | null;
};

export type UserClaimsResponseDto = UserResponseDto & {
  claims: Record<string, string>;
};
