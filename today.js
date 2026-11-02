// 💜 Today card: next holiday / anniversary countdown, sunset (or sunrise) + tonight's weather from Open-Meteo (free, no key),
// and a Caroline dog fact of the day. Hidden on small screens by CSS. ES5 only (car browser).
var DOGFACTS=[
 "A dog's nose print is as unique as a human fingerprint.",
 "Dogs can smell roughly 10,000 to 100,000 times better than people.",
 "Dogs sweat mainly through the pads of their paws.",
 "A wagging tail to the right usually means a happy dog; to the left, a more unsure one.",
 "Dogs dream like we do. Twitchy paws during a nap often mean a dream chase.",
 "Puppies are born deaf and blind and open their eyes at about two weeks.",
 "Dogs have about 18 muscles that move their ears.",
 "A dog's sense of smell can tell what time of day it is by how scents fade.",
 "Dogs curl up to sleep to keep warm and protect their belly.",
 "Dogs can learn over 150 words. The smartest pups learn even more.",
 "Dogs see blue and yellow best. Red looks brownish-gray to them.",
 "A dog's normal body temperature is about 101 to 102.5 °F.",
 "Dogs have three eyelids. The third one helps keep their eyes clean.",
 "Wet noses help dogs catch scent molecules.",
 "Dogs can hear sounds about four times farther away than people can.",
 "Dogs lean on people they love to say they feel safe.",
 "Sniffing on a walk is mental exercise. Ten minutes of sniffing can tire a dog out.",
 "Dogs yawn when you yawn. Contagious yawning shows empathy.",
 "A dog's whiskers sense tiny changes in air movement.",
 "Dogs have about 1,700 taste buds. People have about 9,000.",
 "Dogs can read human facial expressions and tone of voice.",
 "The 'zoomies' have a fancy name: frenetic random activity periods.",
 "Dogs drink by curling their tongue backward like a ladle.",
 "A dog's heart beats about 60 to 140 times a minute, faster for small dogs.",
 "Dogs can be right- or left-pawed, just like people are right- or left-handed.",
 "Petting a dog can lower your blood pressure and stress.",
 "Dogs remember people by scent for years.",
 "Dogs feel the Earth's magnetic field and often line up north-south to potty.",
 "Seventy percent of people sign their dog's name on holiday cards.",
 "Dogs have been our best friends for at least 15,000 years.",
 "A tired dog is a happy dog. Play and walks help them sleep well."];
function tdDay(y,m,d){return new Date(y,m,d);}
function tdNth(y,m,wd,n){var d=new Date(y,m,1),off=(wd-d.getDay()+7)%7;return new Date(y,m,1+off+7*(n-1));}
function tdLast(y,m,wd){var d=new Date(y,m+1,0);return new Date(y,m,d.getDate()-((d.getDay()-wd+7)%7));}
function tdEaster(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
 h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da);}
function tdHolidays(y){return [
 ['🎆',"New Year's Day",tdDay(y,0,1)],['💘',"Valentine's Day",tdDay(y,1,14)],['☘️',"St. Patrick's Day",tdDay(y,2,17)],['🐣','Easter',tdEaster(y)],
 ['💐',"Mother's Day",tdNth(y,4,0,2)],['🇺🇸','Memorial Day',tdLast(y,4,1)],['🎇','the 4th of July',tdDay(y,6,4)],['🏖️','Labor Day',tdNth(y,8,1,1)],
 ['💍','our anniversary',tdDay(y,9,14)],['🎃','Halloween',tdDay(y,9,31)],['🦃','Thanksgiving',tdNth(y,10,4,4)],['🎄','Christmas',tdDay(y,11,25)]];}
function tdCountdown(){var now=new Date(),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate()),y=now.getFullYear(),best=null;
 tdHolidays(y).concat(tdHolidays(y+1)).forEach(function(h){var n=Math.round((h[2]-t0)/864e5);if(n>=0&&(!best||n<best.n))best={i:h[0],t:h[1],n:n};});
 if(!best)return;$('tcdi').textContent=best.i;
 var name=best.t==='our anniversary'?'our anniversary (Oct 14)':best.t;
 $('tcd').innerHTML=best.n===0?'<em>Happy '+esc(best.t.replace(/^our /,'').replace(/^the /,''))+'!</em> 💜':best.n===1?'<b>Tomorrow</b> is '+esc(name)
  :'<b>'+best.n+'</b> days until '+esc(name);}
function tdDog(){var now=new Date(),doy=Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate())-new Date(now.getFullYear(),0,0))/864e5);
 $('tdog').innerHTML='<em>Caroline fact:</em> '+esc(DOGFACTS[doy%DOGFACTS.length]);}
function tdLocal(s){var m=String(s||'').match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]):null;}
var TD_SUN=null;
function tdSunShow(){var j=TD_SUN;if(!j||!j.daily)return;var d=j.daily,now=new Date(),ss=tdLocal(d.sunset[0]),sr1=tdLocal(d.sunrise[1]),sr0=tdLocal(d.sunrise[0]);
 var lo=Math.round(sr0&&now<sr0?d.temperature_2m_min[0]:d.temperature_2m_min[1]),pp=d.precipitation_probability_max[ss&&now>ss?1:0];
 var txt;
 if(sr0&&now<sr0){$('tsni').textContent='🌄';txt='Sunrise <b>'+hm(sr0)+'</b>';}
 else if(ss&&now<ss){$('tsni').textContent='🌅';txt='Sunset <b>'+hm(ss)+'</b>';}
 else{$('tsni').textContent='🌙';txt='Sunrise <b>'+(sr1?hm(sr1):'--')+'</b> <small>tomorrow</small>';}
 $('tsun').innerHTML=txt+' <small>· low '+lo+'°'+(pp!=null?' · rain '+pp+'%':'')+'</small>';}
function tdSun(){fetch('https://api.open-meteo.com/v1/forecast?latitude=28.146&longitude=-82.757&daily=sunrise,sunset,temperature_2m_min,precipitation_probability_max&forecast_days=2&temperature_unit=fahrenheit&timezone=America%2FNew_York')
 .then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){TD_SUN=j;tdSunShow();})['catch'](function(){if(!TD_SUN)$('tsun').textContent='Sunset unavailable right now';});}
function today(){tdCountdown();tdDog();tdSunShow();}
today();tdSun();
setInterval(function(){if(vis())today();},60e3);
setInterval(function(){if(vis())tdSun();},3*3600e3);
