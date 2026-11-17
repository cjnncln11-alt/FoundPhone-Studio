import { chromium } from "playwright";
const CHROME = "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome";
const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.goto("http://[::1]:4173/", { waitUntil: "networkidle" });
await page.mouse.move(215, 760);
await page.mouse.down();
for (let y = 760; y >= 420; y -= 40) await page.mouse.move(215, y, { steps: 2 });
await page.mouse.up();
await page.waitForTimeout(600);
for (const d of ["1", "0", "0", "3"]) {
  await page.locator(`.pin-keypad button:has-text("${d}")`).first().click();
  await page.waitForTimeout(160);
}
await page.waitForTimeout(1500);
// 桌面不应出现被卸载的 App
const desk = await page.evaluate(() => {
  const ids = [...document.querySelectorAll("[data-app-id]")].map((e) => e.getAttribute("data-app-id"));
  return ids;
});
const removed = ["whatsapp","instagram","tiktok","twitter","telegram","line","snapchat","facebook","messenger","spotify","netflix","pinterest","threads","kakao"];
const leaked = removed.filter((id) => desk.includes(id));
console.log("桌面泄漏的被卸载 App:", leaked.length ? leaked : "无 ✓");
console.log("桌面可见 App:", [...new Set(desk)].join(", "));
await page.screenshot({ path: "/tmp/desk-no-apps.png" });
// 打开 App Store → 全部 → 下载一个（如 Instagram）
await page.locator('[data-app-id="appstore"]').first().click();
await page.waitForTimeout(900);
await page.locator("text=全部").first().click();
await page.waitForTimeout(500);
const igRow = page.locator(".runtime-library-row", { hasText: "Instagram" }).first();
const btn1 = await igRow.locator(".library-get").innerText();
console.log("Instagram 按钮状态:", btn1);
await igRow.locator(".library-get").click();
await page.waitForTimeout(800);
const btn2 = await igRow.locator(".library-get").innerText();
console.log("下载后按钮状态:", btn2);
await page.screenshot({ path: "/tmp/store-download.png" });
// 回桌面确认 Instagram 出现
await page.locator("[aria-label='关闭']").first().click().catch(() => {});
await page.waitForTimeout(500);
await page.keyboard.press("Escape").catch(() => {});
await page.mouse.click(215, 900);
await page.waitForTimeout(700);
const desk2 = await page.evaluate(() => [...document.querySelectorAll("[data-app-id]")].map((e) => e.getAttribute("data-app-id")));
console.log("下载后桌面含 Instagram:", desk2.includes("instagram"));
await page.screenshot({ path: "/tmp/desk-after-install.png" });
await browser.close();
