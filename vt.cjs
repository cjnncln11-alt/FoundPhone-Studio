const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome' });
  const ctx = await b.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto('https://addeaa0842bce9fe1.app.workbuddy.host/?sharecode=YYJMJI5ESH', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(20000); await p.reload(); await p.waitForTimeout(8000);
  await p.mouse.move(215, 800); await p.mouse.down();
  for (let y = 800; y > 150; y -= 30) { await p.mouse.move(215, y); await p.waitForTimeout(20); }
  await p.mouse.up(); await p.waitForTimeout(1500);
  for (const k of ['1','0','0','3']) { await p.click('.pin-keypad button:has-text("'+k+'")',{timeout:8000}).catch(()=>{}); await p.waitForTimeout(400); }
  await p.waitForTimeout(2500);
  await p.click('[data-app-id="weibo"]',{timeout:30000}); await p.waitForTimeout(3500);
  const res = await p.evaluate(() => {
    const cards=[...document.querySelectorAll('.social-author')].map(a=>{let x=a;for(let k=0;k<8&&x;k++){x=x.parentElement;if(x&&x.tagName==='ARTICLE')return x;}return null;}).filter(Boolean);
    const out=[];
    for (const key of ['全民製作人們晚上好','熱情支持投票','中秋節快樂','中秋','一百萬','一百万','皮皮']) {
      const c=cards.find(c=>c.textContent.includes(key));
      if(!c) continue;
      const acts=[...c.querySelectorAll('.weibo-actions, .social-actions, [class*="action"]')].map(x=>x.innerText.replace(/\s+/g,' ')).join(' | ');
      out.push(key + ' → ' + (acts||c.innerText.replace(/\s+/g,' ').slice(-60)));
    }
    return out;
  });
  console.log(res.join('\n'));
  await b.close();
})();
