import type { Prisma } from "../generated/prisma/client.js";

export interface IdDbModel {
  id: number;
}

export type UserDbModel = Prisma.$UserPayload["scalars"];
export type UserClaimsDbModel = UserDbModel & {
  claims: Prisma.$UserClaimPayload["scalars"][];
};
export type UserRelationsDbModel = UserClaimsDbModel & {
  tokens: Prisma.$UserTokenPayload["scalars"][];
};
