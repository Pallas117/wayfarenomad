/**
 * Haptic Feedback Test Suite
 * Verifies navigator.vibrate is called with correct patterns.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  haptic,
  hapticCancel,
  isHapticsAvailable,
  HAPTIC_PATTERNS,
  setVibrationIntensity,
  getVibrationIntensity,
} from "@/lib/haptics";

describe("Haptic Identity (The Glow)", () => {
  let vibrateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vibrateSpy = vi.fn(() => true);
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateSpy,
      writable: true,
      configurable: true,
    });
    setVibrationIntensity(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("detects haptics availability", () => {
    expect(isHapticsAvailable()).toBe(true);
  });

  // ─── Pattern Verification ───
  describe("Pattern Triggers", () => {
    it("triggers success pattern (double-tap) on verification", () => {
      haptic("success");
      expect(vibrateSpy).toHaveBeenCalledTimes(1);
      const called = vibrateSpy.mock.calls[0][0];
      expect(called).toEqual([40, 80, 40]); // Double-tap pattern
    });

    it("triggers beaconMatch pattern (heartbeat) on nearby match", () => {
      haptic("beaconMatch");
      const called = vibrateSpy.mock.calls[0][0];
      expect(called).toEqual([100, 200, 60, 200, 100, 200, 60]); // Heartbeat
    });

    it("triggers sosAlert pattern (heavy buzz) for emergencies", () => {
      haptic("sosAlert");
      const called = vibrateSpy.mock.calls[0][0];
      expect(called).toEqual([200, 50, 200, 50, 200, 50, 200, 50, 200]); // Heavy rapid
    });

    it("triggers messageReceived pattern (single thud)", () => {
      haptic("messageReceived");
      const called = vibrateSpy.mock.calls[0][0];
      expect(called).toEqual([80]); // Single thud
    });

    it("triggers musicIdentified pattern (ascending)", () => {
      haptic("musicIdentified");
      const called = vibrateSpy.mock.calls[0][0];
      expect(called).toEqual([30, 60, 60, 60, 120]); // Short-medium-long
    });

    it("triggers stardust pattern (sparkle)", () => {
      haptic("stardust");
      const called = vibrateSpy.mock.calls[0][0];
      expect(called).toEqual([20, 30, 20, 30, 40, 30, 60]);
    });

    it("triggers shimmer pattern (micro-vibes)", () => {
      haptic("shimmer");
      const called = vibrateSpy.mock.calls[0][0];
      expect(called).toEqual([15, 20, 15, 20, 15, 20, 15, 20, 15, 20, 15, 20, 15]);
    });

    it("triggers tap pattern (light press)", () => {
      haptic("tap");
      const called = vibrateSpy.mock.calls[0][0];
      expect(called).toEqual([15]);
    });
  });

  // ─── Intensity Scaling ───
  describe("Intensity Control", () => {
    it("scales vibration durations by intensity", () => {
      setVibrationIntensity(0.5);
      haptic("success");
      const called = vibrateSpy.mock.calls[0][0];
      // Vibration segments (even indices) scaled, pauses (odd indices) preserved
      expect(called[0]).toBe(20); // 40 * 0.5
      expect(called[1]).toBe(80); // pause unchanged
      expect(called[2]).toBe(20); // 40 * 0.5
    });

    it("does not vibrate when intensity is 0", () => {
      setVibrationIntensity(0);
      haptic("success");
      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it("clamps intensity between 0 and 1", () => {
      setVibrationIntensity(2.5);
      expect(getVibrationIntensity()).toBe(1);
      setVibrationIntensity(-0.5);
      expect(getVibrationIntensity()).toBe(0);
    });
  });

  // ─── Cancel ───
  describe("Haptic Cancel", () => {
    it("cancels all vibration", () => {
      hapticCancel();
      expect(vibrateSpy).toHaveBeenCalledWith(0);
    });
  });

  // ─── All patterns defined ───
  describe("Pattern Registry", () => {
    it("has all required patterns defined", () => {
      const required = [
        "success", "beaconMatch", "sosAlert", "messageReceived",
        "musicIdentified", "shimmer", "stardust", "typewriterTick", "tap",
      ];
      for (const name of required) {
        expect(HAPTIC_PATTERNS).toHaveProperty(name);
      }
    });

    it("all patterns are non-empty arrays or numbers", () => {
      for (const [name, pattern] of Object.entries(HAPTIC_PATTERNS)) {
        if (Array.isArray(pattern)) {
          expect(pattern.length, `Pattern '${name}' is empty`).toBeGreaterThan(0);
          pattern.forEach((val) => expect(typeof val).toBe("number"));
        } else {
          expect(typeof pattern).toBe("number");
        }
      }
    });
  });
});
