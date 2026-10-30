// Test Anna's Photos slideshow locally (or BASE=<url> live). Saves shots/anna-photos-1000x650.png
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const SITE = '/workspace/anna-site', BASE = process.env.BASE || 'https://westonwhite.github.io/anna/';
const CT = { js: 'application/javascript', json: 'application/json', jpg: 'image/jpeg', png: 'image/png', html: 'text/html' };
function serveLocal(r) {
  const p = new URL(r.request().url()).pathname.replace(/^\/anna\/?/, '') || 'index.html', f = path.join(SITE, p);
  if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: 'nf' });
  r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: CT[p.split('.').pop()] || 'text/html' });
}
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 650 } }), page = await ctx.newPage(), errs = [], reqs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('request', q => { if (/\/photos\//.test(q.url())) reqs.push(q.url().replace(/.*\/photos\//, '')); });
  if (!process.env.BASE) await page.route('https://westonwhite.github.io/anna/**', serveLocal);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  const before = reqs.length;
  const home = await page.evaluate(() => ({ news: document.querySelectorAll('#ntrack .ni[data-i]').length, todo: document.querySelectorAll('#todolist .ev').length,
    ac: document.getElementById('acnext').innerText.slice(0, 40), eta: document.getElementById('eta').innerText.slice(0, 60), pair: !!document.getElementById('pairform'),
    robots: (document.querySelector('meta[name=robots]') || {}).content, sw: document.documentElement.scrollWidth }));
  await page.screenshot({ path: SITE + '/shots/anna-photos-home-1000x650.png' });
  await page.click('#phopen');
  await page.waitForTimeout(2500);
  const s1 = await page.evaluate(() => ({ n: document.getElementById('phn').innerText, on: document.querySelector('#phstage img.on') && document.querySelector('#phstage img.on').naturalWidth, fit: getComputedStyle(document.getElementById('phA')).objectFit }));
  const afterOpen = reqs.slice();
  await page.screenshot({ path: SITE + '/shots/anna-photos-1000x650.png' });
  await page.click('#phstage'); await page.waitForTimeout(1800);
  const s2 = await page.evaluate(() => document.getElementById('phn').innerText);
  await page.waitForTimeout(8500);
  const s3 = await page.evaluate(() => document.getElementById('phn').innerText);
  await page.click('#phpp'); await page.waitForTimeout(9000);
  const s4 = await page.evaluate(() => [document.getElementById('phn').innerText, document.getElementById('phpp').getAttribute('aria-label')]);
  await page.click('#phx'); await page.waitForTimeout(300);
  const closed = await page.evaluate(() => document.getElementById('photos').hidden);
  console.log(JSON.stringify({ home, photoReqsBeforeOpen: before, afterOpen, s1, afterTap: s2, afterAuto: s3, pausedAfter9s: s4, closed, totalPhotoReqs: reqs.length, errs: errs.slice(0, 5) }, null, 1));
  await b.close();
})();
