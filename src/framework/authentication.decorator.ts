import { SetMetadata } from "@nestjs/common";
import { Claim } from "../config/user.const";

export const IS_ANONYMOUS_ALLOWED_KEY = "isAnonymousAllowed";
export const AllowAnonymous = () => SetMetadata(IS_ANONYMOUS_ALLOWED_KEY, true);

export type RequiredClaimsEntries = [[Claim, string], ...[Claim, string][]];

export const CLAIMS_KEY = "claims";
export const RequiredClaims = (...claims: RequiredClaimsEntries) => SetMetadata(CLAIMS_KEY, claims);
