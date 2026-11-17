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
await page.waitForTimeout(1000);
await page.locator(".launcher-search input").fill("Instagram");
await page.waitForTimeout(500);
const row = page.locator(".runtime-library-row").first();
console.log("下载前按钮:", await row.locator(".library-get").innerText());
await row.locator(".library-get").click();
await page.waitForTimeout(900);
console.log("下载后按钮:", await row.locator(".library-get").innerText());
await page.screenshot({ path: "/tmp/store-download.png" });
// 返回桌面：点 App Store 页面的关闭按钮
const closed = await page.evaluate(() => {
  const btns = [...document.querySelectorAll(".launcher-sheet button")];
  return btns.map(b => b.getAttribute("aria-label")).filter(Boolean).slice(0, 8);
});
console.log("sheet 按钮:", closed);
await page.locator(".launcher-sheet button[aria-label='关闭']").first().click().catch(async () => {
  await page.keyboard.press("Escape");
});
await page.waitForTimeout(900);
const desk = await page.evaluate(() => [...document.querySelectorAll("[data-app-id]")].map(e => e.getAttribute("data-app-id")));
console.log("下载后桌面含 Instagram:", desk.includes("instagram"));
await page.screenshot({ path: "/tmp/desk-after-install.png" });
await browser.close();
