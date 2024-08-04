import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";
import { stringToJsonSchema } from "../utility/zod-schema";

const signingConfigSchema = stringToJsonSchema.pipe(
  z.object({
    /**
     * @see https://github.com/panva/jose/issues/210#jws-alg
     */
    signingAlgorithm: z
      .enum([
        "EdDSA",
        "ES512",
        "ES384",
        "ES256K",
        "ES256",
        "PS512",
        "PS384",
        "PS256",
        "RS512",
        "RS384",
        "RS256",
        "HS512",
        "HS384",
        "HS256",
      ])
      .default("ES512"),
    signingKeyFilePath: z.string().min(1),
    issuer: z.string().min(1),
    audience: z.string().min(1),
    expireInMinutes: z.number().min(1).default(120),
  })
);

export const signingConfigLoad = registerAs("signing", () =>
  signingConfigSchema.parse(process.env.SIGNING)
);

export type SigningConfigType = ConfigType<typeof signingConfigLoad>;
