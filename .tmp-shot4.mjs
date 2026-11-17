import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 });
await page.goto("http://[::1]:4174/");
await page.waitForTimeout(3200);
await page.mouse.move(215, 760); await page.mouse.down();
for (let y = 760; y >= 240; y -= 40) { await page.mouse.move(215, y); await page.waitForTimeout(16); }
await page.mouse.up(); await page.waitForTimeout(900);
for (const d of ["1","0","0","3"]) { await page.locator(".pin-keypad button:has-text('" + d + "')").first().click(); await page.waitForTimeout(160); }
await page.waitForTimeout(1000);
await page.locator('[data-app-id="weibo"]').first().click();
await page.waitForTimeout(1800);
await page.locator(".weibo-post").nth(1).locator(".social-author").first().click();
await page.waitForTimeout(1000);
await page.locator(".weibo-detail-tabs button").nth(1).click();
await page.waitForTimeout(800);
// 滚到底
const scroller = page.locator(".weibo-post-detail, .post-detail-scroll").first();
for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(120); }
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/d1.png" });
await page.mouse.wheel(0, -1600); await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/d2.png" });
await browser.close();
