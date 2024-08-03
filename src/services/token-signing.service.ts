import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { KeyLike, SignJWT, jwtVerify } from "jose";
import { createPrivateKey } from "node:crypto";
import { readFile } from "node:fs/promises";
import { signingConfigLoad, SigningConfigType } from "../config/signing.config";
import { JOSEError } from "jose/dist/types/util/errors";

@Injectable()
export class TokenSigningService implements OnModuleInit {
  private readonly logger = new Logger(TokenSigningService.name);
  private signingKey: KeyLike;

  constructor(
    @Inject(signingConfigLoad.KEY)
    private readonly signingConfig: SigningConfigType
  ) {}

  async onModuleInit() {
    this.logger.log(
      `Loading signing key: alg=${this.signingConfig.signingAlgorithm}, file=${this.signingConfig.signingKeyFilePath}`
    );

    const keyData = await readFile(this.signingConfig.signingKeyFilePath);
    this.signingKey = createPrivateKey(keyData);
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
      if (error instanceof JOSEError) {
        this.logger.warn(`${error.name}: ${error.code} ${error.message}`);
        return null;
      }

      throw error;
    }
  }
}
