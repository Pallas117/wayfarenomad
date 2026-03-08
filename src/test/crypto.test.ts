/**
 * AES-256-GCM Encryption Test Suite
 * Verifies messages are encrypted before storage and decrypted only client-side.
 */
import { describe, it, expect, beforeAll } from "vitest";
import {
  generateEncryptionKey,
  encryptMessage,
  decryptMessage,
  deriveConversationKey,
} from "@/lib/crypto";

describe("AES-256-GCM Encryption (The Shield)", () => {
  let testKey: string;

  beforeAll(async () => {
    testKey = await generateEncryptionKey();
  });

  // ─── Key Generation ───
  describe("Key Generation", () => {
    it("generates a valid base64 key", async () => {
      const key = await generateEncryptionKey();
      expect(key).toBeTruthy();
      expect(typeof key).toBe("string");
      // AES-256 = 32 bytes = ~44 chars base64
      expect(atob(key).length).toBe(32);
    });

    it("generates unique keys each time", async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });
  });

  // ─── Encryption ───
  describe("Message Encryption", () => {
    it("encrypts plaintext into a different ciphertext", async () => {
      const plaintext = "Hello from the Nomad Vault";
      const encrypted = await encryptMessage(plaintext, testKey);
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toBeTruthy();
    });

    it("produces different ciphertext for same plaintext (unique IV)", async () => {
      const plaintext = "Same message encrypted twice";
      const enc1 = await encryptMessage(plaintext, testKey);
      const enc2 = await encryptMessage(plaintext, testKey);
      expect(enc1).not.toBe(enc2); // Different IVs
    });

    it("ciphertext contains IV prefix (12 bytes)", async () => {
      const encrypted = await encryptMessage("test", testKey);
      const decoded = atob(encrypted);
      // IV (12 bytes) + ciphertext + auth tag (16 bytes)
      expect(decoded.length).toBeGreaterThan(12 + 16);
    });
  });

  // ─── Decryption ───
  describe("Message Decryption", () => {
    it("decrypts ciphertext back to original plaintext", async () => {
      const plaintext = "🌍 Meeting at the café in Kuala Lumpur!";
      const encrypted = await encryptMessage(plaintext, testKey);
      const decrypted = await decryptMessage(encrypted, testKey);
      expect(decrypted).toBe(plaintext);
    });

    it("handles unicode and emoji content", async () => {
      const plaintext = "مرحبا بالعالم 🕌 Arabic text test أهلا";
      const encrypted = await encryptMessage(plaintext, testKey);
      const decrypted = await decryptMessage(encrypted, testKey);
      expect(decrypted).toBe(plaintext);
    });

    it("fails decryption with wrong key", async () => {
      const plaintext = "Secret nomad intel";
      const encrypted = await encryptMessage(plaintext, testKey);
      const wrongKey = await generateEncryptionKey();
      await expect(decryptMessage(encrypted, wrongKey)).rejects.toThrow();
    });

    it("fails decryption with tampered ciphertext", async () => {
      const encrypted = await encryptMessage("test", testKey);
      // Tamper with the ciphertext
      const tampered = encrypted.slice(0, -4) + "XXXX";
      await expect(decryptMessage(tampered, testKey)).rejects.toThrow();
    });
  });

  // ─── Conversation Key Derivation ───
  describe("Conversation Key Derivation (PBKDF2)", () => {
    it("derives deterministic keys from same user pair", async () => {
      const userA = "user-uuid-alpha";
      const userB = "user-uuid-beta";
      const key1 = await deriveConversationKey(userA, userB);
      const key2 = await deriveConversationKey(userA, userB);
      expect(key1).toBe(key2);
    });

    it("derives same key regardless of user order", async () => {
      const userA = "user-uuid-alpha";
      const userB = "user-uuid-beta";
      const keyAB = await deriveConversationKey(userA, userB);
      const keyBA = await deriveConversationKey(userB, userA);
      expect(keyAB).toBe(keyBA);
    });

    it("derives different keys for different user pairs", async () => {
      const keyPair1 = await deriveConversationKey("user-1", "user-2");
      const keyPair2 = await deriveConversationKey("user-1", "user-3");
      expect(keyPair1).not.toBe(keyPair2);
    });

    it("derived key is valid AES-256 key (32 bytes)", async () => {
      const key = await deriveConversationKey("alice", "bob");
      expect(atob(key).length).toBe(32);
    });

    it("messages encrypted with derived key can be decrypted", async () => {
      const key = await deriveConversationKey("user-sender", "user-receiver");
      const plaintext = "Encrypted with derived conversation key";
      const encrypted = await encryptMessage(plaintext, key);
      const decrypted = await decryptMessage(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });
  });

  // ─── Edge Cases ───
  describe("Edge Cases", () => {
    it("handles empty string encryption/decryption", async () => {
      const encrypted = await encryptMessage("", testKey);
      const decrypted = await decryptMessage(encrypted, testKey);
      expect(decrypted).toBe("");
    });

    it("handles very long messages", async () => {
      const longMsg = "A".repeat(10000);
      const encrypted = await encryptMessage(longMsg, testKey);
      const decrypted = await decryptMessage(encrypted, testKey);
      expect(decrypted).toBe(longMsg);
    });
  });
});
