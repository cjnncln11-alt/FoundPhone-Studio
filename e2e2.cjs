const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome' });
  const ctx = await b.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);
  await p.mouse.move(215, 800); await p.mouse.down();
  for (let y = 800; y > 150; y -= 30) { await p.mouse.move(215, y); await p.waitForTimeout(20); }
  await p.mouse.up(); await p.waitForTimeout(1200);
  for (const k of ['1','0','0','3']) { await p.click('.pin-keypad button:has-text("'+k+'")',{timeout:6000}).catch(()=>{}); await p.waitForTimeout(350); }
  await p.waitForTimeout(2000);
  await p.click('[data-app-id="weibo"]',{timeout:20000}); await p.waitForTimeout(3000);
  const pos = await p.evaluate(() => {
    const v = [...document.querySelectorAll('video')][0];
    v.scrollIntoView({ block: 'center' });
    const r = v.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  });
  console.log('视频位置', JSON.stringify(pos));
  await p.evaluate(() => document.querySelector('video').play());
  await p.waitForTimeout(3000);
  const t0 = await p.evaluate(() => { const v = document.querySelector('video'); return { t: +v.currentTime.toFixed(1), paused: v.paused }; });
  console.log('播放中:', JSON.stringify(t0));
  const cx = pos.x + pos.w * 0.82, cy = pos.y + pos.h * 0.45;
  await p.mouse.dblclick(cx, cy);
  await p.waitForTimeout(400);
  const mid = await p.evaluate(() => { const v = document.querySelector('video'); return { t: +v.currentTime.toFixed(1), paused: v.paused, hint: document.querySelector('.v-seek-hint')?.textContent || '' }; });
  console.log('双击右侧(+10s):', JSON.stringify(mid));
  await p.waitForTimeout(5000);
  const t5 = await p.evaluate(() => { const v = document.querySelector('video'); return { t: +v.currentTime.toFixed(1), paused: v.paused }; });
  console.log('再播5s:', JSON.stringify(t5));
  await p.mouse.dblclick(pos.x + pos.w * 0.18, cy);
  await p.waitForTimeout(400);
  const back = await p.evaluate(() => { const v = document.querySelector('video'); return { t: +v.currentTime.toFixed(1), paused: v.paused, hint: document.querySelector('.v-seek-hint')?.textContent || '' }; });
  console.log('双击左侧(-10s):', JSON.stringify(back));
  await p.screenshot({ path: '/workspace/验证-双击提示.png' });
  await b.close();
  process.exit(0);
})();
