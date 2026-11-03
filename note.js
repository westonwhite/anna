(function(){
  var KEY='anna-note-sorry-20261103';
  try{ if(localStorage.getItem(KEY)) return; }catch(e){}
  function show(){
    var o=document.createElement('div');
    o.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55)';
    o.innerHTML='<div style="background:#d01c2a;color:#fff;border-radius:22px;padding:34px 40px;max-width:80vw;text-align:center;box-shadow:0 10px 50px rgba(0,0,0,.6);font-family:inherit">'+
      '<div style="font-size:clamp(22px,4vw,40px);font-weight:800;line-height:1.25">Your husband is sorry.<br>He would never insult a healthcare professional. \u2764\uFE0F</div>'+
      '<button style="margin-top:26px;font-size:24px;font-weight:700;padding:14px 46px;border:0;border-radius:14px;background:#fff;color:#d01c2a">OK</button></div>';
    function close(){ try{localStorage.setItem(KEY,'1');}catch(e){} o.remove(); }
    o.addEventListener('click',close);
    document.body.appendChild(o);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',show); else show();
})();
