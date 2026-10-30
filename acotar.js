// ACOTAR corner: release countdown (dates verified: ACOSH out Oct 27, 2026; A Court of Forgotten Melody Jan 12, 2027 per Bloomsbury / Publishers Weekly),
// question of the day, and a rotating feed of top r/acotar posts + Sarah J. Maas news (Worker /acotar). Spoiler-tagged titles stay hidden until tapped.
var NEXT_BOOK={t:'A Court of Forgotten Melody',d:new Date(2027,0,12)};
var QOTD=['Which court would you live in: Night, Day, Spring, Summer, Autumn, Winter or Dawn?',
 'If Caroline were a faerie hound, which court would she belong to?',
 'Which Inner Circle member would you trust to dog-sit Caroline for a weekend?',
 'Starfall in Velaris: who are you dancing with?',
 'Pick a power: winnowing, daemati mind-talk, or shadowsinging?',
 'Which character would you want on a 12-hour shift with you?',
 'Tea, wine, or chocolate cake at the River House?',
 'Which book in the series would you reread first?',
 'Who would win game night at the River House?',
 'Calanmai or Nynsar: which festival are you going to?',
 'Which character would be the best road-trip co-pilot?',
 'If you got one ACOTAR tattoo, what would it be?',
 'Who is the funniest character in the series?',
 'Which side character deserves their own book next?',
 'Velaris at Starfall or the Spring Court in full bloom?',
 'Which court\'s colors would you pick for your car?',
 'Rita\'s, the night market, or a quiet bookshop: where are you heading in Velaris?',
 'Which character would be the best nurse? Which would be the worst patient?',
 'If you could winnow anywhere in Tampa Bay, where would you go first?',
 'Cassian, Azriel or Rhys: who gives the best pep talk?'];
var AC=[],ACP=0,ACT=null;
function acCount(){var now=new Date(),days=Math.ceil((NEXT_BOOK.d-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5);
 var day=Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-Date.UTC(2026,0,1))/864e5);
 $('acnext').innerHTML=days>0?'<b>'+days+'</b><span>day'+(days===1?'':'s')+' until <em>'+NEXT_BOOK.t+'</em><br>Jan 12, 2027 · ACOTAR 7</span>'
  :'<b>Out</b><span><em>'+NEXT_BOOK.t+'</em> is out now!</span>';
 $('acq').textContent=QOTD[((day%QOTD.length)+QOTD.length)%QOTD.length];}
function acRender(){if(!AC.length){$('acfeed').innerHTML='<div class="muted">Fan posts loading…</div>';return;}
 var n=4,out='',i,k,x;for(i=0;i<n&&i<AC.length;i++){k=(ACP+i)%AC.length;x=AC[k];
  out+='<button type="button" class="ap'+(x.spoiler?' sp':'')+'" data-i="'+k+'"><span class="as">'+esc(x.src==='r/acotar'?'r/acotar':'News · '+x.src)+'</span>'
   +(x.spoiler?'Spoiler-tagged post · tap to peek':esc(x.title))+'</button>';}
 $('acfeed').innerHTML=out;}
function acotar(){acCount();
 fetch(WORKER+'/acotar').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){var f=j.fans||[],nw=j.news||[],out=[],i;
  for(i=0;i<Math.max(f.length,nw.length);i++){if(f[i])out.push(f[i]);if(i%2===0&&nw[i/2])out.push(nw[i/2]);}
  AC=out;ACP=0;acRender();$('acsrc').textContent=(f.length?'r/acotar top today':'')+(f.length&&nw.length?' + ':'')+(nw.length?'SJM news':'');})
 .catch(function(){if(!AC.length)$('acfeed').innerHTML='<div class="muted">Fan feed unavailable right now.</div>';});
 if(!ACT)ACT=setInterval(function(){if(vis()&&AC.length>4&&$('rdr').hidden){ACP=(ACP+4)%AC.length;acRender();}},12000);}
$('acfeed').addEventListener('click',function(e){var b=e.target.closest('.ap[data-i]');if(!b)return;var x=AC[+b.getAttribute('data-i')];
 openReader({src:(x.src==='r/acotar'?'r/acotar fan post':x.src)+(x.spoiler?' · ⚠ may contain ACOSH spoilers':''),time:x.time,title:x.title,img:x.spoiler?null:x.img,
  desc:x.desc||(x.src==='r/acotar'?'Tap below to read the thread on Reddit.':'Tap below to read the full story.'),link:x.link,btn:x.src==='r/acotar'?'Open on Reddit':'Open full article'});});
