const { chromium } = require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [W,H] of [[850,650],[640,650]]){const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage();
await p.goto(process.env.U||'file:///workspace/anna-site/index.html');await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const b=document.getElementById('rqb');const ps=[...b.querySelectorAll('p')];const R=e=>{const x=e.getBoundingClientRect();return [Math.round(x.top),Math.round(x.bottom)]};
return {over:ps.map(x=>x.scrollHeight>x.clientHeight+1),on:b.querySelector('p.on').textContent.slice(0,20),rq:R(document.getElementById('rq')),tile:R(document.getElementById('phtile')),ac:R(document.querySelector('.ac')),scroll:document.scrollingElement.scrollHeight}});
console.log(W,JSON.stringify(r));await p.waitForTimeout(7500);console.log(' after7.5s',await p.evaluate(()=>document.querySelector('#rqb p.on').textContent.slice(0,20)));}
await b.close();})();
