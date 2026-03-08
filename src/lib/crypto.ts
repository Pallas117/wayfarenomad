/**
 * AES-256-GCM Encryption for the Nomad Platform
 * Uses Web Crypto API for client-side message encryption.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

/**
 * Generate a new AES-256 key and export as base64
 */
export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

/**
 * Encrypt plaintext with an AES-256-GCM key
 * Returns base64-encoded ciphertext with IV prepended
 */
export async function encryptMessage(
  plaintext: string,
  keyBase64: string
): Promise<string> {
  const keyData = base64ToArrayBuffer(keyBase64);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: ALGORITHM },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  // Prepend IV to ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypt ciphertext with an AES-256-GCM key
 * Expects base64-encoded data with IV prepended
 */
export async function decryptMessage(
  ciphertextBase64: string,
  keyBase64: string
): Promise<string> {
  const keyData = base64ToArrayBuffer(keyBase64);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: ALGORITHM },
    false,
    ["decrypt"]
  );

  const combined = new Uint8Array(base64ToArrayBuffer(ciphertextBase64));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Derive a shared encryption key from two user IDs (deterministic)
 * Uses PBKDF2 to create a conversation-specific key
 */
export async function deriveConversationKey(
  userIdA: string,
  userIdB: string,
  salt?: string
): Promise<string> {
  // Sort IDs to ensure same key regardless of order
  const sorted = [userIdA, userIdB].sort();
  const material = sorted.join(":");
  const saltBytes = new TextEncoder().encode(salt || "nomad-e2e-v1");

  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(material),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );

  const exported = await crypto.subtle.exportKey("raw", derivedKey);
  return arrayBufferToBase64(exported);
}

// ─── Helpers ───
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
