export const LoginMethods = {
  PASSWORD: "password",
} as const;

export type LoginMethod = (typeof LoginMethods)[keyof typeof LoginMethods];

export const Claims = {
  USER_ADMIN: "userAdmin",
} as const;

export type Claim = (typeof Claims)[keyof typeof Claims];
