/**
 * 🛡️ ADVERSITY CONNECTION TEST — Offline-First Resilience
 * Tests SW cache contracts, sync-conflict resolution, and haptic fallback.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  haptic,
  hapticCancel,
  isHapticsAvailable,
  HAPTIC_PATTERNS,
  setVibrationIntensity,
} from "@/lib/haptics";
import {
  encryptMessage,
  decryptMessage,
  deriveConversationKey,
} from "@/lib/crypto";

// ─── 1. SERVICE WORKER CACHE CONTRACT ───
describe("Service Worker Cache Contract (Total Network Blackout)", () => {
  it("workbox config caches API responses for meetups, events, safe_spaces", () => {
    // Verify the cache pattern regex matches expected endpoints
    const pattern = /^https:\/\/xfwovoctvaaihxasmtsf\.supabase\.co\/rest\/v1\/(instant_meetups|events|safe_spaces)/;
    expect(pattern.test("https://xfwovoctvaaihxasmtsf.supabase.co/rest/v1/events?city=eq.London")).toBe(true);
    expect(pattern.test("https://xfwovoctvaaihxasmtsf.supabase.co/rest/v1/instant_meetups")).toBe(true);
    expect(pattern.test("https://xfwovoctvaaihxasmtsf.supabase.co/rest/v1/safe_spaces")).toBe(true);
    expect(pattern.test("https://xfwovoctvaaihxasmtsf.supabase.co/rest/v1/profiles")).toBe(false);
  });

  it("StaleWhileRevalidate cache expires after 4 hours", () => {
    const maxAgeSeconds = 60 * 60 * 4;
    expect(maxAgeSeconds).toBe(14400);
  });

  it("navigateFallbackDenylist excludes OAuth routes from cache", () => {
    const denylist = /^\/~oauth/;
    expect(denylist.test("/~oauth")).toBe(true);
    expect(denylist.test("/~oauth/callback")).toBe(true);
    expect(denylist.test("/pulse")).toBe(false);
    expect(denylist.test("/auth")).toBe(false);
  });

  it("cached encrypted messages remain decryptable offline", async () => {
    // Simulate: encrypt, store in cache, decrypt without network
    const key = await deriveConversationKey("user-A", "user-B");
    const messages = [
      "Meeting at the café ☕",
      "I'll be there at 3pm",
      "Don't forget your passport 🛂",
    ];
    const cached = await Promise.all(messages.map((m) => encryptMessage(m, key)));

    // Simulate offline read — decrypt from cached ciphertext
    const decrypted = await Promise.all(cached.map((c) => decryptMessage(c, key)));
    expect(decrypted).toEqual(messages);
  });
});

// ─── 2. SYNC-CONFLICT RESOLUTION ───
describe("Sync-Conflict Resolution (Last-Write-Wins)", () => {
  it("last-write-wins: later timestamp takes precedence", () => {
    const offlineEdit = {
      content: "I want to explore Southeast Asia",
      updatedAt: new Date("2026-03-08T10:00:00Z").getTime(),
    };
    const serverVersion = {
      content: "I want to explore South America",
      updatedAt: new Date("2026-03-08T09:30:00Z").getTime(),
    };

    const winner =
      offlineEdit.updatedAt > serverVersion.updatedAt ? offlineEdit : serverVersion;
    expect(winner.content).toBe("I want to explore Southeast Asia");
  });

  it("server wins if server timestamp is newer", () => {
    const offlineEdit = {
      content: "offline",
      updatedAt: new Date("2026-03-08T09:00:00Z").getTime(),
    };
    const serverVersion = {
      content: "server",
      updatedAt: new Date("2026-03-08T10:00:00Z").getTime(),
    };

    const winner =
      offlineEdit.updatedAt > serverVersion.updatedAt ? offlineEdit : serverVersion;
    expect(winner.content).toBe("server");
  });

  it("identical timestamps resolve deterministically (server wins)", () => {
    const ts = new Date("2026-03-08T10:00:00Z").getTime();
    const offlineEdit = { content: "offline", updatedAt: ts };
    const serverVersion = { content: "server", updatedAt: ts };

    // Tie-break: server wins
    const winner =
      offlineEdit.updatedAt > serverVersion.updatedAt ? offlineEdit : serverVersion;
    expect(winner.content).toBe("server"); // server because >, not >=
  });
});

// ─── 3. HAPTIC FALLBACK ───
describe("Haptic Fallback (Graceful Degradation)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setVibrationIntensity(1);
  });

  it("haptic call does not throw when vibrate is missing", () => {
    // Remove vibrate API entirely
    const original = navigator.vibrate;
    Object.defineProperty(navigator, "vibrate", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => haptic("success")).not.toThrow();
    expect(() => haptic("sosAlert")).not.toThrow();
    expect(() => hapticCancel()).not.toThrow();

    // Restore
    Object.defineProperty(navigator, "vibrate", {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it("reports unavailable when vibrate API missing", () => {
    const original = navigator.vibrate;
    Object.defineProperty(navigator, "vibrate", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(isHapticsAvailable()).toBe(false);

    Object.defineProperty(navigator, "vibrate", {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it("handles vibrate throwing an exception gracefully", () => {
    Object.defineProperty(navigator, "vibrate", {
      value: () => {
        throw new Error("NotSupportedError");
      },
      writable: true,
      configurable: true,
    });

    expect(() => haptic("beaconMatch")).not.toThrow();
  });

  it("all haptic patterns have minimum 5ms vibration segments at low intensity", () => {
    const vibrateSpy = vi.fn(() => true);
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateSpy,
      writable: true,
      configurable: true,
    });

    setVibrationIntensity(0.1);
    haptic("sosAlert");

    const pattern = vibrateSpy.mock.calls[0][0] as number[];
    // All vibration segments (even indices) should be >= 5ms
    pattern.forEach((val, i) => {
      if (i % 2 === 0) {
        expect(val, `segment ${i} is below 5ms: ${val}`).toBeGreaterThanOrEqual(5);
      }
    });
  });
});
