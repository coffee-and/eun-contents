import { expect, test } from "@playwright/test";

test.describe("memory game expanded layout", () => {
  test("keeps the card surface, pedestal size, and modal inside the expanded stage", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
        configurable: true,
        value: undefined,
      });
    });

    await page.goto("/#/mini-games");
    await page.getByRole("button", { name: /순서 맞추기/ }).click();
    await page.getByRole("button", { name: "게임 시작" }).click();
    await page.getByRole("button", { name: "게임 크게 보기" }).click();

    const stage = page.locator(".game-stage.memory-game");
    const inner = stage.locator(".game-stage__inner");
    const platform = stage.locator(".memory-sequence__platform").first();
    const sequenceItem = stage.locator(".memory-sequence__item").first();

    await expect(stage).toHaveClass(/is-focus-mode/);

    const surface = await inner.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderTopWidth: style.borderTopWidth,
        borderRadius: style.borderRadius,
      };
    });

    expect(surface.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(Number.parseFloat(surface.borderTopWidth)).toBeGreaterThan(0);
    expect(Number.parseFloat(surface.borderRadius)).toBeGreaterThan(0);

    const [innerBeforePause, itemBox, platformBox] = await Promise.all([
      inner.boundingBox(),
      sequenceItem.boundingBox(),
      platform.boundingBox(),
    ]);

    expect(innerBeforePause).not.toBeNull();
    expect(itemBox).not.toBeNull();
    expect(platformBox).not.toBeNull();
    expect(innerBeforePause.x).toBeGreaterThanOrEqual(8);
    expect(innerBeforePause.y).toBeGreaterThanOrEqual(8);
    expect(platformBox.width / itemBox.width).toBeGreaterThan(0.9);
    expect(platformBox.height).toBeGreaterThanOrEqual(10);

    await page.getByRole("button", { name: "일시정지" }).click();
    const dialog = page.getByRole("dialog", { name: "일시정지" });
    await expect(dialog).toBeVisible();

    const modal = dialog.locator(".memory-game__modal");
    const [innerWhilePaused, modalBox, modalColor] = await Promise.all([
      inner.boundingBox(),
      modal.boundingBox(),
      modal.evaluate((element) => window.getComputedStyle(element).backgroundColor),
    ]);

    expect(innerWhilePaused).not.toBeNull();
    expect(modalBox).not.toBeNull();
    expect(Math.abs(innerWhilePaused.x - innerBeforePause.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(innerWhilePaused.y - innerBeforePause.y)).toBeLessThanOrEqual(2);
    expect(modalBox.x).toBeGreaterThanOrEqual(innerWhilePaused.x);
    expect(modalBox.y).toBeGreaterThanOrEqual(innerWhilePaused.y);
    expect(modalBox.x + modalBox.width).toBeLessThanOrEqual(
      innerWhilePaused.x + innerWhilePaused.width
    );
    expect(modalBox.y + modalBox.height).toBeLessThanOrEqual(
      innerWhilePaused.y + innerWhilePaused.height
    );
    expect(modalColor).not.toBe("rgba(0, 0, 0, 0)");

    await page.getByRole("button", { name: "계속하기" }).click();
    const innerAfterResume = await inner.boundingBox();
    expect(innerAfterResume).not.toBeNull();
    expect(Math.abs(innerAfterResume.x - innerBeforePause.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(innerAfterResume.y - innerBeforePause.y)).toBeLessThanOrEqual(2);

    const viewportOverflow = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      height: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    expect(viewportOverflow.scrollWidth).toBeLessThanOrEqual(viewportOverflow.width);
    expect(viewportOverflow.scrollHeight).toBeLessThanOrEqual(viewportOverflow.height);
  });
});
