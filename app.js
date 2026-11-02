// Pairing form + startup timers. The pairing code is exchanged with the Worker; the result is stored only in this browser.
function pairShow(on){$('pairbox').hidden=!on;if(on){$('pairmsg').className='';$('pairmsg').textContent='Enter the 6-digit code (valid 10 min, works once).';setTimeout(function(){$('paircode').focus();},50);}}
$('pairx').onclick=function(){pairShow(false);};
$('paircode').addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,6);});
$('pairform').addEventListener('submit',function(ev){ev.preventDefault();var code=$('paircode').value.replace(/\D/g,''),m=$('pairmsg');
 if(code.length!==6){m.className='bad';m.textContent='Enter all 6 digits.';return;}
 $('pairgo').disabled=true;m.className='';m.textContent='Pairing…';
 fetch(WORKER+'/pair/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code}),cache:'no-store'}).then(function(r){
  if(r.ok)return r.json().then(function(j){if(!j.k)throw new Error('bad response');
   try{localStorage.setItem(WK_KEY,j.k);}catch(e){throw new Error('this browser blocked storage');}
   $('paircode').value='';m.className='ok';m.textContent='Paired ✓';setTimeout(function(){pairShow(false);},900);carAndEta();});
  m.className='bad';m.textContent=r.status===404?'Invalid or expired code. Get a new one and try again.':r.status===429?'Too many attempts. Wait 10 minutes.':'Pairing failed (HTTP '+r.status+').';})
 .catch(function(e){m.className='bad';m.textContent='Pairing failed: '+e.message;}).then(function(){$('pairgo').disabled=false;});});

tick();wx();headlines();todo();marine();acotar();carAndEta();
setInterval(tick,10000);
setInterval(function(){if(vis())wx();},10*60e3);
setInterval(function(){if(vis())headlines();},5*60e3);
setInterval(function(){if(vis()){todoRender();acCount();}},60e3);
setInterval(function(){if(vis()){todo();marine();acotar();}},30*60e3);
setInterval(function(){if(vis())carAndEta();},3*60e3);
document.addEventListener('visibilitychange',function(){if(vis())carAndEta();});
// Self-update: the car keeps this tab open for days, so check version.txt every 20 min and reload when a new version is published
// (only while nothing is open on top). Bump version.txt and APP_V together with the ?v= strings in index.html.
var APP_V='20261102';
setInterval(function(){if(!vis())return;fetch('version.txt?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.text();})
 .then(function(t){t=String(t).trim();if(/^\d{8}\w*$/.test(t)&&t!==APP_V&&$('tdo').hidden&&$('photos').hidden&&$('rdr').hidden&&$('pairbox').hidden)location.reload();})['catch'](function(){});},20*60e3);
