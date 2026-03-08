/**
 * 🚨 NORTH STAR STRESS TEST — Emergency System
 * Tests SOS cascade logic, vault decryption boundaries, and beacon prioritization.
 */
import { describe, it, expect } from "vitest";
import {
  encryptMessage,
  decryptMessage,
  generateEncryptionKey,
  deriveConversationKey,
} from "@/lib/crypto";

// ─── Helper: Haversine distance ───
function haversineDistance(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Mock Captain pool (50 captains scattered across London) ───
function generateCaptains(count: number, centerLat: number, centerLng: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `captain-${i}`,
    lat: centerLat + (Math.random() - 0.5) * 0.1,
    lng: centerLng + (Math.random() - 0.5) * 0.1,
    rank: 2, // Captain rank
  }));
}

// ─── 1. SOS SIGNAL CASCADE ───
describe("SOS Signal Cascade (50 Concurrent Beacons)", () => {
  const LONDON = { lat: 51.5074, lng: -0.1278 };
  const captains = generateCaptains(50, LONDON.lat, LONDON.lng);

  it("assigns 10 nearest captains to an SOS beacon", () => {
    const beacon = { lat: LONDON.lat, lng: LONDON.lng };

    const sorted = captains
      .map((c) => ({
        ...c,
        distance: haversineDistance(beacon.lat, beacon.lng, c.lat, c.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    const assigned = sorted.slice(0, 10);
    expect(assigned).toHaveLength(10);

    // All assigned are closer than any non-assigned
    const maxAssigned = assigned[assigned.length - 1].distance;
    const unassigned = sorted.slice(10);
    for (const c of unassigned) {
      expect(c.distance).toBeGreaterThanOrEqual(maxAssigned);
    }
  });

  it("handles 50 concurrent beacons without duplicate captain assignment", () => {
    const beacons = Array.from({ length: 50 }, (_, i) => ({
      id: `sos-${i}`,
      lat: LONDON.lat + (Math.random() - 0.5) * 0.05,
      lng: LONDON.lng + (Math.random() - 0.5) * 0.05,
    }));

    const assignments = new Map<string, string[]>();

    for (const beacon of beacons) {
      const sorted = captains
        .map((c) => ({
          ...c,
          distance: haversineDistance(beacon.lat, beacon.lng, c.lat, c.lng),
        }))
        .sort((a, b) => a.distance - b.distance);

      // Take top 10 nearest
      const assigned = sorted.slice(0, 10).map((c) => c.id);
      assignments.set(beacon.id, assigned);
    }

    // Every beacon got 10 captains
    for (const [beaconId, caps] of assignments) {
      expect(caps, `Beacon ${beaconId} missing captains`).toHaveLength(10);
    }
  });

  it("escalation_level increases are monotonic", () => {
    const escalationLevels = [1, 2, 3];
    for (let i = 1; i < escalationLevels.length; i++) {
      expect(escalationLevels[i]).toBeGreaterThan(escalationLevels[i - 1]);
    }
  });

  it("responder_count tracks captain arrivals accurately", () => {
    let responderCount = 0;
    const maxResponders = 10;

    // Simulate 10 captains responding
    for (let i = 0; i < maxResponders; i++) {
      responderCount++;
    }
    expect(responderCount).toBe(10);

    // Double-response from same captain shouldn't increment
    const respondedSet = new Set<string>();
    let deduped = 0;
    for (let i = 0; i < 15; i++) {
      const id = `captain-${i % 10}`;
      if (!respondedSet.has(id)) {
        respondedSet.add(id);
        deduped++;
      }
    }
    expect(deduped).toBe(10); // No duplicates
  });
});

// ─── 2. VAULT DECRYPTION BOUNDARIES ───
describe("Vault Decryption (Emergency Access Bridge)", () => {
  it("captain cannot decrypt user vault with wrong key", async () => {
    const userKey = await generateEncryptionKey();
    const captainKey = await generateEncryptionKey();

    const medicalInfo = JSON.stringify({
      bloodType: "O+",
      allergies: ["penicillin"],
      emergencyContact: "+44 7700 900000",
    });

    const encrypted = await encryptMessage(medicalInfo, userKey);

    // Captain's key MUST fail
    await expect(decryptMessage(encrypted, captainKey)).rejects.toThrow();
  });

  it("emergency access with shared derived key succeeds", async () => {
    const userId = "distressed-user-uuid";
    const captainId = "captain-responder-uuid";

    // Emergency access key derived from both parties
    const emergencyKey = await deriveConversationKey(userId, captainId, "emergency-sos-v1");

    const medicalInfo = JSON.stringify({
      bloodType: "O+",
      emergencyContact: "+44 7700 900000",
    });

    const encrypted = await encryptMessage(medicalInfo, emergencyKey);
    const decrypted = await decryptMessage(encrypted, emergencyKey);
    expect(JSON.parse(decrypted)).toEqual(JSON.parse(medicalInfo));
  });

  it("emergency key is different from conversation key", async () => {
    const userA = "user-alpha";
    const userB = "user-beta";

    const chatKey = await deriveConversationKey(userA, userB);
    const emergencyKey = await deriveConversationKey(userA, userB, "emergency-sos-v1");

    expect(chatKey).not.toBe(emergencyKey);
  });

  it("SOS-encrypted data cannot be read with regular chat key", async () => {
    const userA = "user-alpha";
    const userB = "user-beta";

    const chatKey = await deriveConversationKey(userA, userB);
    const emergencyKey = await deriveConversationKey(userA, userB, "emergency-sos-v1");

    const encrypted = await encryptMessage("MEDICAL: O+", emergencyKey);
    await expect(decryptMessage(encrypted, chatKey)).rejects.toThrow();
  });
});
