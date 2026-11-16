import { chromium } from "playwright";

const CHROME = "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome";
const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.goto("http://[::1]:4173/", { waitUntil: "networkidle" });
// 解锁：上滑 + 密码 1003
await page.evaluate(() => {
  const el = document.querySelector(".lock-screen, .phone-screen");
  if (el) el.scrollTop = 0;
});
await page.mouse.move(215, 760);
await page.mouse.down();
for (let y = 760; y >= 420; y -= 40) await page.mouse.move(215, y, { steps: 2 });
await page.mouse.up();
await page.waitForTimeout(600);
for (const d of ["1", "0", "0", "3"]) {
  await page.locator(`.pin-keypad button:has-text("${d}")`).first().click();
  await page.waitForTimeout(160);
}
await page.waitForTimeout(1200);
await page.locator('[data-app-id="weibo"]').first().click();
await page.waitForTimeout(2500);
// 注入弹窗时间记录
await page.evaluate(() => {
  window.__hits = [];
  window.__el = null;
  const obs = new MutationObserver(() => {
    const el = document.querySelector(".weibo-notif");
    if (el && el !== window.__el) {
      window.__hits.push({
        t: Math.round(performance.now()),
        text: (el.innerText || "").replace(/\n/g, " ").slice(0, 26),
      });
      window.__el = el;
    } else if (!el) {
      window.__el = null;
    }
  });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
});
// 退出微博回到桌面
const back = page.locator(".app-back, .status-back, [aria-label='返回']").first();
await back.click();
const exitT = await page.evaluate(() => Math.round(performance.now()));
console.log("EXIT_AT", exitT);
await page.waitForTimeout(115000);
const hits = await page.evaluate(() => window.__hits);
let prev = exitT;
for (const h of hits) {
  console.log(`+${((h.t - exitT) / 1000).toFixed(1)}s  间隔 ${((h.t - prev) / 1000).toFixed(1)}s  ${h.text}`);
  prev = h.t;
}
await page.screenshot({ path: "/workspace/退出后弹窗频率验证.png" });
await browser.close();
