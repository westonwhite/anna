// Shared helpers, clock and weather. No key lives in any file: the Worker key is saved in this browser only after redeeming a one-time 6-digit code.
var WORKER='https://tesla-fleet.smithfleet.workers.dev', WK_KEY='tesla_worker_key', CAR='1492';
var HOME='1474 Lakeview Dr, Tarpon Springs, FL 34689';
var NAV_HOME='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(HOME)+'&travelmode=driving';
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function key(){try{return localStorage.getItem(WK_KEY)||'';}catch(e){return '';}}
function api(p){return fetch(WORKER+p,{headers:key()?{'X-Access-Key':key()}:{},cache:'no-store'}).then(function(r){
 if(r.status===401){try{localStorage.removeItem(WK_KEY);}catch(e){}}if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});}
function hm(d){return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function rel(iso){if(!iso)return '';var m=Math.round((Date.now()-Date.parse(iso))/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function vis(){return !document.hidden;}

function tick(){var d=new Date();$('time').textContent=hm(d).replace(/\s?[AP]M$/,'');
 $('date').innerHTML=d.toLocaleDateString('en-US',{weekday:'long'})+'<br>'+d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' · '+(d.getHours()<12?'AM':'PM');}

var WMO={0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',80:'Showers',81:'Showers',82:'Heavy showers',95:'Thunderstorms',96:'Thunderstorms',99:'Thunderstorms'};
function wx(){fetch('https://api.open-meteo.com/v1/forecast?latitude=28.146&longitude=-82.757&current=temperature_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&forecast_hours=3&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York')
 .then(function(r){return r.json();}).then(function(j){var c=j.current,rain=Math.max.apply(null,(j.hourly&&j.hourly.precipitation_probability)||[0]);
  $('wx').innerHTML='<div class="t">'+Math.round(c.temperature_2m)+'°</div><div class="c">'+(WMO[c.weather_code]||'—')+' · wind '+Math.round(c.wind_speed_10m)+' mph<br>'+(rain>=30?'Rain '+rain+'% next 3h':'Dry next 3h')+' · Tarpon Springs</div>';})
 .catch(function(){});}
