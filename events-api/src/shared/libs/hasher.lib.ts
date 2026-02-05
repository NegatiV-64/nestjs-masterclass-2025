import { verify, hash } from "argon2";

export class Hasher {
  static async hash(value: string): Promise<string> {
    return hash(value);
  }

  static async verify(hash: string, value: string): Promise<boolean> {
    return verify(hash, value);
  }
}
