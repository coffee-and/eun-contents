import { expect, test } from "@playwright/test";
import {
  createMemorySequence,
  evaluateMemoryChoice,
  getMemoryPreviewSeconds,
  getMemorySelectionSeconds,
  getMemorySymbolCount,
} from "../src/features/mini-games/memory/memoryOrder.logic.js";

const TEST_SYMBOLS = [
  { id: "cloud", name: "구름" },
  { id: "cherry", name: "체리" },
  { id: "star", name: "별" },
];

test.describe("memory order game logic", () => {
  test("increases the sequence every three rounds and caps it at ten", () => {
    expect(getMemorySymbolCount(1)).toBe(3);
    expect(getMemorySymbolCount(2)).toBe(3);
    expect(getMemorySymbolCount(3)).toBe(3);
    expect(getMemorySymbolCount(4)).toBe(4);
    expect(getMemorySymbolCount(6)).toBe(4);
    expect(getMemorySymbolCount(7)).toBe(5);
    expect(getMemorySymbolCount(22)).toBe(10);
    expect(getMemorySymbolCount(30)).toBe(10);
  });

  test("repeats the six, five, four second preview pattern", () => {
    expect(getMemoryPreviewSeconds(1)).toBe(6);
    expect(getMemoryPreviewSeconds(2)).toBe(5);
    expect(getMemoryPreviewSeconds(3)).toBe(4);
    expect(getMemoryPreviewSeconds(4)).toBe(6);
    expect(getMemoryPreviewSeconds(5)).toBe(5);
    expect(getMemoryPreviewSeconds(6)).toBe(4);
  });

  test("allows two seconds per answer", () => {
    expect(getMemorySelectionSeconds(3)).toBe(6);
    expect(getMemorySelectionSeconds(5)).toBe(10);
    expect(getMemorySelectionSeconds(10)).toBe(20);
  });

  test("creates a sequence with replacement", () => {
    const randomValues = [0.05, 0.05, 0.55];
    let index = 0;
    const sequence = createMemorySequence(
      TEST_SYMBOLS,
      3,
      () => randomValues[index++]
    );

    expect(sequence.map((symbol) => symbol.id)).toEqual(["cloud", "cloud", "cherry"]);
  });

  test("accepts the same selector more than once", () => {
    const sequence = [TEST_SYMBOLS[0], TEST_SYMBOLS[1], TEST_SYMBOLS[0]];

    const first = evaluateMemoryChoice(sequence, 0, "cloud");
    const second = evaluateMemoryChoice(sequence, first.nextStep, "cherry");
    const third = evaluateMemoryChoice(sequence, second.nextStep, "cloud");

    expect(first).toEqual({ correct: true, nextStep: 1, complete: false });
    expect(second).toEqual({ correct: true, nextStep: 2, complete: false });
    expect(third).toEqual({ correct: true, nextStep: 3, complete: true });
  });
});

test.describe("memory order game UI", () => {
  test("keeps panels aligned and restores progress on empty pedestals", async ({ page }) => {
    test.setTimeout(40000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      const randomValues = [0.55, 0.43, 0.55];
      let randomIndex = 0;
      Math.random = () => {
        const value = randomValues[randomIndex % randomValues.length];
        randomIndex += 1;
        return value;
      };
    });

    await page.goto("/#/mini-games");
    await page.getByRole("button", { name: /순서 맞추기/ }).click();
    await page.getByRole("button", { name: "게임 시작" }).click();

    const playShell = page.locator(".memory-game__play-shell");
    const problemPanel = page.locator(".memory-game__problem-panel");
    const selectionPanel = page.locator(".memory-game__selection-panel");
    const timerRow = page.locator(".memory-game__timer-row");
    const sequence = page.locator(".memory-sequence");
    const sequenceItems = sequence.locator(".memory-sequence__item");
    const sequenceSymbols = sequence.locator(".memory-symbol");

    await expect(problemPanel).toBeVisible();
    await expect(sequenceItems).toHaveCount(3);
    await expect(page.locator(".memory-card")).toHaveCount(8);
    await expect(page.locator(".memory-sequence__cover")).toHaveCount(0);

    const [problemBox, selectionBox, timerBox] = await Promise.all([
      problemPanel.boundingBox(),
      selectionPanel.boundingBox(),
      timerRow.boundingBox(),
    ]);

    expect(problemBox).not.toBeNull();
    expect(selectionBox).not.toBeNull();
    expect(timerBox).not.toBeNull();
    expect(Math.abs(problemBox.width - selectionBox.width)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(problemBox.x + problemBox.width - selectionBox.x - selectionBox.width)
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(timerBox.x + timerBox.width - problemBox.x - problemBox.width)
    ).toBeLessThanOrEqual(1);

    const pageWidth = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth);

    await expect(playShell).toHaveAttribute("data-phase", "preview", { timeout: 7000 });
    await expect(sequenceSymbols).toHaveCount(3);
    await expect(sequenceItems.locator(".memory-sequence__platform")).toHaveCount(3);

    const cloudButton = page.getByRole("button", { name: "구름 선택" });
    const cherryButton = page.getByRole("button", { name: "체리 선택" });
    await expect(cloudButton).toBeEnabled({ timeout: 12000 });
    await expect(playShell).toHaveAttribute("data-phase", "playing");

    await expect(sequenceSymbols).toHaveCount(0);
    await expect(sequenceItems.filter({ has: page.locator(".memory-symbol") })).toHaveCount(0);
    await expect(sequence.locator(".memory-sequence__item.is-empty")).toHaveCount(3);
    await expect(sequence.locator(".memory-sequence__platform")).toHaveCount(3);

    const bubbleStyle = await cloudButton.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        backgroundImage: style.backgroundImage,
        opacity: style.opacity,
      };
    });
    expect(bubbleStyle.backgroundImage).toContain("radial-gradient");
    expect(bubbleStyle.backgroundImage).toContain("conic-gradient");
    expect(bubbleStyle.opacity).toBe("1");

    await cloudButton.click();
    await expect(cloudButton).toBeEnabled();
    await expect(sequenceSymbols).toHaveCount(1);
    await expect(sequenceItems.nth(0)).toHaveAttribute("data-revealed", "true");
    await expect(sequenceItems.nth(1)).toHaveAttribute("data-revealed", "false");

    await cherryButton.click();
    await expect(cherryButton).toBeEnabled();
    await expect(sequenceSymbols).toHaveCount(2);
    await expect(sequenceItems.nth(1)).toHaveAttribute("data-revealed", "true");
    await expect(sequenceItems.nth(2)).toHaveAttribute("data-revealed", "false");

    await cloudButton.click();
    await expect(cloudButton).toBeEnabled();
    await expect(sequenceSymbols).toHaveCount(3);
    await expect(sequenceItems.nth(2)).toHaveAttribute("data-revealed", "true");
    await expect(page.getByText("CLEAR!")).toBeVisible();
  });
});
