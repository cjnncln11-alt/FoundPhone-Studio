import { chromium } from "playwright";
const CHROME = "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome";
const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 430, height: 932 } })).newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.goto("http://[::1]:4173/", { waitUntil: "networkidle" });
await page.mouse.move(215, 760); await page.mouse.down();
for (let y = 760; y >= 420; y -= 40) await page.mouse.move(215, y, { steps: 2 });
await page.mouse.up(); await page.waitForTimeout(600);
for (const d of ["1","0","0","3"]) { await page.locator(".pin-keypad button:has-text('" + d + "')").first().click(); await page.waitForTimeout(160); }
await page.waitForTimeout(1400);
await page.locator('[data-app-id="weibo"]').first().click();
await page.waitForTimeout(1500);
// 首页信息流卡片
await page.screenshot({ path: "/tmp/feed-card.png" });
const card = await page.evaluate(() => {
  const post = document.querySelector(".weibo-post");
  if (!post) return null;
  return {
    body: post.querySelector(".social-body > p")?.innerText,
    sub: post.querySelector(".weibo-author-sub")?.innerText,
    liveBadges: post.querySelectorAll(".weibo-live-badge").length,
    more: post.querySelector(".weibo-media-more")?.innerText,
    hot: post.querySelector(".weibo-hot-pill")?.innerText,
    actions: [...post.querySelectorAll(".weibo-actions button")].map(b => b.innerText.trim()),
  };
});
console.log("信息流卡片:", JSON.stringify(card, null, 1));
// 详情页
await page.locator("text=今天的我").first().click();
await page.waitForTimeout(900);
const detail = await page.evaluate(() => {
  const d = document.querySelector(".weibo-post-detail");
  return {
    sub: d?.querySelector(".weibo-author-sub")?.innerText,
    live: d?.querySelectorAll(".weibo-live-badge").length,
    more: d?.querySelector(".weibo-media-more")?.innerText,
    hot: d?.querySelector(".weibo-hot-pill")?.innerText,
    actions: [...(d?.querySelectorAll(".post-detail-actions button") ?? [])].map(b => b.innerText.trim()),
  };
});
console.log("详情页:", JSON.stringify(detail, null, 1));
await page.screenshot({ path: "/tmp/detail-top.png" });
await browser.close();
