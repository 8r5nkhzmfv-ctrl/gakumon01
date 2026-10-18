
(function(){
var P="gk:";
function lsGet(k){try{return localStorage.getItem(P+k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(P+k,v);return true}catch(e){return false}}
window.GK={get:lsGet,set:lsSet};
// search
var inp=document.getElementById('q'),res=document.getElementById('sres');
if(inp&&window.SEARCH){
 inp.addEventListener('input',function(){
  var q=inp.value.trim().toLowerCase();
  if(!q){res.style.display='none';return}
  var out=[];
  SEARCH.forEach(function(it){
    var s=(it.n+' '+it.t+' '+it.k).toLowerCase();
    if(s.indexOf(q)>=0)out.push(it);
  });
  out=out.slice(0,12);
  res.innerHTML=out.length?out.map(function(it){return '<a href="'+ROOT+it.u+'">'+it.n+'<small>'+it.t+'</small></a>'}).join(''):'<a>該当なし</a>';
  res.style.display='block';
 });
 document.addEventListener('click',function(ev){if(!res.contains(ev.target)&&ev.target!==inp)res.style.display='none'});
}
// per-field progress and notes
var pg=document.getElementById('progress');
if(pg){
 var slug=pg.dataset.slug,key='prog:'+slug,st={};
 try{st=JSON.parse(lsGet(key)||'{}')}catch(e){st={}}
 pg.querySelectorAll('input[type=checkbox]').forEach(function(cb){
  cb.checked=!!st[cb.dataset.k];
  cb.addEventListener('change',function(){st[cb.dataset.k]=cb.checked;lsSet(key,JSON.stringify(st));upd()});
 });
 function upd(){var n=0,t=0;pg.querySelectorAll('input[type=checkbox]').forEach(function(cb){t++;if(cb.checked)n++});var b=pg.querySelector('.bar i');if(b)b.style.width=(100*n/t)+'%'}
 upd();
}
document.querySelectorAll('textarea[data-note]').forEach(function(ta){
 var k='note:'+ta.dataset.note;
 var v=lsGet(k);if(v)ta.value=v;
 ta.addEventListener('input',function(){lsSet(k,ta.value)});
});
// glossary filter
var gf=document.getElementById('gf');
if(gf){
 gf.addEventListener('input',function(){
  var q=gf.value.trim().toLowerCase();
  document.querySelectorAll('[data-g]').forEach(function(r){r.style.display=(!q||r.dataset.g.toLowerCase().indexOf(q)>=0)?'':'none'});
  document.querySelectorAll('section[data-grp]').forEach(function(s){var any=s.querySelector('[data-g]:not([style*="none"])');s.style.display=any?'':'none'});
 });
}
// overall progress (index / projects)
var ov=document.getElementById('overall');
if(ov&&window.SLUGS){
 var done=0,tot=SLUGS.length*4,rows=[];
 SLUGS.forEach(function(s){var st={};try{st=JSON.parse(lsGet('prog:'+s[0])||'{}')}catch(e){}
  var n=['intro','basic','applied','adv'].filter(function(k){return st[k]}).length;done+=n;rows.push([s,n])});
 ov.querySelector('.bar i').style.width=(100*done/tot)+'%';
 var tx=ov.querySelector('.txt');if(tx)tx.textContent='完了 '+done+' / '+tot+' 段階（この端末の記録）';
 var tb=document.getElementById('progtable');
 if(tb){tb.innerHTML=rows.map(function(r){return '<tr><td><a href="'+ROOT+'fields/'+r[0][0]+'.html">'+r[0][1]+'</a></td><td>'+r[1]+' / 4</td></tr>'}).join('')}
}
// materials log
var ml=document.getElementById('matlog');
if(ml){
 var arr=[];try{arr=JSON.parse(lsGet('materials')||'[]')}catch(e){}
 function render(){
  var tb=ml.querySelector('tbody');
  tb.innerHTML=arr.map(function(m,i){return '<tr><td>'+esc(m.t)+'</td><td>'+esc(m.f)+'</td><td>'+esc(m.l)+'</td><td>'+esc(m.y)+'</td><td>'+esc(m.n)+'</td><td><button class="ghost" data-i="'+i+'">削除</button></td></tr>'}).join('');
 }
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 document.getElementById('matadd').addEventListener('click',function(){
  var g=function(i){return document.getElementById(i).value.trim()};
  if(!g('mt'))return;
  arr.push({t:g('mt'),f:g('mf'),l:g('ml'),y:g('my'),n:g('mn')});
  lsSet('materials',JSON.stringify(arr));render();
  ['mt','mf','ml','my','mn'].forEach(function(i){document.getElementById(i).value=''});
 });
 ml.addEventListener('click',function(ev){var b=ev.target.closest('button[data-i]');if(!b)return;arr.splice(+b.dataset.i,1);lsSet('materials',JSON.stringify(arr));render()});
 render();
}
// export / import all
var ex=document.getElementById('exportall');
if(ex){
 ex.addEventListener('click',function(){
  var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k.indexOf(P)===0)o[k]=localStorage.getItem(k)}}catch(e){}
  var b=new Blob([JSON.stringify(o,null,1)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='gakumon-notes.json';a.click();
 });
 document.getElementById('importall').addEventListener('change',function(ev){
  var f=ev.target.files[0];if(!f)return;
  var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);Object.keys(o).forEach(function(k){if(k.indexOf(P)===0)localStorage.setItem(k,o[k])});alert('読み込みました。ページを再読み込みしてください。')}catch(e){alert('読み込めませんでした')}};r.readAsText(f);
 });
}
})();
