import type { Prisma } from "@prisma/client";

export type UserDbModel = Prisma.$UserPayload["scalars"];
export type UserClaimsDbModel = UserDbModel & {
  claims: Prisma.$UserClaimPayload["scalars"][];
};
export type UserRelationsDbModel = UserClaimsDbModel & {
  tokens: Prisma.$UserTokenPayload["scalars"][];
};
