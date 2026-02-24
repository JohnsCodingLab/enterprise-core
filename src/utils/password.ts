import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

/**
 * Hash a password using Node.js scrypt (zero external dependencies).
 * Returns a string in the format: `salt:hash` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(SALT_LENGTH);

    scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(`${salt.toString("hex")}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verify a password against a previously hashed value.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [saltHex, keyHex] = hashedPassword.split(":");

    if (!saltHex || !keyHex) {
      resolve(false);
      return;
    }

    const salt = Buffer.from(saltHex, "hex");
    const storedKey = Buffer.from(keyHex, "hex");

    scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(timingSafeEqual(storedKey, derivedKey));
    });
  });
}
