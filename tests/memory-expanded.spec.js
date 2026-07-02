import { expect, test } from "@playwright/test";

test.describe("memory game expanded layout", () => {
  test("keeps the card surface, cylinder pedestal, and state views inside the expanded stage", async ({ page }) => {
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
    const pedestal = stage.locator(".memory-pedestal").first();
    const pedestalTop = pedestal.locator(".memory-pedestal__top");
    const pedestalBody = pedestal.locator(".memory-pedestal__body");
    const pedestalShadow = pedestal.locator(".memory-pedestal__shadow");
    const sequenceItem = stage.locator(".memory-sequence__item").first();

    await expect(stage).toHaveClass(/is-focus-mode/);
    await expect(overlay).toHaveAttribute("data-state", "countdown");
    await expect(overlay.locator(".memory-game__state-view")).toHaveAttribute(
      "data-state",
      "countdown"
    );

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

    const innerBeforePause = await inner.boundingBox();
    expect(innerBeforePause).not.toBeNull();
    expect(innerBeforePause.x).toBeGreaterThanOrEqual(8);
    expect(innerBeforePause.y).toBeGreaterThanOrEqual(8);

    await page.getByRole("button", { name: "일시정지" }).click();
    const pauseDialog = page.getByRole("dialog", { name: "일시정지" });
    const pauseStateView = pauseDialog.locator(".memory-game__state-view");
    await expect(pauseDialog).toBeVisible();
    await expect(overlay).toHaveAttribute("data-state", "paused");
    await expect(pauseStateView).toHaveAttribute("data-state", "paused");

    const [innerWhilePaused, pauseBox, pauseBorderWidth] = await Promise.all([
      inner.boundingBox(),
      pauseStateView.boundingBox(),
      pauseStateView.evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).borderTopWidth)
      ),
    ]);

    expect(innerWhilePaused).not.toBeNull();
    expect(pauseBox).not.toBeNull();
    expect(Math.abs(innerWhilePaused.x - innerBeforePause.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(innerWhilePaused.y - innerBeforePause.y)).toBeLessThanOrEqual(2);
    expect(pauseBorderWidth).toBe(0);
    expect(pauseBox.x).toBeGreaterThanOrEqual(innerWhilePaused.x);
    expect(pauseBox.y).toBeGreaterThanOrEqual(innerWhilePaused.y);
    expect(pauseBox.x + pauseBox.width).toBeLessThanOrEqual(
      innerWhilePaused.x + innerWhilePaused.width
    );
    expect(pauseBox.y + pauseBox.height).toBeLessThanOrEqual(
      innerWhilePaused.y + innerWhilePaused.height
    );

    await page.getByRole("button", { name: "계속하기" }).click();
    await expect(stage.locator(".memory-game__play-shell")).toHaveAttribute(
      "data-phase",
      "playing",
      { timeout: 15000 }
    );

    const [itemBox, pedestalBox, topBox, bodyBox, shadowBox] = await Promise.all([
      sequenceItem.boundingBox(),
      pedestal.boundingBox(),
      pedestalTop.boundingBox(),
      pedestalBody.boundingBox(),
      pedestalShadow.boundingBox(),
    ]);

    expect(itemBox).not.toBeNull();
    expect(pedestalBox).not.toBeNull();
    expect(topBox).not.toBeNull();
    expect(bodyBox).not.toBeNull();
    expect(shadowBox).not.toBeNull();
    expect(pedestalBox.width / itemBox.width).toBeGreaterThan(0.84);
    expect(pedestalBox.height).toBeGreaterThanOrEqual(24);
    expect(bodyBox.height).toBeGreaterThan(topBox.height);
    expect(shadowBox.y).toBeGreaterThan(bodyBox.y);
    await expect(stage.locator(".memory-sequence__item.is-empty")).toHaveCount(3);
    await expect(stage.locator(".memory-pedestal")).toHaveCount(3);

    await page.getByRole("button", { name: "구름 선택" }).click();
    const failedDialog = page.getByRole("dialog", { name: /GAME OVER|최고기록 갱신/ });
    const failedStateView = failedDialog.locator(".memory-game__state-view");
    await expect(failedDialog).toBeVisible();
    await expect(overlay).toHaveAttribute("data-state", "failed");
    await expect(failedStateView).toHaveAttribute("data-state", "failed");

    const [innerWhileFailed, failedBox, failedBorderWidth] = await Promise.all([
      inner.boundingBox(),
      failedStateView.boundingBox(),
      failedStateView.evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).borderTopWidth)
      ),
    ]);

    expect(innerWhileFailed).not.toBeNull();
    expect(failedBox).not.toBeNull();
    expect(Math.abs(innerWhileFailed.x - innerBeforePause.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(innerWhileFailed.y - innerBeforePause.y)).toBeLessThanOrEqual(2);
    expect(failedBorderWidth).toBe(0);
    expect(failedBox.x).toBeGreaterThanOrEqual(innerWhileFailed.x);
    expect(failedBox.y).toBeGreaterThanOrEqual(innerWhileFailed.y);
    expect(failedBox.x + failedBox.width).toBeLessThanOrEqual(
      innerWhileFailed.x + innerWhileFailed.width
    );
    expect(failedBox.y + failedBox.height).toBeLessThanOrEqual(
      innerWhileFailed.y + innerWhileFailed.height
    );

    const stageOverflow = await stage.evaluate((element) => ({
      width: element.clientWidth,
      scrollWidth: element.scrollWidth,
      height: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(stageOverflow.scrollWidth).toBeLessThanOrEqual(stageOverflow.width);
    expect(stageOverflow.scrollHeight).toBeLessThanOrEqual(stageOverflow.height);
  });
});
