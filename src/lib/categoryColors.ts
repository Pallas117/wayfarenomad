/** Category color map — returns HSL CSS variable name */
export const categoryColors: Record<string, string> = {
  wellbeing: "var(--cat-wellbeing)",
  culture: "var(--cat-culture)",
  entertainment: "var(--cat-entertainment)",
  shopping: "var(--cat-shopping)",
  nature: "var(--cat-nature)",
  event: "var(--cat-event)",
  festival: "var(--cat-festival)",
  nightlife: "var(--cat-nightlife)",
  fitness: "var(--cat-fitness)",
  adventure: "var(--cat-adventure)",
  creative: "var(--cat-creative)",
  singles: "var(--cat-singles)",
  alien: "var(--cat-alien)",
};

export function getCategoryColor(cat: string): string {
  return categoryColors[cat] || "var(--primary)";
}

/** Returns inline style for category-colored elements */
export function catStyle(cat: string) {
  const c = getCategoryColor(cat);
  return {
    color: `hsl(${c})`,
    borderColor: `hsl(${c} / 0.3)`,
    backgroundColor: `hsl(${c} / 0.12)`,
  };
}

export function catIconStyle(cat: string) {
  return { color: `hsl(${getCategoryColor(cat)})` };
}
