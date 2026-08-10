import crypto from "crypto";

const HASH_ITERATIONS = 10000;
const SALT_BYTES = 32;
const HASH_BYTES = 64;
const HASH_ALGORITHM = "sha512";

export function hashPassword(password: string): { hash: string; salt: string } {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_BYTES, HASH_ALGORITHM)
    .toString("hex");
  return { hash, salt };
}

export function verifyPassword({
  candidatePassword,
  salt,
  hash,
}: {
  candidatePassword: string;
  salt: string;
  hash: string;
}): boolean {
  if (!candidatePassword || !salt || !hash) return false;
  try {
    const candidateHash = crypto
      .pbkdf2Sync(candidatePassword, salt, HASH_ITERATIONS, HASH_BYTES, HASH_ALGORITHM)
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(candidateHash, "hex"),
      Buffer.from(hash, "hex"),
    );
  } catch {
    return false;
  }
}
