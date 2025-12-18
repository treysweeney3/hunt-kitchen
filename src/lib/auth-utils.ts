import { randomBytes } from "crypto";

/**
 * Generate a secure random string for NEXTAUTH_SECRET
 * Run this in Node.js to generate a secret:
 * node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
export function generateAuthSecret(): string {
  return randomBytes(32).toString("base64");
}

/**
 * Hash a password using bcrypt
 * Note: This is done server-side in the registration API
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}
