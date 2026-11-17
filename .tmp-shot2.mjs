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
const post = page.locator(".weibo-post").nth(1);
await post.locator(".social-author").first().click();
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/s3-detail.png" });
const tabs = page.locator(".weibo-detail-tabs button");
console.log("tabs:", await tabs.allTextContents());
await tabs.nth(1).click();
await page.waitForTimeout(900);
await page.screenshot({ path: "/tmp/s4-comments.png" });
const rows = await page.locator(".post-detail-comment").evaluateAll(els => els.slice(0,4).map(e => ({ t: (e.textContent||"").slice(0,50), img: !!e.querySelector("img.weibo-comment-pic") })));
console.log(JSON.stringify(rows, null, 1));
await browser.close();
