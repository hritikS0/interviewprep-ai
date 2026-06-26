import crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-cbc";
const KEY = crypto.scryptSync(env.ENCRYPTION_KEY, "salt", 32); // Creates a secure 32-byte key from the passphrase

/**
 * Encrypts a plain text string using AES-256-CBC.
 * Returns the encrypted string prefixed with the initialization vector (IV) in hex.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a hex-encoded cipher text string using the initialization vector (IV) prefix.
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  const ivHex = parts[0];
  const encrypted = parts[1];

  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
