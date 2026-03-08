/**
 * UI Component Test Suite
 * Verifies skeleton loaders, GoldSkeleton variants, and component rendering.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GoldSkeleton, GoldCardSkeleton, GoldEventSkeleton } from "@/components/animations/GoldSkeleton";

describe("Skeleton Loaders (Resilience)", () => {
  describe("GoldSkeleton", () => {
    it("renders line variant by default", () => {
      const { container } = render(<GoldSkeleton />);
      const el = container.firstChild as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.className).toContain("h-4");
      expect(el.className).toContain("w-full");
    });

    it("renders card variant", () => {
      const { container } = render(<GoldSkeleton variant="card" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("h-32");
      expect(el.className).toContain("rounded-xl");
    });

    it("renders avatar variant", () => {
      const { container } = render(<GoldSkeleton variant="avatar" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("h-12");
      expect(el.className).toContain("w-12");
      expect(el.className).toContain("rounded-full");
    });

    it("renders badge variant", () => {
      const { container } = render(<GoldSkeleton variant="badge" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("h-6");
      expect(el.className).toContain("rounded-full");
    });

    it("applies custom className", () => {
      const { container } = render(<GoldSkeleton className="w-2/3" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("w-2/3");
    });

    it("has shimmer animation overlay", () => {
      const { container } = render(<GoldSkeleton />);
      const shimmer = container.querySelector(".animate-shimmer");
      expect(shimmer).toBeTruthy();
    });

    it("has twinkle dots for visual fidelity", () => {
      const { container } = render(<GoldSkeleton />);
      const twinkles = container.querySelectorAll(".animate-twinkle");
      expect(twinkles.length).toBe(2);
    });
  });

  describe("GoldCardSkeleton", () => {
    it("renders a full card skeleton structure", () => {
      const { container } = render(<GoldCardSkeleton />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("glass-card");
      expect(card.className).toContain("rounded-xl");
    });

    it("contains avatar, line, and badge skeleton elements", () => {
      const { container } = render(<GoldCardSkeleton />);
      // Should have avatar (rounded-full), lines, and badges
      const roundedFull = container.querySelectorAll(".rounded-full");
      expect(roundedFull.length).toBeGreaterThan(0);
    });
  });

  describe("GoldEventSkeleton", () => {
    it("renders an event card skeleton", () => {
      const { container } = render(<GoldEventSkeleton />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("glass-card");
    });
  });
});
