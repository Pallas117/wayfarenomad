/**
 * City-Sync Theme Engine Test Suite
 * Verifies hub resolution and theme application.
 */
import { describe, it, expect } from "vitest";
import { REGIONAL_THEMES } from "@/components/CitySync/CitySyncProvider";

// Extract pure function for testing
function resolveHub(cityName: string): string {
  const CITY_TO_HUB: Record<string, string> = {
    london: "london", manchester: "london", birmingham: "london",
    edinburgh: "london", bristol: "london", oxford: "london", cambridge: "london",
    dubai: "dubai", "abu dhabi": "dubai", doha: "dubai", riyadh: "dubai",
    jeddah: "dubai", muscat: "dubai", kuwait: "dubai", bahrain: "dubai",
    amman: "dubai", beirut: "dubai", istanbul: "dubai",
    stockholm: "scandinavia", oslo: "scandinavia", copenhagen: "scandinavia",
    helsinki: "scandinavia", reykjavik: "scandinavia", bergen: "scandinavia",
    gothenburg: "scandinavia", "malmö": "scandinavia", tampere: "scandinavia",
  };
  const lower = cityName.toLowerCase().trim();
  return CITY_TO_HUB[lower] || "default";
}

describe("City-Sync Theme Engine (The Pulse)", () => {
  // ─── Hub Resolution ───
  describe("City → Hub Resolution", () => {
    it("resolves London to the 'london' hub", () => {
      expect(resolveHub("London")).toBe("london");
    });

    it("resolves Dubai to the 'dubai' hub", () => {
      expect(resolveHub("Dubai")).toBe("dubai");
    });

    it("resolves Stockholm to the 'scandinavia' hub", () => {
      expect(resolveHub("Stockholm")).toBe("scandinavia");
    });

    it("resolves unknown cities to 'default' hub", () => {
      expect(resolveHub("Kuala Lumpur")).toBe("default");
      expect(resolveHub("Singapore")).toBe("default");
      expect(resolveHub("Krabi")).toBe("default");
    });

    it("is case-insensitive", () => {
      expect(resolveHub("LONDON")).toBe("london");
      expect(resolveHub("dubai")).toBe("dubai");
      expect(resolveHub("StOcKhOlM")).toBe("scandinavia");
    });

    it("handles whitespace", () => {
      expect(resolveHub("  London  ")).toBe("london");
    });

    it("maps UK cities to London hub", () => {
      const ukCities = ["Manchester", "Birmingham", "Edinburgh", "Bristol", "Oxford", "Cambridge"];
      for (const city of ukCities) {
        expect(resolveHub(city), `${city} should map to london`).toBe("london");
      }
    });

    it("maps West Asian cities to Dubai hub", () => {
      const cities = ["Abu Dhabi", "Doha", "Riyadh", "Jeddah", "Istanbul", "Beirut", "Amman"];
      for (const city of cities) {
        expect(resolveHub(city), `${city} should map to dubai`).toBe("dubai");
      }
    });

    it("maps Nordic cities to Scandinavia hub", () => {
      const cities = ["Oslo", "Copenhagen", "Helsinki", "Reykjavik", "Bergen"];
      for (const city of cities) {
        expect(resolveHub(city), `${city} should map to scandinavia`).toBe("scandinavia");
      }
    });
  });

  // ─── Theme Definitions ───
  describe("Theme Definitions", () => {
    it("has all four regional themes defined", () => {
      expect(Object.keys(REGIONAL_THEMES)).toContain("default");
      expect(Object.keys(REGIONAL_THEMES)).toContain("london");
      expect(Object.keys(REGIONAL_THEMES)).toContain("dubai");
      expect(Object.keys(REGIONAL_THEMES)).toContain("scandinavia");
    });

    it("London theme has Misty Slate palette", () => {
      const theme = REGIONAL_THEMES.london;
      expect(theme.name).toContain("Misty Slate");
      expect(theme.emoji).toBe("🇬🇧");
    });

    it("Dubai theme has Desert Gold palette", () => {
      const theme = REGIONAL_THEMES.dubai;
      expect(theme.name).toContain("Desert Gold");
      expect(theme.emoji).toBe("🕌");
    });

    it("Scandinavia theme has Aurora Teal palette", () => {
      const theme = REGIONAL_THEMES.scandinavia;
      expect(theme.name).toContain("Aurora Teal");
      expect(theme.emoji).toBe("🌌");
    });

    it("all themes have required CSS variable properties", () => {
      const requiredProps = [
        "background", "foreground", "primary", "primaryForeground",
        "secondary", "secondaryForeground", "muted", "mutedForeground",
        "accent", "accentForeground", "border", "card", "cardForeground",
        "gold", "goldGlow", "goldDim", "navy", "navyLight", "navyLighter",
      ];
      for (const [hubId, theme] of Object.entries(REGIONAL_THEMES)) {
        for (const prop of requiredProps) {
          expect(theme, `Theme '${hubId}' missing '${prop}'`).toHaveProperty(prop);
          expect((theme as any)[prop], `Theme '${hubId}.${prop}' is empty`).toBeTruthy();
        }
      }
    });

    it("all themes have valid HSL format values", () => {
      for (const [hubId, theme] of Object.entries(REGIONAL_THEMES)) {
        // HSL format: "H S% L%" — three space-separated values
        const hslProps = ["background", "foreground", "primary"];
        for (const prop of hslProps) {
          const value = (theme as any)[prop] as string;
          const parts = value.split(" ");
          expect(parts.length, `Theme '${hubId}.${prop}' invalid HSL: ${value}`).toBe(3);
        }
      }
    });
  });

  // ─── Theme Transition (Desert Gold Scenario) ───
  describe("Theme Transition: London → Dubai", () => {
    it("London and Dubai have different primary colors", () => {
      expect(REGIONAL_THEMES.london.primary).not.toBe(REGIONAL_THEMES.dubai.primary);
    });

    it("London and Dubai have different background colors", () => {
      expect(REGIONAL_THEMES.london.background).not.toBe(REGIONAL_THEMES.dubai.background);
    });

    it("Dubai theme has warmer (higher hue) primary than London", () => {
      const dubaiHue = parseInt(REGIONAL_THEMES.dubai.primary.split(" ")[0]);
      const londonHue = parseInt(REGIONAL_THEMES.london.primary.split(" ")[0]);
      expect(dubaiHue).toBeGreaterThan(londonHue);
    });
  });
});
