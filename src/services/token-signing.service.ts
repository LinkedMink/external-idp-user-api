import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { KeyLike, SignJWT } from "jose";
import { createPrivateKey } from "node:crypto";
import { readFile } from "node:fs/promises";
import { signingConfigLoad, SigningConfigType } from "../config/signing.config";

@Injectable()
export class TokenSigningService implements OnModuleInit {
  private readonly logger = new Logger(TokenSigningService.name);
  private signingKey: KeyLike;

  constructor(
    @Inject(signingConfigLoad.KEY)
    private readonly signingConfig: SigningConfigType
  ) {}

  async onModuleInit() {
    this.logger.verbose(
      `Loading signing key: alg=${this.signingConfig.signingAlgorithm}, file=${this.signingConfig.signingKeyFilePath}`
    );

    const keyData = await readFile(this.signingConfig.signingKeyFilePath);
    this.signingKey = createPrivateKey(keyData);
  }

  async sign(subject?: string) {
    const signJwt = new SignJWT()
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
}
