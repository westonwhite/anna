// Photo square on the main page: screenshots + no-scroll check at car-browser widths. Local by default, BASE=<url> for live.
// PAIRED=1 fakes a paired screen (mock Worker /car + /eta) to check the taller paired layout.
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const SITE = '/workspace/anna-site', BASE = process.env.BASE || 'https://westonwhite.github.io/anna/', PAIRED = !!process.env.PAIRED;
const CT = { js: 'application/javascript', json: 'application/json', jpg: 'image/jpeg', png: 'image/png', html: 'text/html' };
function serveLocal(r) {
  const p = new URL(r.request().url()).pathname.replace(/^\/anna\/?/, '') || 'index.html', f = path.join(SITE, p);
  if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: 'nf' });
  r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: CT[p.split('.').pop()] || 'text/html' });
}
const SIZES = (process.env.SIZES || '1000x650,850x650,640x650,1280x800').split(',');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const out = [];
  for (const sz of SIZES) {
    const [W, H] = sz.split('x').map(Number);
    const ctx = await b.newContext({ viewport: { width: W, height: H } }), page = await ctx.newPage(), errs = [], reqs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('request', q => { if (/\/photos\/.*\.jpg/.test(q.url())) reqs.push(q.url().replace(/.*\/photos\//, '')); });
    if (!process.env.BASE) await page.route('https://westonwhite.github.io/anna/**', serveLocal);
    if (PAIRED) {
      await page.addInitScript(() => localStorage.setItem('tesla_worker_key', 'test'));
      await page.route('https://tesla-fleet.smithfleet.workers.dev/car/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ battery_level: 78, est_range_mi: 241, state: 'online', shift_state: 'P', locked: true, inside_temp_c: 23, charging_state: 'Disconnected', updated: new Date().toISOString(), lat: 28.15, lon: -82.75, name: "Caroline's whip" }) }));
      await page.route('https://tesla-fleet.smithfleet.workers.dev/eta**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ fastest: { min: 38, miles: 27.4, delay_min: 6, road: 'Veterans Expy' } }) }));
    }
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(6000);
    const m = await page.evaluate(() => {
      const t = document.getElementById('phtile').getBoundingClientRect(), on = document.querySelector('#phtile img.on');
      const cut = [...document.querySelectorAll('main .card, header, #nbar')].filter(e => { const r = e.getBoundingClientRect(); return r.bottom > innerHeight + 0.5 || r.right > innerWidth + 0.5; }).map(e => e.className || e.id);
      return { scrollH: document.scrollingElement.scrollHeight, innerH: innerHeight, scrollW: document.scrollingElement.scrollWidth, innerW: innerWidth,
        tile: [Math.round(t.width), Math.round(t.height), Math.round(t.top), Math.round(t.left)], photo: on && on.src.replace(/.*\//, ''), n: document.getElementById('ptn').innerText,
        acBottom: Math.round(document.querySelector('.ac').getBoundingClientRect().bottom), feedH: document.getElementById('acfeed').clientHeight, todoListH: document.getElementById('todolist').clientHeight, cut };
    });
    const shot = `${SITE}/shots/anna-photosquare-${PAIRED ? 'paired-' : ''}${process.env.BASE ? 'live-' : ''}${W}x${H}.png`;
    await page.screenshot({ path: shot });
    let rot = null;
    if (process.env.ROT) { const p0 = m.photo; await page.waitForTimeout(10000); rot = await page.evaluate(() => document.getElementById('ptn').innerText); 
      await page.click('#phtile'); await page.waitForTimeout(1500);
      rot = { first: m.n, after10s: rot, viewerOpen: !(await page.evaluate(() => document.getElementById('photos').hidden)), viewer: await page.evaluate(() => document.getElementById('phn').innerText) };
      await page.click('#phx'); }
    out.push({ sz, fits: m.scrollH <= m.innerH && m.scrollW <= m.innerW, ...m, rot, jpgReqs: reqs, shot, errs: errs.slice(0, 4) });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
