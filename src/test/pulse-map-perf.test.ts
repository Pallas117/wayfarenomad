import { describe, it, expect, vi } from "vitest";
import type { MapPin } from "@/components/MapView.types";

// ---------------------------------------------------------------------------
// Generate a dense pin cloud (500–2 000 pins) centred on Kuala Lumpur
// ---------------------------------------------------------------------------
function generatePins(count: number): MapPin[] {
  const pins: MapPin[] = [];
  const types: MapPin["type"][] = ["event", "hangout", "beacon", "resource"];
  const categories = ["music", "tech", "festival", "wet_market", "water", "secure_nook"];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    pins.push({
      id: `perf-${i}`,
      lat: 3.139 + (Math.random() - 0.5) * 0.4,
      lng: 101.687 + (Math.random() - 0.5) * 0.4,
      title: `Pin ${i}`,
      subtitle: i % 3 === 0 ? `Venue ${i}` : undefined,
      type,
      category: type === "event" ? categories[i % categories.length] : undefined,
    });
  }
  return pins;
}

// ---------------------------------------------------------------------------
// 1. PIN GENERATION PERFORMANCE
// ---------------------------------------------------------------------------
describe("Pulse Map – Pin Generation (500+ pins)", () => {
  it("generates 500 pins in < 50 ms", () => {
    const start = performance.now();
    const pins = generatePins(500);
    const elapsed = performance.now() - start;

    expect(pins).toHaveLength(500);
    expect(elapsed).toBeLessThan(50);
  });

  it("generates 2 000 pins in < 200 ms", () => {
    const start = performance.now();
    const pins = generatePins(2000);
    const elapsed = performance.now() - start;

    expect(pins).toHaveLength(2000);
    expect(elapsed).toBeLessThan(200);
  });
});

// ---------------------------------------------------------------------------
// 2. BOUNDS CALCULATION PERFORMANCE
// ---------------------------------------------------------------------------
describe("Pulse Map – Bounds Calculation", () => {
  it("computes bounding box for 500 pins in < 10 ms", () => {
    const pins = generatePins(500);
    const start = performance.now();

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const p of pins) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(10);
    expect(maxLat - minLat).toBeGreaterThan(0);
    expect(maxLng - minLng).toBeGreaterThan(0);
  });

  it("computes bounding box for 2 000 pins in < 20 ms", () => {
    const pins = generatePins(2000);
    const start = performance.now();

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const p of pins) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(20);
  });
});

// ---------------------------------------------------------------------------
// 3. ICON GENERATION THROUGHPUT
// ---------------------------------------------------------------------------
describe("Pulse Map – Category Icon HTML Generation", () => {
  const pinSvgs: Record<string, string> = {
    music: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
    tech: `<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>`,
    festival: `<path d="M5.8 11.3 2 22l10.7-3.79"/>`,
  };

  const categoryColors: Record<string, { bg: string; border: string }> = {
    music: { bg: "hsl(280,60%,50%)", border: "hsl(280,70%,65%)" },
    tech: { bg: "hsl(200,80%,50%)", border: "hsl(200,90%,65%)" },
    festival: { bg: "hsl(340,75%,55%)", border: "hsl(340,85%,70%)" },
  };

  function makeIconHtml(category?: string): string {
    const color = categoryColors[category || ""] || { bg: "hsl(43,72%,52%)", border: "hsl(225,60%,7%)" };
    const svg = pinSvgs[category || ""];
    const inner = svg
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">${svg}</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="10" r="3"/></svg>`;
    return `<div style="width:28px;height:28px;border-radius:50%;background:${color.bg};border:2px solid ${color.border};display:flex;align-items:center;justify-content:center;">${inner}</div>`;
  }

  it("generates 500 icon HTML strings in < 20 ms", () => {
    const pins = generatePins(500);
    const start = performance.now();
    const htmls = pins.map((p) => makeIconHtml(p.category));
    const elapsed = performance.now() - start;

    expect(htmls).toHaveLength(500);
    expect(elapsed).toBeLessThan(20);
  });

  it("generates 2 000 icon HTML strings in < 80 ms", () => {
    const pins = generatePins(2000);
    const start = performance.now();
    const htmls = pins.map((p) => makeIconHtml(p.category));
    const elapsed = performance.now() - start;

    expect(htmls).toHaveLength(2000);
    expect(elapsed).toBeLessThan(80);
  });
});

// ---------------------------------------------------------------------------
// 4. MEMORY BUDGET (Estimated Object Size)
// ---------------------------------------------------------------------------
describe("Pulse Map – Memory Budget", () => {
  it("500-pin array stays under 500 KB estimated heap", () => {
    const pins = generatePins(500);
    // Rough estimate: JSON serialisation as a proxy for retained size
    const jsonSize = new TextEncoder().encode(JSON.stringify(pins)).byteLength;
    expect(jsonSize).toBeLessThan(500 * 1024); // 500 KB
  });

  it("2 000-pin array stays under 2 MB estimated heap", () => {
    const pins = generatePins(2000);
    const jsonSize = new TextEncoder().encode(JSON.stringify(pins)).byteLength;
    expect(jsonSize).toBeLessThan(2 * 1024 * 1024); // 2 MB
  });
});

// ---------------------------------------------------------------------------
// 5. FILTER / SEARCH PERFORMANCE (simulates Pulse type toggles)
// ---------------------------------------------------------------------------
describe("Pulse Map – Filter Throughput", () => {
  const pins = generatePins(1000);

  it("filters 1 000 pins by type in < 5 ms", () => {
    const start = performance.now();
    const events = pins.filter((p) => p.type === "event");
    const elapsed = performance.now() - start;

    expect(events.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(5);
  });

  it("filters 1 000 pins by category in < 5 ms", () => {
    const start = performance.now();
    const music = pins.filter((p) => p.category === "music");
    const elapsed = performance.now() - start;

    expect(music.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(5);
  });

  it("chains type + category filter in < 5 ms", () => {
    const start = performance.now();
    const result = pins.filter((p) => p.type === "event" && p.category === "music");
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(5);
  });
});

// ---------------------------------------------------------------------------
// 6. VIEWPORT CULLING SIMULATION (only render visible pins)
// ---------------------------------------------------------------------------
describe("Pulse Map – Viewport Culling", () => {
  it("culls 2 000 pins to a viewport bbox in < 5 ms", () => {
    const pins = generatePins(2000);
    const bbox = { minLat: 3.0, maxLat: 3.2, minLng: 101.5, maxLng: 101.8 };

    const start = performance.now();
    const visible = pins.filter(
      (p) => p.lat >= bbox.minLat && p.lat <= bbox.maxLat && p.lng >= bbox.minLng && p.lng <= bbox.maxLng
    );
    const elapsed = performance.now() - start;

    expect(visible.length).toBeGreaterThan(0);
    expect(visible.length).toBeLessThan(2000);
    expect(elapsed).toBeLessThan(5);
  });
});
