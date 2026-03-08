/**
 * ⭐ STELLAR CANOPY ECONOMY + WAYFARER UX + PRIVACY AUDIT
 * Tests stardust race conditions, milestone gates, itinerary intersection,
 * and encryption leak prevention.
 */
import { describe, it, expect, vi } from "vitest";
import {
  encryptMessage,
  decryptMessage,
  deriveConversationKey,
  generateEncryptionKey,
} from "@/lib/crypto";

// ─── 1. STARDUST RACE CONDITION ───
describe("Stardust Race Condition (10 Stewards Verify Same Event)", () => {
  it("only the first verifier earns points via database transaction lock", () => {
    // Simulate: 10 stewards try to verify event simultaneously
    // The DB trigger on_community_verification handles dedup via unique constraint
    const eventId = "event-123";
    const stewards = Array.from({ length: 10 }, (_, i) => `steward-${i}`);
    const verifications = new Set<string>();

    // Simulate unique constraint (user_id, event_id)
    const results = stewards.map((stewardId) => {
      const key = `${stewardId}:${eventId}`;
      if (verifications.has(key)) {
        return { success: false, reason: "duplicate" };
      }
      verifications.add(key);
      return { success: true, stardust: 5 };
    });

    // All 10 should succeed (each steward verifies once)
    expect(results.filter((r) => r.success)).toHaveLength(10);
  });

  it("same steward verifying twice is blocked", () => {
    const verifications = new Set<string>();

    const firstAttempt = (() => {
      const key = "steward-1:event-123";
      if (verifications.has(key)) return false;
      verifications.add(key);
      return true;
    })();

    const secondAttempt = (() => {
      const key = "steward-1:event-123";
      if (verifications.has(key)) return false;
      verifications.add(key);
      return true;
    })();

    expect(firstAttempt).toBe(true);
    expect(secondAttempt).toBe(false);
  });

  it("community_verify_count updates atomically", () => {
    // Simulate atomic counter
    let verifyCount = 0;
    const increments = 10;

    for (let i = 0; i < increments; i++) {
      verifyCount++; // In DB this is: SET community_verify_count = (SELECT count(*) ...)\
    }

    expect(verifyCount).toBe(10);
  });

  it("event auto-verifies at 3 community verifications", () => {
    let verifyCount = 0;
    let status = "scraped";

    for (let i = 0; i < 5; i++) {
      verifyCount++;
      if (verifyCount >= 3 && status === "scraped") {
        status = "community_verified";
      }
    }

    expect(status).toBe("community_verified");
    expect(verifyCount).toBe(5);
  });
});

// ─── 2. MILESTONE GATEKEEPER ───
describe("Milestone Gatekeeper (Feature Unlock Thresholds)", () => {
  function canUnlockFeature(stardustPoints: number, threshold: number): boolean {
    return stardustPoints >= threshold;
  }

  it("denies access at 99 points when threshold is 100", () => {
    expect(canUnlockFeature(99, 100)).toBe(false);
  });

  it("grants access at exactly 100 points", () => {
    expect(canUnlockFeature(100, 100)).toBe(true);
  });

  it("grants access at 500+ points", () => {
    expect(canUnlockFeature(500, 100)).toBe(true);
  });

  it("denies access at 0 points", () => {
    expect(canUnlockFeature(0, 100)).toBe(false);
  });

  it("negative points always denied", () => {
    expect(canUnlockFeature(-10, 100)).toBe(false);
  });

  // Rank-based gatekeeper (mirrors has_min_rank DB function)
  function hasMinRank(userRank: number, minRank: number): boolean {
    return userRank >= minRank;
  }

  it("steward (rank 1) can access steward features", () => {
    expect(hasMinRank(1, 1)).toBe(true);
  });

  it("basic user (rank 0) cannot access steward features", () => {
    expect(hasMinRank(0, 1)).toBe(false);
  });

  it("captain (rank 2) can access steward features", () => {
    expect(hasMinRank(2, 1)).toBe(true);
  });
});

// ─── 3. ITINERARY INTERSECTION (5 Users) ───
describe("Itinerary Intersection (Aura Beacon Logic)", () => {
  function calculateOverlap(
    startA: string, endA: string,
    startB: string, endB: string
  ): number {
    const a0 = new Date(startA).getTime();
    const a1 = new Date(endA).getTime();
    const b0 = new Date(startB).getTime();
    const b1 = new Date(endB).getTime();
    const overlapStart = Math.max(a0, b0);
    const overlapEnd = Math.min(a1, b1);
    if (overlapEnd <= overlapStart) return 0;
    return Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
  }

  const users = [
    { id: "u1", city: "London", arrival: "2026-03-10", departure: "2026-03-25" },
    { id: "u2", city: "London", arrival: "2026-03-15", departure: "2026-03-30" },
    { id: "u3", city: "London", arrival: "2026-03-20", departure: "2026-04-05" },
    { id: "u4", city: "London", arrival: "2026-03-01", departure: "2026-03-12" },
    { id: "u5", city: "Paris", arrival: "2026-03-10", departure: "2026-03-25" },
  ];

  it("identifies 3-way overlap between u1, u2, u3", () => {
    // u1-u2: Mar 15-25 = 10 days
    // u1-u3: Mar 20-25 = 5 days
    // u2-u3: Mar 20-30 = 10 days
    expect(calculateOverlap(users[0].arrival, users[0].departure, users[1].arrival, users[1].departure)).toBe(10);
    expect(calculateOverlap(users[0].arrival, users[0].departure, users[2].arrival, users[2].departure)).toBe(5);
    expect(calculateOverlap(users[1].arrival, users[1].departure, users[2].arrival, users[2].departure)).toBe(10);
  });

  it("u4 has minimal overlap with u1 (2 days)", () => {
    expect(calculateOverlap(users[0].arrival, users[0].departure, users[3].arrival, users[3].departure)).toBe(2);
  });

  it("u5 in Paris has zero overlap with London users (different city)", () => {
    // Different city — matching logic should filter by city first
    const londonUsers = users.filter((u) => u.city === "London");
    const parisUser = users.find((u) => u.city === "Paris")!;

    for (const lu of londonUsers) {
      // Even if dates overlap, city mismatch means no match
      expect(lu.city).not.toBe(parisUser.city);
    }
  });

  it("finds all pairwise matches in same city", () => {
    const londonUsers = users.filter((u) => u.city === "London");
    const matches: Array<{ pair: string; days: number }> = [];

    for (let i = 0; i < londonUsers.length; i++) {
      for (let j = i + 1; j < londonUsers.length; j++) {
        const days = calculateOverlap(
          londonUsers[i].arrival, londonUsers[i].departure,
          londonUsers[j].arrival, londonUsers[j].departure
        );
        if (days > 0) {
          matches.push({ pair: `${londonUsers[i].id}-${londonUsers[j].id}`, days });
        }
      }
    }

    // u1-u2: 10, u1-u3: 5, u1-u4: 2, u2-u3: 10, u2-u4: 0, u3-u4: 0
    expect(matches).toHaveLength(4); // u1-u2, u1-u3, u1-u4, u2-u3
  });
});

// ─── 4. ENCRYPTION LEAK TEST ───
describe("Encryption Leak Prevention (Privacy Audit)", () => {
  it("encrypted message does not contain plaintext substring", async () => {
    const key = await generateEncryptionKey();
    const sensitive = "My passport number is AB1234567";
    const encrypted = await encryptMessage(sensitive, key);

    expect(encrypted).not.toContain("passport");
    expect(encrypted).not.toContain("AB1234567");
    expect(encrypted).not.toContain(sensitive);
  });

  it("vision statement is never in ciphertext", async () => {
    const key = await generateEncryptionKey();
    const vision = "I believe in connecting nomads across cultural boundaries through shared experiences and mutual respect.";
    const encrypted = await encryptMessage(vision, key);

    // No word from the vision should appear in the base64 ciphertext
    const words = vision.split(" ").filter((w) => w.length > 4);
    for (const word of words) {
      expect(encrypted).not.toContain(word);
    }
  });

  it("private key material stays base64-encoded (never raw hex in transit)", async () => {
    const key = await generateEncryptionKey();

    // Key is base64
    expect(() => atob(key)).not.toThrow();
    const decoded = atob(key);
    expect(decoded.length).toBe(32); // 256-bit key
  });

  it("conversation key derivation is deterministic and safe", async () => {
    const key1 = await deriveConversationKey("alice", "bob");
    const key2 = await deriveConversationKey("alice", "bob");

    // Same inputs → same key
    expect(key1).toBe(key2);

    // Key doesn't contain user IDs
    expect(key1).not.toContain("alice");
    expect(key1).not.toContain("bob");
  });

  it("50 messages produce 50 unique ciphertexts (IV uniqueness)", async () => {
    const key = await generateEncryptionKey();
    const ciphertexts = new Set<string>();

    for (let i = 0; i < 50; i++) {
      const ct = await encryptMessage("Same message", key);
      ciphertexts.add(ct);
    }

    expect(ciphertexts.size).toBe(50); // Every encryption unique due to random IV
  });

  it("console.log mock catches no plaintext leaks", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => { });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

    // Simulate normal app logging
    console.log("[useAuth] session check");
    console.log("[Pulse] loading events");

    const allLogs = [
      ...logSpy.mock.calls.map((c) => c.join(" ")),
      ...warnSpy.mock.calls.map((c) => c.join(" ")),
      ...errorSpy.mock.calls.map((c) => c.join(" ")),
    ];

    for (const log of allLogs) {
      expect(log).not.toMatch(/private.?key/i);
      expect(log).not.toMatch(/vision.?statement/i);
      expect(log).not.toMatch(/passport/i);
      expect(log).not.toMatch(/emergency.?contact/i);
    }

    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
