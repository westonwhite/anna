// Headline ticker + tap-to-read window (Worker /news: public, cached). Red flags mark big-deal stories.
var LOCAL_RX=/\b(tampa|pinellas|clearwater|st\.? ?pete(rsburg)?|tarpon|hillsborough|pasco|dunedin|palm harbor|largo|bay area|sarasota|manatee|hernando)\b/i;
var FL_RX=/\b(florida|tampa|pinellas|clearwater|st\.? ?pete(rsburg)?|gulf coast|bay area|tarpon|hillsborough|pasco|sarasota|fort myers|keys)\b/i;
function bigDeal(n){var t=n.title||'',td=t+' '+(n.desc||'');
 if(/^\s*(breaking|developing)\b|\bbreaking news\b/i.test(t)||(n.cats||[]).some(function(c){return /^breaking/i.test(c);}))return 'Breaking';
 if(/\b(declares? war|war (breaks out|erupts)|invad(es|ed|ing)|invasion of|missile (strike|attack)s?|ballistic missile|nuclear (strike|attack|test)|terror(ist)? attack|mass shooting|coup)\b/i.test(t))return 'War / attack';
 if(/\bearthquake\b/i.test(t)&&/\b(magnitude[- ]?[6-9]|[6-9]\.\d|tsunami|kill|dead|deaths)\b/i.test(td))return 'Major earthquake';
 if(/\b(hurricane|tropical storm|storm surge|tropical depression)\b/i.test(t)&&FL_RX.test(td))return 'Storm threat · Florida';
 if(/\b(hurricane|storm surge|tropical storm) (warning|watch)\b/i.test(t))return 'Storm warning';
 if(/\b(dow|s&p( 500)?|nasdaq|stock market|wall street|stocks)\b/i.test(t)&&!/\b(shares|stock) of\b/i.test(t)){
  var pct=(t.match(/\d+(?:\.\d+)?\s*%/g)||[]).map(function(x){return parseFloat(x);});
  if(/\b(crash|circuit breaker|trading halt(ed)?|bear market)\b/i.test(t))return 'Market crash';
  if(/\b(plunge|plummet|tumble|sink|drop|fall|slide|sell-?off|rout|tank)s?\b|\bfell\b|\bdown\b/i.test(t)&&pct.some(function(p){return p>=2&&p<50;}))return 'Market drop ≥2%';}
 if(/\b(fed|federal reserve|fomc|powell)\b/i.test(t)&&/\b(cuts?|raises?|hikes?|holds?|keeps?|leaves?)\b.*\brates?\b|\brate (cut|hike|decision)\b/i.test(t))return 'Fed rate decision';
 if(/\b(tesla|spacex|starship|elon musk|musk)\b/i.test(t)&&/\b(recalls?|recalling|explo(des|ded|sion)|crash(es|ed)?|probe|investigation|plunges?|soars?|surges?|earnings|bankrupt|resigns?|steps down|ban(s|ned)?|robotaxi (launch|approval|halt))\b/i.test(t))return 'Tesla / SpaceX';
 if(/\bground stop\b|\b(faa|tsa)\b.*\b(grounds?|grounding|halts?)\b|\bairspace (closed|closure)\b|\bflights? (halted|grounded)\b/i.test(t))return 'FAA / airspace';
 if(LOCAL_RX.test(td)&&/\b(evacuat\w*|boil[- ]water|tornado|flash flood|shelter in place|manhunt|amber alert|active shooter|hazmat|state of emergency|sinkhole swallows)\b/i.test(t))return 'Local emergency';
 return null;}
var NEWS=[],WARN='<svg class="warn" viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/></svg>';
function headlines(){fetch(WORKER+'/news').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
 var by={},srcs=[],out=[],seen={},i,s,n,k;
 (j.items||[]).forEach(function(x){if(!by[x.src]){by[x.src]=[];srcs.push(x.src);}by[x.src].push(x);});
 for(i=0;out.length<30&&srcs.some(function(q){return by[q][i];});i++)for(s=0;s<srcs.length;s++){n=by[srcs[s]][i];if(!n)continue;
  k=n.title.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(' ').slice(0,5).join(' ');if(seen[k])continue;seen[k]=1;n.flag=bigDeal(n);out.push(n);}
 NEWS=out.filter(function(n){return n.flag;}).concat(out.filter(function(n){return !n.flag;}));
 var reds=NEWS.filter(function(n){return n.flag;}).length;$('nred').textContent=reds?reds+' alert'+(reds>1?'s':''):'';
 var one=NEWS.map(function(n,i){return '<button type="button" class="ni'+(n.flag?' red':'')+'" data-i="'+i+'">'+(n.flag?WARN:'')+'<span class="ns">'+esc(n.src)+'</span>'+esc(n.title)+'</button>';}).join('');
 var tr=$('ntrack');tr.innerHTML=one+one;setTimeout(function(){tr.style.setProperty('--dur',Math.max(45,Math.round(tr.scrollWidth/2/65))+'s');},50);
}).catch(function(){if(!NEWS.length)$('ntrack').innerHTML='<span class="ni"><span class="ns">offline</span>Headlines unavailable right now</span>';});}
function openReader(n){$('rbox').className='rbox'+(n.flag?' red':'');$('rwhy').textContent=n.flag||'';
 $('rsrc').textContent=n.src+(n.time?' · '+hm(new Date(n.time))+' · '+rel(n.time):'');$('rh').textContent=n.title;
 $('rdesc').textContent=n.desc||'No summary in the feed. Tap below to read the full story.';
 var im=$('rimg');if(n.img){im.onerror=function(){im.hidden=true;};im.src=n.img;im.hidden=false;}else{im.hidden=true;im.removeAttribute('src');}
 $('ropen').href=n.link;$('rdr').hidden=false;$('nbar').className='paused';}
function closeReader(){$('rdr').hidden=true;$('nbar').className='';}
(function(){var bar=$('nbar'),t=null;
 bar.addEventListener('touchstart',function(){clearTimeout(t);bar.className='paused';},{passive:true});
 bar.addEventListener('touchend',function(){clearTimeout(t);t=setTimeout(function(){if($('rdr').hidden)bar.className='';},4000);},{passive:true});
 bar.addEventListener('mouseenter',function(){bar.className='paused';});
 bar.addEventListener('mouseleave',function(){if($('rdr').hidden)bar.className='';});
 $('ntrack').addEventListener('click',function(e){var b=e.target.closest('.ni[data-i]');if(b)openReader(NEWS[+b.getAttribute('data-i')]);});
 $('rclose').addEventListener('click',closeReader);
 $('rdr').addEventListener('click',function(e){if(e.target.id==='rdr')closeReader();});})();
