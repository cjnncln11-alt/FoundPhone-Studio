import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 });
await page.goto("https://addeaa0842bce9fe1.app.workbuddy.host/?sharecode=YYJMJI5ESH", { timeout: 90000 });
await page.waitForTimeout(6000);
await page.mouse.move(215, 760);
await page.mouse.down();
for (let y = 760; y >= 240; y -= 40) { await page.mouse.move(215, y); await page.waitForTimeout(16); }
await page.mouse.up();
await page.waitForTimeout(900);
for (const d of ["1","0","0","3"]) { await page.locator(".pin-keypad button:has-text('" + d + "')").first().click(); await page.waitForTimeout(180); }
await page.waitForTimeout(1500);
await page.locator('[data-app-id="weibo"]').first().click();
await page.waitForTimeout(3000);
// 打开记录27（夏夜烟火视频博）
for (let i = 0; i < 25; i++) {
  await page.mouse.wheel(0, 1400); await page.waitForTimeout(200);
  if (await page.locator('text=这夏夜的烟火还美吗').count() > 0) break;
}
await page.locator('text=这夏夜的烟火还美吗').first().click();
await page.waitForTimeout(2500);
const video = page.locator('video').first();
await video.scrollIntoViewIfNeeded();
// 播放视频
await video.evaluate(el => { el.muted = true; return el.play(); });
await page.waitForTimeout(1500);
const before = await video.evaluate(el => ({ paused: el.paused, time: el.currentTime }));
console.log('播放中(滚出前):', JSON.stringify(before));
// 向下滑过视频
await video.evaluate(el => el.currentTime = 5);
await page.waitForTimeout(800);
for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(250); }
await page.waitForTimeout(1200);
const after = await video.evaluate(el => ({ paused: el.paused, time: el.currentTime }));
console.log('滚出后:', JSON.stringify(after));
console.log(after.paused ? '✅ 自动暂停生效' : '❌ 仍在播放');
await page.screenshot({ path: "/tmp/v-autopause.png" });
await browser.close();
