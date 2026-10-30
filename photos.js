// Photos slideshow. Nothing (not even photos.json) loads until the Photos button is tapped.
// Two stacked <img> layers crossfade; only the next photo is preloaded. ES5 for the old car browser.
var PH={list:null,i:-1,cur:0,timer:null,paused:false,open:false,pre:null,busy:false},PH_MS=8000;
function phImgs(){return [$('phA'),$('phB')];}
function phShuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function phSched(){clearTimeout(PH.timer);if(PH.open&&!PH.paused&&PH.list&&PH.list.length>1)PH.timer=setTimeout(phNext,PH_MS);}
function phPreload(n){if(!PH.list||PH.list.length<2)return;PH.pre=new Image();PH.pre.src=PH.list[n%PH.list.length].src;}
function phShow(n){if(!PH.list||!PH.list.length||PH.busy)return;n=n%PH.list.length;PH.busy=true;
 var im=phImgs(),nxt=im[1-PH.cur],old=im[PH.cur];
 nxt.onload=function(){nxt.onload=nxt.onerror=null;nxt.className='on';old.className='';PH.cur=1-PH.cur;PH.i=n;PH.busy=false;
  $('phn').textContent=(n+1)+' / '+PH.list.length;phPreload(n+1);phSched();};
 nxt.onerror=function(){nxt.onload=nxt.onerror=null;PH.busy=false;PH.i=n;phSched();};
 nxt.src=PH.list[n].src;}
function phNext(){phShow(PH.i+1);}
function phPlayIcon(){$('phpp').innerHTML=PH.paused?'<svg class="i" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg>':'<svg class="i" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>';
 $('phpp').setAttribute('aria-label',PH.paused?'Play':'Pause');}
function phOpen(){PH.open=true;$('photos').hidden=false;phPlayIcon();
 if(PH.list){if(PH.i<0)phNext();else phSched();return;}
 $('phmsg').textContent='Loading photos…';
 fetch('photos/photos.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(function(j){
  PH.list=phShuffle((j.photos||[]).slice());$('phmsg').textContent=PH.list.length?'':'No photos yet.';if(PH.open)phNext();})
 .catch(function(e){$('phmsg').textContent='Photos unavailable ('+e.message+')';});}
function phClose(){PH.open=false;clearTimeout(PH.timer);$('photos').hidden=true;}
$('phopen').onclick=phOpen;
$('phx').onclick=function(e){e.stopPropagation();phClose();};
$('phpp').onclick=function(e){e.stopPropagation();PH.paused=!PH.paused;phPlayIcon();if(PH.paused)clearTimeout(PH.timer);else phSched();};
$('phstage').onclick=function(){if(PH.list&&PH.list.length>1){clearTimeout(PH.timer);phNext();}};
document.addEventListener('keydown',function(e){if(PH.open&&(e.key==='Escape'||e.keyCode===27))phClose();});
document.addEventListener('visibilitychange',function(){if(!PH.open)return;if(vis())phSched();else clearTimeout(PH.timer);});
