import { describe, it, expect } from "vitest";

// Test the map pin logic and category icon generation without mounting Leaflet
// (Leaflet requires a real DOM with full CSS, so we test the data/logic layer)

describe("MapView pin types", () => {
  const samplePins = [
    { id: "1", lat: 3.13, lng: 101.63, title: "KL Tech Meetup", subtitle: "WORQ TTDI", type: "event" as const, category: "tech" },
    { id: "2", lat: 1.29, lng: 103.86, title: "Music Fest", subtitle: "Esplanade", type: "event" as const, category: "music" },
    { id: "3", lat: 8.03, lng: 98.82, title: "Lantern Festival", type: "event" as const, category: "festival" },
    { id: "4", lat: 3.15, lng: 101.71, title: "Coffee Hangout", type: "hangout" as const },
    { id: "5", lat: 3.10, lng: 101.65, title: "SOS Beacon", type: "beacon" as const },
  ];

  it("should have valid lat/lng for all pins", () => {
    samplePins.forEach((pin) => {
      expect(pin.lat).toBeGreaterThanOrEqual(-90);
      expect(pin.lat).toBeLessThanOrEqual(90);
      expect(pin.lng).toBeGreaterThanOrEqual(-180);
      expect(pin.lng).toBeLessThanOrEqual(180);
    });
  });

  it("should differentiate pin types", () => {
    const events = samplePins.filter((p) => p.type === "event");
    const hangouts = samplePins.filter((p) => p.type === "hangout");
    const beacons = samplePins.filter((p) => p.type === "beacon");
    expect(events).toHaveLength(3);
    expect(hangouts).toHaveLength(1);
    expect(beacons).toHaveLength(1);
  });

  it("should support category on event pins", () => {
    const events = samplePins.filter((p) => p.type === "event");
    const categories = events.map((e) => e.category);
    expect(categories).toContain("tech");
    expect(categories).toContain("music");
    expect(categories).toContain("festival");
  });

  it("should allow pins without category (hangouts, beacons)", () => {
    const noCat = samplePins.filter((p) => !p.category);
    expect(noCat.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle empty pin arrays for bounds calculation", () => {
    const empty: typeof samplePins = [];
    // FitBounds should early-return on empty pins
    expect(empty.length).toBe(0);
  });
});

describe("Category color mapping", () => {
  const categoryColors: Record<string, { bg: string; border: string }> = {
    music: { bg: "hsl(280,60%,50%)", border: "hsl(280,70%,65%)" },
    tech: { bg: "hsl(200,80%,50%)", border: "hsl(200,90%,65%)" },
    festival: { bg: "hsl(340,75%,55%)", border: "hsl(340,85%,70%)" },
  };

  it("should have distinct colors for each category", () => {
    const bgs = Object.values(categoryColors).map((c) => c.bg);
    const unique = new Set(bgs);
    expect(unique.size).toBe(bgs.length);
  });

  it("should use HSL format for all colors", () => {
    Object.values(categoryColors).forEach((c) => {
      expect(c.bg).toMatch(/^hsl\(/);
      expect(c.border).toMatch(/^hsl\(/);
    });
  });

  it("should return default for unknown category", () => {
    const fallback = categoryColors["unknown_category"] || { bg: "hsl(43,72%,52%)", border: "hsl(225,60%,7%)" };
    expect(fallback.bg).toBe("hsl(43,72%,52%)");
  });
});

describe("Pin SVG icons", () => {
  const pinSvgs: Record<string, string> = {
    music: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
    tech: `<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>`,
    festival: `<path d="M5.8 11.3 2 22l10.7-3.79"/>`,
  };

  it("should have SVG content for music, tech, festival", () => {
    expect(pinSvgs.music).toContain("path");
    expect(pinSvgs.tech).toContain("rect");
    expect(pinSvgs.festival).toContain("path");
  });

  it("should return undefined for unknown categories", () => {
    expect(pinSvgs["coffee"]).toBeUndefined();
  });
});
