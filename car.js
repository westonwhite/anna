// Car card + drive time home for car 1492 ("Caroline's whip"). Both need a one-time 6-digit pairing code.
var PAIR_BTN='<button class="btn ghost" type="button" onclick="pairShow(true)">Pair this screen</button>';
var DIR_BTN='<a class="btn" href="'+NAV_HOME+'" target="_blank" rel="noopener">Directions home</a>';
function unpaired(){
 $('eta').innerHTML='<div class="big"><b style="font-size:30px">Live drive time</b></div><div class="sub">Pair this screen once to see minutes home from wherever the car is.</div><div class="btns">'+DIR_BTN+PAIR_BTN+'</div>';
 $('car').innerHTML='<div class="muted">Battery, range, locks and cabin temperature for Caroline\'s whip show here after pairing.</div><div class="btns">'+PAIR_BTN+'</div>';}
function carState(c){if(c.charging_state==='Charging')return 'Charging';if(c.shift_state&&c.shift_state!=='P')return 'Driving';if(c.state==='asleep')return 'Asleep';if(c.state==='offline')return 'Offline';return 'Parked';}
function car(){if(!key()){unpaired();return Promise.resolve(null);}
 return api('/car/'+CAR).then(function(c){var b=c.battery_level;
  var tF=c.inside_temp_c==null?'—':Math.round(c.inside_temp_c*9/5+32)+'°F';
  var lk=c.locked==null?'—':c.locked?'Locked':'<span style="color:var(--bad)">Unlocked</span>';
  $('car').innerHTML='<div class="carrow"><div class="big"><b>'+(b==null?'—':b)+'<span style="font-size:28px">%</span></b></div><div class="batt"><i style="width:'+(b||0)+'%"></i></div></div>'
   +'<div class="kv"><div><small>Range</small><span>'+(c.est_range_mi==null?'—':Math.round(c.est_range_mi)+' mi')+'</span></div>'
   +'<div><small>Status</small><span>'+carState(c)+'</span></div><div><small>Doors</small><span>'+lk+'</span></div>'
   +'<div><small>Inside</small><span>'+tF+'</span></div><div><small>Charging</small><span>'+esc(c.charging_state||'—')+'</span></div>'
   +'<div><small>Updated</small><span>'+(c.updated?rel(c.updated):'—')+'</span></div></div>';
  $('carsrc').textContent=c.name||"Caroline's whip";return c;})
 .catch(function(e){if(!key())unpaired();else $('car').innerHTML='<div class="muted">Car data unavailable right now ('+esc(e.message)+'). Retrying soon.</div>';return null;});}
function eta(c){if(!key())return;
 if(!c||c.lat==null){$('eta').innerHTML='<div class="muted">Waiting for the car\'s location…</div><div class="btns">'+DIR_BTN+'</div>';return;}
 api('/eta?destination=home&only=fastest&origin='+c.lat.toFixed(5)+','+c.lon.toFixed(5)).then(function(j){var r=j.fastest;if(!r)throw new Error('no route');
  if(r.miles<0.3){$('eta').innerHTML='<div class="big"><b>Home</b></div><div class="sub">The car is at 1474 Lakeview Dr.</div>';}
  else $('eta').innerHTML='<div class="big"><b>'+r.min+'</b><span>min home</span></div><div class="sub">'+r.miles+' mi'
   +(r.delay_min?' · <span style="color:'+(r.delay_min>=5?'var(--bad)':'#f5c26b')+'">+'+r.delay_min+' min traffic</span>':' · light traffic')
   +(r.road?' · via '+esc(r.road):'')+'</div><div class="sub muted">Arrive about '+hm(new Date(Date.now()+r.min*60000))+'</div><div class="btns">'+DIR_BTN+'</div>';
  $('etasrc').textContent='1474 Lakeview Dr · '+hm(new Date());})
 .catch(function(e){$('eta').innerHTML='<div class="muted">Drive time unavailable right now ('+esc(e.message)+').</div><div class="btns">'+DIR_BTN+'</div>';});}
function carAndEta(){car().then(eta);}
