import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 });
await page.goto("http://[::1]:4174/");
await page.waitForTimeout(3500);
await page.screenshot({ path: "/tmp/s0-lock.png" });
// 上滑解锁
await page.mouse.move(215, 760);
await page.mouse.down();
for (let y = 760; y >= 240; y -= 40) { await page.mouse.move(215, y); await page.waitForTimeout(16); }
await page.mouse.up();
await page.waitForTimeout(900);
for (const d of ["1","0","0","3"]) { await page.locator(".pin-keypad button:has-text('" + d + "')").first().click(); await page.waitForTimeout(180); }
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/s1-home.png" });
await page.locator('[data-app-id="weibo"]').first().click();
await page.waitForTimeout(2200);
await page.screenshot({ path: "/tmp/s2-weibo.png" });
const cards = await page.locator(".weibo-card, .social-card, article").evaluateAll(els => els.slice(0,6).map(e => ({ cls: e.className, txt: (e.textContent||"").slice(0,60) })));
console.log(JSON.stringify(cards, null, 1));
await browser.close();
