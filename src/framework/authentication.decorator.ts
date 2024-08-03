import { SetMetadata } from "@nestjs/common";

export const IS_ANONYMOUS_ALLOWED_KEY = "isAnonymousAllowed";
export const AllowAnonymous = () => SetMetadata(IS_ANONYMOUS_ALLOWED_KEY, true);
