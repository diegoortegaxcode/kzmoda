// Node.js only — generación y hashing de tokens de recuperación de contraseña.
import { randomBytes, createHash } from "crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
