import { SetMetadata } from "@nestjs/common";
import { Claim } from "../config/user.const";

export const IS_ANONYMOUS_ALLOWED_KEY = "isAnonymousAllowed";
export const AllowAnonymous = () => SetMetadata(IS_ANONYMOUS_ALLOWED_KEY, true);

export const CLAIMS_KEY = "claims";
export const RequiredClaims = (...claims: [Claim, ...Claim[]]) => SetMetadata(CLAIMS_KEY, claims);
