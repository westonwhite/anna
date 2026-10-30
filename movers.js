// Stock movers list (Worker /movers: public, cached). Tabs: Gainers / Active / Losers.
var MV=null,mvK='gainers';try{mvK=localStorage.getItem('MV_TAB')||'gainers';}catch(e){}
function mvRender(){[].forEach.call(document.querySelectorAll('#mvtabs button'),function(b){b.className=b.getAttribute('data-k')===mvK?'on':'';});
 var rows=(MV&&MV[mvK])||[],L=$('mvlist');
 if(!rows.length){L.innerHTML='<div class="mvmsg">'+(MV?'No data right now':'Movers unavailable right now')+'</div>';return;}
 L.innerHTML=rows.slice(0,10).map(function(r){var up=r.pc>=0;return '<a class="mvr" target="_blank" rel="noopener" href="https://finance.yahoo.com/quote/'+encodeURIComponent(r.s)+'"><b>'+esc(r.s)+'</b><span class="nm">'+esc(r.n)+'</span><span class="px">'+(r.p>=1000?Math.round(r.p).toLocaleString('en-US'):r.p.toFixed(2))+'</span><span class="pc '+(up?'up':'dn')+'">'+(up?'+':'')+r.pc.toFixed(2)+'%</span></a>';}).join('');}
function movers(){fetch(WORKER+'/movers',{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();})
 .then(function(j){MV=j;$('mvsrc').textContent='Yahoo Finance · '+hm(new Date(j.ts))+(j.stale?' (stale)':'');}).catch(function(){}).then(mvRender);}
$('mvtabs').addEventListener('click',function(e){var b=e.target.closest('button[data-k]');if(!b)return;mvK=b.getAttribute('data-k');try{localStorage.setItem('MV_TAB',mvK);}catch(x){}mvRender();});
