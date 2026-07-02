import { expect, test } from "./playwrightTest.js";

const GAME_ORDER = ["기억력 게임", "2048", "오목", "스도쿠", "노노그램", "한붓그리기"];
const REQUIRED_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
];

async function openMiniGames(page) {
  await page.goto("/#/mini-games");
  await expect(page.getByRole("heading", { name: "미니 게임" })).toBeVisible();

  if ((await page.locator(".mini-game-card").count()) === 0) {
    await page.getByRole("button", { name: "← 다른 게임하기" }).click();
  }

  await expect(page.locator(".mini-game-card")).toHaveCount(GAME_ORDER.length);
}

async function open2048(page) {
  await openMiniGames(page);
  await page.locator(".mini-game-card").filter({ hasText: "2048" }).click();
  await expect(page.getByRole("heading", { name: "TARGET 128" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(hasHorizontalOverflow).toBeFalsy();
}

async function getBoardValues(page) {
  return page.locator(".game-2048__cell").evaluateAll((cells) =>
    cells.map((cell) => cell.textContent.trim())
  );
}

test.describe("2048 mini game", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = function requestFullscreen() {
        return Promise.reject(new Error("fullscreen blocked for fallback test"));
      };
    });
  });

  test("opens implemented 2048 game from the mini game selector", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await openMiniGames(page);

    await expect(page.locator(".mini-game-card__title")).toHaveText(GAME_ORDER);
    await expect(page.locator(".mini-game-card").filter({ hasText: "2048" }).locator(".mini-game-card__status")).toHaveText("구현됨");

    await page.locator(".mini-game-card").filter({ hasText: "2048" }).click();
    await expect(page.getByRole("heading", { name: "TARGET 128" })).toBeVisible();
    await expect(page.getByText("새로운 퍼즐을 준비하고 있어요.")).toHaveCount(0);

    await page.getByRole("button", { name: "게임 시작" }).click();
    await expect(page.locator(".game-2048__cell.has-value")).toHaveCount(2);
    await expect(page.locator(".game-2048__meta")).toContainText("ROUND");
    await expect(page.locator(".game-2048__meta")).toContainText("TARGET");
    await expect(page.locator(".game-2048__meta")).toContainText("128");
    await expect(page.locator(".game-2048__meta")).toContainText("SCORE");
    await expect(page.locator(".game-2048__meta")).toContainText("0");
    await expect(page.locator(".game-2048__board")).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    expect(consoleErrors).toEqual([]);

    const boardBeforeExpand = await getBoardValues(page);
    await page.getByRole("button", { name: "게임 크게 보기" }).click();
    await expect(page.locator(".game-stage")).toHaveClass(/is-focus-mode/);
    await expect(page.locator("body")).toHaveClass(/game-stage-scroll-locked/);
    await expect(page.getByRole("button", { name: "전체화면 종료" })).toBeVisible();
    expect(await getBoardValues(page)).toEqual(boardBeforeExpand);

    await page.getByRole("button", { name: "전체화면 종료" }).click();
    await expect(page.locator(".game-stage")).not.toHaveClass(/is-focus-mode/);
    await expect(page.locator("body")).not.toHaveClass(/game-stage-scroll-locked/);
    expect(await getBoardValues(page)).toEqual(boardBeforeExpand);

    await page.getByRole("button", { name: "새 게임" }).click();
    await expect(page.getByRole("dialog", { name: "새 게임을 시작할까요?" })).toBeVisible();
    await page.getByRole("dialog", { name: "새 게임을 시작할까요?" }).getByRole("button", { name: "계속 플레이" }).click();
    expect(await getBoardValues(page)).toEqual(boardBeforeExpand);

    await page.getByRole("button", { name: "새 게임" }).click();
    await page.getByRole("dialog", { name: "새 게임을 시작할까요?" }).getByRole("button", { name: "새 게임" }).click();
    await expect(page.locator(".game-2048__cell.has-value")).toHaveCount(2);
    await expect(page.locator(".game-2048__meta")).toContainText("0");

    await page.getByRole("button", { name: "← 다른 게임하기" }).click();
    await expect(page.locator(".mini-game-card__title")).toHaveText(GAME_ORDER);
    expect(consoleErrors).toEqual([]);
  });

  test("keeps the 2048 board responsive without horizontal overflow", async ({ page }) => {
    for (const viewport of REQUIRED_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await open2048(page);
      await page.getByRole("button", { name: "게임 시작" }).click();
      await expectNoHorizontalOverflow(page);

      const boardBox = await page.locator(".game-2048__board").boundingBox();
      expect(boardBox).not.toBeNull();
      expect(Math.abs(boardBox.width - boardBox.height)).toBeLessThanOrEqual(1);

      await page.getByRole("button", { name: "게임 크게 보기" }).click();
      await expect(page.locator(".game-stage")).toHaveClass(/is-focus-mode/);
      await expect(page.getByRole("button", { name: "전체화면 종료" })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.getByRole("button", { name: "전체화면 종료" }).click();
      await expect(page.locator(".game-stage")).not.toHaveClass(/is-focus-mode/);
      await expectNoHorizontalOverflow(page);
    }
  });
});
