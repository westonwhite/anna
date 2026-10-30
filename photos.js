// Photos: a square tile on the main page that crossfades every 9 s, plus the full-screen viewer (tap the tile or the Photos button).
// Light for the car's Atom browser: photos.json loads ~1.5 s after the page, two stacked <img> layers per view crossfade with CSS
// opacity, only the next photo is preloaded, and rotation stops while the page is hidden or the full viewer is open. ES5 only.
var PH={list:null,i:-1,cur:0,timer:null,paused:false,open:false,pre:null,busy:false},PH_MS=8000;
var PT={i:-1,cur:0,timer:null,busy:false},PT_MS=9000,PH_LOAD=null;
function phShuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function phLoad(){if(!PH_LOAD)PH_LOAD=fetch('photos/photos.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
 .then(function(j){PH.list=phShuffle((j.photos||[]).slice());return PH.list;});
 PH_LOAD['catch'](function(){PH_LOAD=null;});return PH_LOAD;}
function phPreload(n){if(!PH.list||PH.list.length<2)return;PH.pre=new Image();PH.pre.src=PH.list[n%PH.list.length].src;}
// Generic crossfade between two <img> layers. st = state object (PH or PT), done(n) after the new photo is visible.
function xfade(st,a,b,n,done){if(!PH.list||!PH.list.length||st.busy)return;n=n%PH.list.length;st.busy=true;
 var im=[a,b],nxt=im[1-st.cur],old=im[st.cur];
 nxt.onload=function(){nxt.onload=nxt.onerror=null;nxt.className='on';old.className='';st.cur=1-st.cur;st.i=n;st.busy=false;done(n);};
 nxt.onerror=function(){nxt.onload=nxt.onerror=null;st.busy=false;st.i=n;done(n);};
 nxt.src=PH.list[n].src;}

// ---- square tile on the main page
function ptSched(){clearTimeout(PT.timer);if(!PH.open&&vis()&&PH.list&&PH.list.length>1)PT.timer=setTimeout(function(){ptShow(PT.i+1);},PT_MS);}
function ptShow(n){xfade(PT,$('ptA'),$('ptB'),n,function(k){$('ptn').textContent=(k+1)+' / '+PH.list.length;phPreload(k+1);ptSched();});}
// Keep the tile square: as big as the column allows while leaving the ACOTAR card room for its countdown + question + a post.
function ptFit(){var c=$('c3'),t=$('phtile'),ac=c&&c.querySelector('.ac');if(!ac)return;
 var w=c.clientWidth,s;
 if(window.innerWidth<=520)s=Math.min(w,360);
 else{var cb=ac.querySelector('.cb'),cs=getComputedStyle(cb),gap=parseFloat(getComputedStyle(c).rowGap||getComputedStyle(c).gap)||6,
  need=ac.querySelector('.ch').offsetHeight+parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+(parseFloat(cs.rowGap||cs.gap)||6)*3+2
   +ac.querySelector('.acnow').offsetHeight+$('acnext').offsetHeight+ac.querySelector('.acq').offsetHeight+64;
  s=Math.min(w,c.clientHeight-gap-need);}
 s=Math.max(110,Math.floor(s));t.style.width=t.style.height=s+'px';}
var PT_RZ=null;window.addEventListener('resize',function(){clearTimeout(PT_RZ);PT_RZ=setTimeout(ptFit,150);});
ptFit();setTimeout(ptFit,1200);setTimeout(ptFit,4000);
setTimeout(function(){phLoad().then(function(l){$('ptmsg').textContent=l.length?'':'No photos yet.';ptShow(0);})
 ['catch'](function(){$('ptmsg').textContent='Photos unavailable';});},1500);
$('phtile').onclick=function(){phOpen(PT.i>=0?PT.i:-1);};

// ---- full-screen viewer
function phSched(){clearTimeout(PH.timer);if(PH.open&&!PH.paused&&PH.list&&PH.list.length>1)PH.timer=setTimeout(phNext,PH_MS);}
function phShow(n){xfade(PH,$('phA'),$('phB'),n,function(k){$('phn').textContent=(k+1)+' / '+PH.list.length;phPreload(k+1);phSched();});}
function phNext(){phShow(PH.i+1);}
function phPlayIcon(){$('phpp').innerHTML=PH.paused?'<svg class="i" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg>':'<svg class="i" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>';
 $('phpp').setAttribute('aria-label',PH.paused?'Play':'Pause');}
// start = index to open on (the photo showing in the tile), or -1 to continue where the viewer left off.
function phOpen(start){PH.open=true;clearTimeout(PT.timer);$('photos').hidden=false;phPlayIcon();
 if(typeof start!=='number')start=-1;
 if(PH.list){if(start>=0&&start!==PH.i)phShow(start);else if(PH.i<0)phNext();else phSched();return;}
 $('phmsg').textContent='Loading photos…';
 phLoad().then(function(l){$('phmsg').textContent=l.length?'':'No photos yet.';if(PH.open)phNext();})
 ['catch'](function(e){$('phmsg').textContent='Photos unavailable ('+e.message+')';});}
function phClose(){PH.open=false;clearTimeout(PH.timer);$('photos').hidden=true;
 if(PH.list&&PH.i>=0&&PH.i!==PT.i)ptShow(PH.i);else ptSched();}
$('phopen').onclick=function(){phOpen(-1);};
$('phx').onclick=function(e){e.stopPropagation();phClose();};
$('phpp').onclick=function(e){e.stopPropagation();PH.paused=!PH.paused;phPlayIcon();if(PH.paused)clearTimeout(PH.timer);else phSched();};
$('phstage').onclick=function(){if(PH.list&&PH.list.length>1){clearTimeout(PH.timer);phNext();}};
document.addEventListener('keydown',function(e){if(PH.open&&(e.key==='Escape'||e.keyCode===27))phClose();});
document.addEventListener('visibilitychange',function(){
 if(!vis()){clearTimeout(PH.timer);clearTimeout(PT.timer);return;}
 if(PH.open)phSched();else ptSched();});
