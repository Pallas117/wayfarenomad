/**
 * Itinerary Matching Logic Test Suite
 * Tests the overlap calculation and vision score algorithms.
 */
import { describe, it, expect } from "vitest";

// Extract pure functions for testing (these are the core matching algorithms)
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

function calculateVisionScore(
  myTeaches: string[], myLearns: string[],
  theirTeaches: string[], theirLearns: string[]
): number {
  let matches = 0;
  let total = 0;
  for (const skill of myLearns) {
    total++;
    if (theirTeaches.map(s => s.toLowerCase()).includes(skill.toLowerCase())) matches++;
  }
  for (const skill of myTeaches) {
    total++;
    if (theirLearns.map(s => s.toLowerCase()).includes(skill.toLowerCase())) matches++;
  }
  if (total === 0) return 50;
  return Math.round((matches / total) * 100);
}

describe("Itinerary Matchmaker (The Heart)", () => {
  // ─── Overlap Calculation ───
  describe("Date Overlap Calculator", () => {
    it("detects full overlap for identical date ranges", () => {
      const overlap = calculateOverlap("2026-03-10", "2026-03-20", "2026-03-10", "2026-03-20");
      expect(overlap).toBe(10);
    });

    it("detects partial overlap for overlapping ranges", () => {
      // User A: Mar 10-20, User B: Mar 15-25 → 5 days overlap
      const overlap = calculateOverlap("2026-03-10", "2026-03-20", "2026-03-15", "2026-03-25");
      expect(overlap).toBe(5);
    });

    it("returns 0 for non-overlapping date ranges", () => {
      const overlap = calculateOverlap("2026-03-01", "2026-03-10", "2026-03-15", "2026-03-25");
      expect(overlap).toBe(0);
    });

    it("returns 0 for adjacent dates (no actual overlap)", () => {
      const overlap = calculateOverlap("2026-03-01", "2026-03-10", "2026-03-10", "2026-03-20");
      expect(overlap).toBe(0);
    });

    it("handles one-day overlap correctly", () => {
      const overlap = calculateOverlap("2026-03-10", "2026-03-15", "2026-03-14", "2026-03-20");
      expect(overlap).toBe(1);
    });

    it("London scenario: two nomads with 5-day overlap", () => {
      // User A in London: Mar 5–Mar 20
      // User B in London: Mar 15–Mar 25
      const overlap = calculateOverlap("2026-03-05", "2026-03-20", "2026-03-15", "2026-03-25");
      expect(overlap).toBe(5);
      expect(overlap).toBeGreaterThan(0);
    });

    it("handles reversed ranges gracefully", () => {
      // If somehow start > end, overlap should be 0
      const overlap = calculateOverlap("2026-03-20", "2026-03-10", "2026-03-15", "2026-03-25");
      expect(overlap).toBe(0);
    });
  });

  // ─── Vision Score ───
  describe("Vision Score (Complementary Skills)", () => {
    it("returns 100% for perfect complementary match", () => {
      const score = calculateVisionScore(
        ["TypeScript", "React"],  // I teach
        ["Arabic", "Photography"],  // I learn
        ["Arabic", "Photography"],  // They teach (matches my learns)
        ["TypeScript", "React"],  // They learn (matches my teaches)
      );
      expect(score).toBe(100);
    });

    it("returns 0% for no complementary skills", () => {
      const score = calculateVisionScore(
        ["TypeScript"], ["React"],
        ["Cooking"], ["Music"]
      );
      expect(score).toBe(0);
    });

    it("returns 50% for partial match", () => {
      const score = calculateVisionScore(
        ["TypeScript", "React"],  // I teach
        ["Arabic", "Photography"],  // I learn
        ["Arabic"],  // They teach 1 of my learns
        ["TypeScript"],  // They learn 1 of my teaches
      );
      expect(score).toBe(50);
    });

    it("returns 50 (neutral) when both have no skills", () => {
      const score = calculateVisionScore([], [], [], []);
      expect(score).toBe(50);
    });

    it("is case-insensitive for skill matching", () => {
      const score = calculateVisionScore(
        ["typescript"], ["REACT"],
        ["react"], ["TYPESCRIPT"]
      );
      expect(score).toBe(100);
    });
  });
});
