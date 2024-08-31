import { Inject, Injectable } from "@nestjs/common";
import { BinaryLike, randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { passwordConfigLoad, PasswordConfigType } from "../config/password.config.js";

const scryptAsync = promisify<BinaryLike, BinaryLike, number, Buffer>(scrypt);

@Injectable()
export class PasswordService {
  constructor(
    @Inject(passwordConfigLoad.KEY)
    private readonly passwordConfig: PasswordConfigType
  ) {}

  async createHash(password: string) {
    const salt = randomBytes(this.passwordConfig.saltBytes);
    const hash = await scryptAsync(password, salt, this.passwordConfig.hashBytes);
    return { salt, hash };
  }

  async compareHash(password: string, salt: Buffer, compareToHash: Buffer) {
    const passwordHash = await scryptAsync(password, salt, this.passwordConfig.hashBytes);
    return passwordHash.equals(compareToHash);
  }
}
