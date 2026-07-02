import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

async function importPlaywrightTest() {
  try {
    return await import("@playwright/test");
  } catch {
    const cacheRoot = process.env.npm_config_cache;
    const npxRoot = cacheRoot ? join(cacheRoot, "_npx") : "";

    if (!npxRoot || !existsSync(npxRoot)) {
      throw new Error("@playwright/test is not available");
    }

    const candidates = readdirSync(npxRoot)
      .map((name) => join(npxRoot, name, "node_modules", "@playwright", "test", "index.js"))
      .filter((path) => existsSync(path))
      .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);

    if (candidates.length === 0) {
      throw new Error("@playwright/test is not available");
    }

    return import(pathToFileURL(candidates[0]).href);
  }
}

const playwrightTest = await importPlaywrightTest();
const testApi = playwrightTest.test ?? playwrightTest.default?.test ?? playwrightTest.default;

export const test = testApi;
export const expect = playwrightTest.expect ?? playwrightTest.default?.expect;
