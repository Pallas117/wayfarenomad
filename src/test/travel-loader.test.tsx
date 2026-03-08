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
import { TravelLoader, TravelLoaderInline } from "@/components/animations/TravelLoader";

describe("TravelLoader", () => {
  it("renders default message", () => {
    render(<TravelLoader />);
    expect(screen.getByText("Charting the course…")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<TravelLoader message="Loading events…" />);
    expect(screen.getByText("Loading events…")).toBeInTheDocument();
  });

  it("renders progress dots", () => {
    const { container } = render(<TravelLoader />);
    // 4 progress dots
    const dots = container.querySelectorAll(".rounded-full.bg-primary");
    expect(dots.length).toBe(4);
  });
});

describe("TravelLoaderInline", () => {
  it("renders default message", () => {
    render(<TravelLoaderInline />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<TravelLoaderInline message="Finding nomads…" />);
    expect(screen.getByText("Finding nomads…")).toBeInTheDocument();
  });
});
