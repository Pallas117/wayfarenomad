import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TravelLoader, TravelLoaderInline } from "@/components/animations/TravelLoader";

function getByText(container: HTMLElement, text: string) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.includes(text)) return walker.currentNode.parentElement;
  }
  return null;
}

describe("TravelLoader", () => {
  it("renders default message", () => {
    const { container } = render(<TravelLoader />);
    expect(getByText(container, "Charting the course…")).toBeTruthy();
  });

  it("renders custom message", () => {
    const { container } = render(<TravelLoader message="Loading events…" />);
    expect(getByText(container, "Loading events…")).toBeTruthy();
  });

  it("renders progress dots", () => {
    const { container } = render(<TravelLoader />);
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBeGreaterThanOrEqual(4);
  });
});

describe("TravelLoaderInline", () => {
  it("renders default message", () => {
    const { container } = render(<TravelLoaderInline />);
    expect(getByText(container, "Loading…")).toBeTruthy();
  });

  it("renders custom message", () => {
    const { container } = render(<TravelLoaderInline message="Finding nomads…" />);
    expect(getByText(container, "Finding nomads…")).toBeTruthy();
  });
});
