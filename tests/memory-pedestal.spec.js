import { expect, test } from "@playwright/test";

test("memory pedestals keep a visible cylinder body", async ({ page }) => {
  test.setTimeout(30000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/mini-games");
  await page.getByRole("button", { name: /순서 맞추기/ }).click();
  await page.getByRole("button", { name: "게임 시작" }).click();

  const playShell = page.locator(".memory-game__play-shell");
  await expect(playShell).toHaveAttribute("data-phase", "playing", { timeout: 15000 });

  const item = page.locator(".memory-sequence__item").first();
  const pedestal = item.locator(".memory-pedestal");
  const top = pedestal.locator(".memory-pedestal__top");
  const body = pedestal.locator(".memory-pedestal__body");
  const shadow = pedestal.locator(".memory-pedestal__shadow");

  const [itemBox, pedestalBox, topBox, bodyBox, shadowBox] = await Promise.all([
    item.boundingBox(),
    pedestal.boundingBox(),
    top.boundingBox(),
    body.boundingBox(),
    shadow.boundingBox(),
  ]);

  expect(itemBox).not.toBeNull();
  expect(pedestalBox).not.toBeNull();
  expect(topBox).not.toBeNull();
  expect(bodyBox).not.toBeNull();
  expect(shadowBox).not.toBeNull();
  expect(pedestalBox.width / itemBox.width).toBeGreaterThan(0.84);
  expect(pedestalBox.height).toBeGreaterThanOrEqual(40);
  expect(bodyBox.height).toBeGreaterThanOrEqual(30);
  expect(bodyBox.height / topBox.height).toBeGreaterThan(2);
  expect(shadowBox.y).toBeGreaterThan(bodyBox.y + bodyBox.height - 4);
  await expect(page.locator(".memory-pedestal")).toHaveCount(3);
  await expect(page.locator(".memory-sequence__item.is-empty")).toHaveCount(3);
});
