import { expect, test } from "@playwright/test";
test("today, correction, journey, and responsive layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /signal inside the motion/i })).toBeVisible();
  await expect(page.getByText("Highest-leverage moves")).toBeVisible();
  await page.getByRole("button", { name: "Correct" }).first().click();
  await expect(page.getByText("YOUR CORRECTION WINS")).toBeVisible();
  await page.getByLabel("Note").fill("Manual status is authoritative");
  await page.getByRole("button", { name: "Save correction" }).click();
  await page.getByRole("button", { name: "Journey" }).click();
  await expect(page.getByRole("heading", { name: "Progress over activity." })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
});
