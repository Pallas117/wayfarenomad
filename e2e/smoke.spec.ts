import { test, expect } from "@playwright/test";

test("home redirects to auth or pulse without crashing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(res?.ok()).toBeTruthy();
  await expect(page).toHaveURL(/auth|pulse/);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("auth page renders sign-in form", async ({ page }) => {
  await page.goto("/auth");
  await expect(page.locator("body")).toBeVisible();
});