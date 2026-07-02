import { expect, test } from "@playwright/test";

test.describe("memory game expanded layout", () => {
  test("keeps the expanded card, cylinder pedestals, and unified state views stable", async ({ page }) => {
    test.setTimeout(40000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
        configurable: true,
        value: undefined,
      });
      Math.random = () => 0.45;
    });

    await page.goto("/#/mini-games");
    await page.getByRole("button", { name: /순서 맞추기/ }).click();
    await page.getByRole("button", { name: "게임 시작" }).click();
    await page.getByRole("button", { name: "게임 크게 보기" }).click();

    const stage = page.locator(".game-stage.memory-game");
    const inner = stage.locator(".game-stage__inner");
    const overlay = stage.locator(".memory-game__overlay-layer");

    await expect(stage).toHaveClass(/is-focus-mode/);
    await expect(overlay).toHaveAttribute("data-state", "countdown");

    const surface = await inner.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.backgroundColor, style.borderTopWidth, style.borderRadius];
    });
    expect(surface[0]).not.toBe("rgba(0, 0, 0, 0)");
    expect(parseFloat(surface[1])).toBeGreaterThan(0);
    expect(parseFloat(surface[2])).toBeGreaterThan(0);

    const initialInner = await inner.boundingBox();
    expect(initialInner).not.toBeNull();
    expect(initialInner.x).toBeGreaterThanOrEqual(8);
    expect(initialInner.y).toBeGreaterThanOrEqual(8);

    await page.getByRole("button", { name: "일시정지" }).click();
    const pausedView = page.getByRole("dialog", { name: "일시정지" });
    await expect(pausedView).toHaveAttribute("data-state", "paused");
    await expect(overlay).toHaveAttribute("data-state", "paused");
    await expect(pausedView).toHaveCSS("border-top-width", "0px");

    const pausedInner = await inner.boundingBox();
    expect(Math.abs(pausedInner.x - initialInner.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(pausedInner.y - initialInner.y)).toBeLessThanOrEqual(2);

    await page.getByRole("button", { name: "계속하기" }).click();
    const playShell = stage.locator(".memory-game__play-shell");
    await expect(playShell).toHaveAttribute("data-phase", "playing", { timeout: 15000 });

    const item = stage.locator(".memory-sequence__item").first();
    const pedestal = item.locator(".memory-pedestal");
    const top = pedestal.locator(".memory-pedestal__top");
    const body = pedestal.locator(".memory-pedestal__body");
    const shadow = pedestal.locator(".memory-pedestal__shadow");
    const [itemBox, pedestalBox, topBox, bodyBox, shadowBox] = await Promise.all([
      item.boundingBox(), pedestal.boundingBox(), top.boundingBox(), body.boundingBox(), shadow.boundingBox(),
    ]);

    expect(pedestalBox.width / itemBox.width).toBeGreaterThan(0.84);
    expect(pedestalBox.height).toBeGreaterThanOrEqual(24);
    expect(bodyBox.height).toBeGreaterThan(topBox.height);
    expect(shadowBox.y).toBeGreaterThan(bodyBox.y);
    await expect(stage.locator(".memory-pedestal")).toHaveCount(3);
    await expect(stage.locator(".memory-sequence__item.is-empty")).toHaveCount(3);

    await page.getByRole("button", { name: "구름 선택" }).click();
    const failedView = page.getByRole("dialog", { name: /GAME OVER|최고기록 갱신/ });
    await expect(failedView).toHaveAttribute("data-state", "failed");
    await expect(overlay).toHaveAttribute("data-state", "failed");
    await expect(failedView).toHaveCSS("border-top-width", "0px");

    const failedInner = await inner.boundingBox();
    expect(Math.abs(failedInner.x - initialInner.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(failedInner.y - initialInner.y)).toBeLessThanOrEqual(2);

    const overflow = await stage.evaluate((element) => [
      element.scrollWidth - element.clientWidth,
      element.scrollHeight - element.clientHeight,
    ]);
    expect(overflow[0]).toBeLessThanOrEqual(0);
    expect(overflow[1]).toBeLessThanOrEqual(0);
  });
});
