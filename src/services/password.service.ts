import { BinaryLike, randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify<BinaryLike, BinaryLike, number, Buffer>(scrypt);

export class PasswordService {
  createHash(password: string) {
    const salt = randomBytes(32);
    return scryptAsync(password, salt, 32);
  }

  async compareHash(password: string, salt: string, compareToHash: Buffer) {
    return (await scryptAsync(password, salt, 32)) === compareToHash;
  }
}
