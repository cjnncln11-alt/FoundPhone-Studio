import { chromium } from "playwright";
const CHROME = "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome";
const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 430, height: 932 } })).newPage();
await page.goto("http://[::1]:4173/", { waitUntil: "networkidle" });
await page.mouse.move(215, 760); await page.mouse.down();
for (let y = 760; y >= 420; y -= 40) await page.mouse.move(215, y, { steps: 2 });
await page.mouse.up(); await page.waitForTimeout(600);
for (const d of ["1","0","0","3"]) { await page.locator(".pin-keypad button:has-text('" + d + "')").first().click(); await page.waitForTimeout(160); }
await page.waitForTimeout(1400);
await page.locator('[data-app-id="appstore"]').first().click();
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/store-open.png" });
console.log("sheet:", await page.locator(".launcher-sheet").count());
console.log("library:", await page.locator(".launcher-sheet.library, [class*=storefront]").count());
console.log("rows:", await page.locator(".runtime-library-row").count());
console.log("filters:", await page.locator(".library-filters").count());
console.log("search:", await page.locator(".launcher-search input").count());
await browser.close();
