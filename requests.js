// 💜 Requests card: hidden unless requests.json has a live item. Edit requests.json to add one, e.g.
//   {"text":"🛒 Grab dog food on the way home","from":"Weston","date":"2026-11-02"}
// An item shows from its "date" for maxAgeDays days (or until "expires", YYYY-MM-DD, end of that day), and hides when "done": true.
// Items without a date never show, so nothing goes stale. An empty list hides the whole card. ES5 only (car browser).
var RQ={items:[],i:0,timer:null},RQ_MS=7000;
function rqDay(s){var m=String(s||'').match(/^(\d{4})-(\d\d)-(\d\d)(?:[T ](\d\d):(\d\d))?/);return m?new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)):null;}
function rqLive(j){var now=Date.now(),max=+j.maxAgeDays>0?+j.maxAgeDays:2;
 return (j.items||[]).filter(function(x){if(!x||!x.text||x.done)return false;var d=rqDay(x.date);if(!d||d.getTime()>now)return false;
  if(x.expires){var e=rqDay(x.expires);return !!e&&now<e.getTime()+864e5;}
  var d0=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();return now<d0+max*864e5;});}
function rqShow(items){var c=$('rq'),b=$('rqb'),d=$('rqd'),was=!c.hidden;clearInterval(RQ.timer);RQ.items=items;RQ.i=0;b.innerHTML='';d.innerHTML='';
 items.forEach(function(x,k){var p=document.createElement('p');p.textContent=x.text+(x.from?' · '+x.from:'');if(!k)p.className='on';b.appendChild(p);
  if(items.length>1){var i=document.createElement('i');if(!k)i.className='on';d.appendChild(i);}});
 c.hidden=!items.length;
 if(items.length>1)RQ.timer=setInterval(function(){if(!vis())return;var ps=b.getElementsByTagName('p'),ds=d.getElementsByTagName('i');
  ps[RQ.i].className='';if(ds[RQ.i])ds[RQ.i].className='';RQ.i=(RQ.i+1)%ps.length;ps[RQ.i].className='on';if(ds[RQ.i])ds[RQ.i].className='on';},RQ_MS);
 if(was!==!c.hidden&&typeof ptFit==='function')ptFit();}
function rqLoad(){fetch('requests.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json();})
 .then(function(j){rqShow(rqLive(j));})['catch'](function(){rqShow([]);});}
rqLoad();setInterval(function(){if(vis())rqLoad();},10*60e3);
