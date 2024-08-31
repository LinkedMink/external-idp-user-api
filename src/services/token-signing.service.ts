import { ConsoleLogger, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { errors, jwtVerify, SignJWT } from "jose";
import { createPrivateKey, createPublicKey, JsonWebKey, KeyObject } from "node:crypto";
import { readFile } from "node:fs/promises";
import { signingConfigLoad, SigningConfigType } from "../config/signing.config.js";

@Injectable()
export class TokenSigningService implements OnModuleInit {
  private signingKey!: KeyObject;
  private publicKeyVal!: JsonWebKey;

  get publicKey() {
    return this.publicKeyVal;
  }

  constructor(
    private readonly logger: ConsoleLogger,
    @Inject(signingConfigLoad.KEY)
    private readonly signingConfig: SigningConfigType
  ) {
    logger.setContext(TokenSigningService.name);
  }

  async onModuleInit() {
    this.logger.log(
      `Loading signing key: alg=${this.signingConfig.signingAlgorithm}, file=${this.signingConfig.signingKeyFilePath}`
    );

    const keyData = await readFile(this.signingConfig.signingKeyFilePath);
    this.signingKey = createPrivateKey(keyData);
    this.publicKeyVal = createPublicKey(this.signingKey).export({ format: "jwk" });
  }

  async sign(subject?: string, claims?: Record<string, unknown>) {
    const signJwt = new SignJWT(claims)
      .setProtectedHeader({ alg: this.signingConfig.signingAlgorithm })
      .setIssuedAt()
      .setIssuer(this.signingConfig.issuer)
      .setAudience(this.signingConfig.audience)
      .setExpirationTime(`${this.signingConfig.expireInMinutes}m`);

    if (subject) {
      signJwt.setSubject(subject);
    }

    return signJwt.sign(this.signingKey);
  }

  async verify(token: string) {
    try {
      const result = await jwtVerify(token, this.signingKey, {
        algorithms: [this.signingConfig.signingAlgorithm],
        issuer: this.signingConfig.issuer,
      });

      return result.payload;
    } catch (error) {
      if (
        error instanceof errors.JWTExpired ||
        error instanceof errors.JWTClaimValidationFailed ||
        error instanceof errors.JWTInvalid ||
        error instanceof errors.JWSSignatureVerificationFailed ||
        error instanceof errors.JWSInvalid
      ) {
        this.logger.warn(`${error.name}: ${error.code} ${error.message}`);
        return null;
      }

      throw error;
    }
  }
}
