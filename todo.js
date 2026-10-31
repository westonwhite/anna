// "Things to do" card: live Tarpon Springs city calendar (Fun) + hand-checked dog, aviation and boating picks (picks.js).
var TODO=[],TODO_TAG='All',TAGS={Dog:'Dog-friendly',Aviation:'Aviation',Boating:'Boating',Fun:'Fun'};
var TRIBE='https://exploretarponsprings.com/wp-json/tribe/events/v1/events?per_page=25';
function unent(s){var d=document.createElement('textarea');d.innerHTML=String(s||'').replace(/<[^>]+>/g,' ');return d.value.replace(/\s+/g,' ').trim();}
function localDate(s){var m=String(s||'').match(/^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d)/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]):null;}
function whenTxt(e){var d=e.s,o={weekday:'short',month:'short',day:'numeric'},t=d.toLocaleDateString('en-US',o);
 if(e.e&&e.e.toDateString()!==d.toDateString())t+=' – '+e.e.toLocaleDateString('en-US',{month:'short',day:'numeric'});
 else if(!e.day)t+=' · '+hm(d).replace(':00','');return t;}
// Paged list: touch scrolling is unreliable in the car browser, so rows have a fixed height and big ▲/▼ buttons flip pages.
// "More" opens a full-screen page (#tdo) with a 1-3 column grid and large Prev/Next buttons.
var TP=0,TDP=0,TODO_MAX=60;
function todoList(){var now=Date.now();return TODO.filter(function(e){return (e.e||e.s).getTime()>now&&(TODO_TAG==='All'||e.tag===TODO_TAG);}).slice(0,TODO_MAX);}
function evHtml(e){var k=TODO.indexOf(e);
 return '<button type="button" class="ev" data-i="'+k+'"><span class="ew">'+esc(whenTxt(e))+'</span><span class="et">'+esc(e.t)+'</span><span class="ex"><i class="tg t'+e.tag+'">'+TAGS[e.tag]+'</i>'+esc(e.where||'')+'</span></button>';}
function emptyHtml(){return '<div class="muted" style="padding:10px 4px">'+(TODO.length?'Nothing coming up in this group right now.':'Loading events…')+'</div>';}
function tabsOn(id){var bt=$(id).getElementsByTagName('button'),i;for(i=0;i<bt.length;i++)bt[i].className=bt[i].getAttribute('data-k')===TODO_TAG?'on':'';}
function todoRender(){var list=todoList(),el=$('todolist');tabsOn('todotabs');
 var rh=parseFloat(getComputedStyle(el).getPropertyValue('--evh'))||60,per=Math.max(1,Math.floor((el.clientHeight+1)/rh)),pages=Math.max(1,Math.ceil(list.length/per));
 if(TP>=pages)TP=pages-1;if(TP<0)TP=0;
 el.innerHTML=list.length?list.slice(TP*per,TP*per+per).map(evHtml).join(''):emptyHtml();
 $('tup').disabled=TP<=0;$('tdn').disabled=TP>=pages-1;$('tpn').textContent=list.length?(TP+1)+'/'+pages:'';
 if(!$('tdo').hidden)tdRender();}
function tdRender(){var list=todoList(),g=$('tdgrid');tabsOn('tdtabs');
 var W=g.clientWidth,cols=W>=1000?3:W>=520?2:1;g.style.setProperty('--tdc',cols);
 var rows=Math.max(1,Math.floor((g.clientHeight+6)/70)),per=rows*cols,pages=Math.max(1,Math.ceil(list.length/per));
 if(TDP>=pages)TDP=pages-1;if(TDP<0)TDP=0;
 g.innerHTML=list.length?list.slice(TDP*per,TDP*per+per).map(evHtml).join(''):emptyHtml();
 $('tdup').disabled=TDP<=0;$('tddn').disabled=TDP>=pages-1;$('tdpn').textContent=list.length?'Page '+(TDP+1)+' / '+pages:'';}
function tdOpen(){$('tdo').hidden=false;TDP=0;tdRender();}
function todoSet(live){var all=[];
 PICKS.forEach(function(p){all.push({tag:p.tag,t:p.t,s:new Date(p.start),e:p.end?new Date(p.end):null,day:p.day,where:p.where,url:p.url,desc:p.desc,src:'Checked pick'});});
 (live||[]).forEach(function(x){var s=localDate(x.start||x.start_date),e=localDate(x.end||x.end_date);if(!s||!x.url)return;
  var t=unent(x.t||x.title);if(all.some(function(a){return a.t.toLowerCase()===t.toLowerCase()&&a.s.toDateString()===s.toDateString();}))return;
  all.push({tag:'Fun',t:t,s:s,e:e,day:!!x.all_day,where:unent(x.where||(x.venue&&x.venue.venue)||'Tarpon Springs'),url:x.url,desc:unent(x.desc||x.excerpt||'').slice(0,400),src:'Explore Tarpon Springs'});});
 all.sort(function(a,b){return a.s-b.s;});TODO=all;todoRender();}
function todo(){if(!TODO.length)todoSet(null);
 fetch(WORKER+'/events').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){todoSet(j.items);$('todosrc').textContent='Tarpon Springs calendar + picks';})
 .catch(function(){fetch(TRIBE).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){todoSet(j.events||[]);$('todosrc').textContent='Tarpon Springs calendar + picks';})
  .catch(function(){$('todosrc').textContent='Checked picks (city calendar offline)';});});}
function marine(){Promise.all([
  fetch('https://marine-api.open-meteo.com/v1/marine?latitude=28.17&longitude=-82.86&current=wave_height&length_unit=imperial').then(function(r){return r.json();}),
  fetch('https://api.open-meteo.com/v1/forecast?latitude=28.17&longitude=-82.80&current=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kn').then(function(r){return r.json();})
 ]).then(function(a){var w=a[0].current&&a[0].current.wave_height,c=a[1].current,dirs=['N','NE','E','SE','S','SW','W','NW'];
  var kt=Math.round(c.wind_speed_10m),g=Math.round(c.wind_gusts_10m),d=dirs[Math.round(c.wind_direction_10m/45)%8];
  var mood=kt>=18||g>=28||(w!=null&&w>=3)?'<b style="color:var(--bad)">rough</b>':kt>=12||g>=20||(w!=null&&w>=2)?'<b style="color:#f5c26b">choppy</b>':'<b style="color:var(--good)">nice</b>';
  $('boat').innerHTML='<svg class="i" viewBox="0 0 24 24"><path d="M3 17c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0"/><path d="M5 14l1-5h12l1 5M12 9V4l4 3"/></svg>Boating, Anclote: '+mood+' · '+d+' '+kt+' kt g'+g+(w!=null?' · '+w.toFixed(1)+' ft waves':'');})
 .catch(function(){$('boat').textContent='';});}
function todoTab(e){var b=e.target.closest('button[data-k]');if(b){TODO_TAG=b.getAttribute('data-k');TP=0;TDP=0;todoRender();}}
$('todotabs').addEventListener('click',todoTab);$('tdtabs').addEventListener('click',todoTab);
$('tup').onclick=function(){TP--;todoRender();};$('tdn').onclick=function(){TP++;todoRender();};$('tfull').onclick=tdOpen;
$('tdup').onclick=function(){TDP--;tdRender();};$('tddn').onclick=function(){TDP++;tdRender();};$('tdx').onclick=function(){$('tdo').hidden=true;};
var TD_RZ=null,TD_H=0;function todoRefit(){clearTimeout(TD_RZ);TD_RZ=setTimeout(todoRender,150);}window.addEventListener('resize',todoRefit);
// Re-page when the list's height changes (e.g. the boating line appears under it).
if(window.ResizeObserver)new ResizeObserver(function(){var h=$('todolist').clientHeight;if(h!==TD_H){TD_H=h;todoRefit();}}).observe($('todolist'));else setTimeout(todoRender,5000);
function todoOpenEv(e){var b=e.target.closest('.ev[data-i]');if(!b)return;var x=TODO[+b.getAttribute('data-i')];
 openReader({src:TAGS[x.tag]+' · '+whenTxt(x),title:x.t,desc:(x.where?x.where+'. ':'')+(x.desc||''),link:x.url,btn:'Open event page'});}
$('todolist').addEventListener('click',todoOpenEv);$('tdgrid').addEventListener('click',todoOpenEv);
