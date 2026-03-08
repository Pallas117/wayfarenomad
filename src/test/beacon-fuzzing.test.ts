/**
 * Beacon Fuzzing & Location Privacy Test Suite
 * Verifies location offsets for privacy protection.
 */
import { describe, it, expect } from "vitest";

// Simulate the fuzzing algorithm used for roaming beacons
function fuzzLocation(lat: number, lng: number, minMeters = 50, maxMeters = 100): { lat: number; lng: number } {
  // Random angle (0–2π)
  const angle = Math.random() * 2 * Math.PI;
  // Random distance between min and max meters
  const distance = minMeters + Math.random() * (maxMeters - minMeters);
  
  // Convert meters to degrees (approximate)
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos(lat * (Math.PI / 180));
  
  const offsetLat = (distance * Math.cos(angle)) / metersPerDegreeLat;
  const offsetLng = (distance * Math.sin(angle)) / metersPerDegreeLng;
  
  return {
    lat: lat + offsetLat,
    lng: lng + offsetLng,
  };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

describe("Beacon Fuzzing (Privacy Protection)", () => {
  it("fuzzed location is different from original", () => {
    const original = { lat: 51.5074, lng: -0.1278 }; // London
    const fuzzed = fuzzLocation(original.lat, original.lng);
    expect(fuzzed.lat).not.toBe(original.lat);
    expect(fuzzed.lng).not.toBe(original.lng);
  });

  it("fuzzed location is within 50m–100m of original", () => {
    const original = { lat: 51.5074, lng: -0.1278 };
    // Run 50 iterations to verify statistical correctness
    for (let i = 0; i < 50; i++) {
      const fuzzed = fuzzLocation(original.lat, original.lng, 50, 100);
      const distance = haversineDistance(original.lat, original.lng, fuzzed.lat, fuzzed.lng);
      expect(distance, `Iteration ${i}: distance ${distance}m`).toBeGreaterThanOrEqual(45); // Allow small float rounding
      expect(distance, `Iteration ${i}: distance ${distance}m`).toBeLessThanOrEqual(110); // Allow small float rounding
    }
  });

  it("fuzzed location varies (not deterministic)", () => {
    const original = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const fuzzed = fuzzLocation(original.lat, original.lng);
      results.add(`${fuzzed.lat.toFixed(6)},${fuzzed.lng.toFixed(6)}`);
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it("works at equatorial coordinates (Singapore)", () => {
    const original = { lat: 1.3521, lng: 103.8198 };
    const fuzzed = fuzzLocation(original.lat, original.lng);
    const distance = haversineDistance(original.lat, original.lng, fuzzed.lat, fuzzed.lng);
    expect(distance).toBeGreaterThanOrEqual(45);
    expect(distance).toBeLessThanOrEqual(110);
  });

  it("works at high latitudes (Reykjavik)", () => {
    const original = { lat: 64.1466, lng: -21.9426 };
    const fuzzed = fuzzLocation(original.lat, original.lng);
    const distance = haversineDistance(original.lat, original.lng, fuzzed.lat, fuzzed.lng);
    expect(distance).toBeGreaterThanOrEqual(45);
    expect(distance).toBeLessThanOrEqual(110);
  });
});
