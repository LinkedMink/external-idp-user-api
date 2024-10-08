export const DEFAULT_MODIFIED_BY = "system";

export const LoginMethods = {
  PASSWORD: "password",
  ETHEREUM: "ethereum",
} as const;

export type LoginMethod = (typeof LoginMethods)[keyof typeof LoginMethods];

export const Claims = {
  USERS: "users",
  LOGIN_METHOD: "loginMethod",
} as const;

export const ClaimsAccessLevel = {
  ADMIN: "admin",
} as const;

export type Claim = (typeof Claims)[keyof typeof Claims];
