const REPOS=["Stop-Vicios","TowerNeon","vida-sa","Mark-Luna","voicebox","agenda-por-bloques-selectas","vibuild","proyecto-aurora","spectclar","estudio-videos","Agenda_por_Bloques","Calculadora_Finiquitos_V2","BackPack-Time","UI-UX","Agenda-Clinica","CochesMx","mindgrow","Vr"];
const PUBLIC=new Set(["vida-sa","Mark-Luna","voicebox","Agenda_por_Bloques","Calculadora_Finiquitos_V2","UI-UX","Agenda-Clinica","mindgrow","Vr"]);
let DATA=[],favOnly=false,dupOnly=false,dupes=new Map();
const $=s=>document.querySelector(s), q=$('#q'),cat=$('#cat'),rp=$('#repo'),reuse=$('#reuse'),sort=$('#sort'),out=$('#results'),stats=$('#stats'),chips=$('#chips'),detail=$('#detail');
Promise.all(REPOS.map(n=>fetch('inventario/'+encodeURIComponent(n)+'.json').then(r=>r.ok?r.json():[]).catch(()=>[]))).then(xs=>{
 DATA=xs.flat(); buildDupes(); populate(); render();
});
[q,cat,rp,reuse,sort].forEach(e=>e.addEventListener('input',render));
$('#favOnly').onclick=()=>{favOnly=!favOnly;$('#favOnly').classList.toggle('active',favOnly);render()};
$('#dupOnly').onclick=()=>{dupOnly=!dupOnly;$('#dupOnly').classList.toggle('active',dupOnly);render()};
$('#closeDetail').onclick=()=>detail.close();

function buildDupes(){dupes=new Map();for(const x of DATA){if(!x.sha)continue;const a=dupes.get(x.sha)||[];a.push(x);dupes.set(x.sha,a)}}
function populate(){[...new Set(DATA.map(x=>x.category))].sort().forEach(v=>cat.add(new Option(v,v)));[...new Set(DATA.map(x=>x.repo))].sort().forEach(v=>rp.add(new Option(v,v)))}
function localKey(x){return 'asset:'+[x.repo,x.branch,x.path].join('|')}
function isFav(x){return localStorage.getItem(localKey(x)+':fav')==='1'}
function toggleFav(x){const k=localKey(x)+':fav';localStorage.setItem(k,isFav(x)?'0':'1');render()}
function status(x){return localStorage.getItem(localKey(x)+':status')||''}
function setStatus(x,v){localStorage.setItem(localKey(x)+':status',v);render()}
function reuseLevel(x){
 const e=(x.extension||'').toLowerCase(), b=(x.branch||'').toLowerCase(), p=(x.path||'').toLowerCase();
 const direct=['png','jpg','jpeg','webp','gif','svg','ico','avif','glb','gltf','fbx','obj','wav','mp3','ogg','m4a','ttf','otf','woff','woff2'].includes(e);
 const canonical=/^(main|master)$/.test(b)||/canonical/.test(b);
 if(direct&&canonical)return 'listo';
 if(direct)return 'adaptar';
 if(/\.((js|jsx|ts|tsx|kt|css|html|md|json))$/.test(p))return 'referencia';
 return 'adaptar';
}
function reuseLabel(v){return v==='listo'?'Listo para usar':v==='adaptar'?'Requiere adaptación':'Referencia / código'}
function previewUrl(x){
 const short=x.repo.split('/')[1];
 if(!PUBLIC.has(short))return null;
 const e=(x.extension||'').toLowerCase();
 if(!['png','jpg','jpeg','webp','gif','svg','avif'].includes(e))return null;
 return 'https://raw.githubusercontent.com/'+x.repo+'/'+encodeURIComponent(x.branch).replace(/%2F/g,'/')+'/'+x.path.split('/').map(encodeURIComponent).join('/');
}
function icon(x){const e=(x.extension||'').toLowerCase();if(['glb','gltf','fbx','obj','blend'].includes(e))return '🧊';if(['wav','mp3','ogg','m4a'].includes(e))return '🔊';if(['ttf','otf','woff','woff2'].includes(e))return 'Aa';if(['js','jsx','ts','tsx','kt','css','html'].includes(e))return '⌘';if(['png','jpg','jpeg','webp','gif','svg','avif'].includes(e))return '🖼️';return '📦'}
function rowsFiltered(){const s=q.value.trim().toLowerCase(),c=cat.value,r=rp.value,u=reuse.value;
 let rows=DATA.filter(x=>{
   const hay=[x.name,x.path,x.repo,x.branch,x.category,x.subcategory,x.extension,status(x)].join(' ').toLowerCase();
   return(!c||x.category===c)&&(!r||x.repo===r)&&(!u||reuseLevel(x)===u)&&(!s||hay.includes(s))&&(!favOnly||isFav(x))&&(!dupOnly||(x.sha&&(dupes.get(x.sha)||[]).length>1));
 });
 const ord={listo:0,adaptar:1,referencia:2};
 rows.sort((a,b)=>{
   if(sort.value==='size')return (b.size||0)-(a.size||0);
   if(sort.value==='reuse')return ord[reuseLevel(a)]-ord[reuseLevel(b)]||a.name.localeCompare(b.name);
   if(sort.value==='duplicates')return ((dupes.get(b.sha)||[]).length)-((dupes.get(a.sha)||[]).length)||a.name.localeCompare(b.name);
   return a.name.localeCompare(b.name);
 });
 return rows;
}
function render(){const rows=rowsFiltered();const favs=DATA.filter(isFav).length, dups=[...dupes.values()].filter(v=>v.length>1).length;
 stats.textContent=rows.length+' visibles · '+DATA.length+' registros indexados';
 chips.innerHTML='<span class="chip">★ '+favs+' favoritos</span><span class="chip">⧉ '+dups+' grupos duplicados</span><span class="chip">'+REPOS.length+' repositorios</span>';
 out.innerHTML=rows.slice(0,1800).map((x,i)=>card(x,i)).join('');
 out.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>toggleFav(rows[+b.dataset.fav]));
 out.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>showDetail(rows[+b.dataset.detail]));
 out.querySelectorAll('[data-status]').forEach(s=>s.onchange=()=>setStatus(rows[+s.dataset.status],s.value));
}
function card(x,i){const p=previewUrl(x),rl=reuseLevel(x),dc=x.sha?(dupes.get(x.sha)||[]).length:1,st=status(x);
 return '<article class="card">'+(dc>1?'<span class="badge-count">⧉ '+dc+'</span>':'')+
 '<div class="preview">'+(p?'<img loading="lazy" src="'+p+'" onerror="this.remove()">':'<span class="file-icon">'+icon(x)+'</span>')+'<span class="preview-label">.'+esc(x.extension||'—')+'</span></div>'+
 '<div class="body"><div class="name">'+esc(x.name)+'</div><div class="tags"><span class="tag">'+esc(x.category)+'</span><span class="tag">'+esc(x.subcategory)+'</span><span class="tag '+(rl==='listo'?'ready':rl==='adaptar'?'adapt':'ref')+'">'+reuseLabel(rl)+'</span>'+(dc>1?'<span class="tag dup">duplicado exacto</span>':'')+'</div>'+
 '<div class="meta">'+esc(x.repo)+' · '+esc(x.branch)+'</div><div class="origin">'+esc(x.path)+'</div>'+
 '<select data-status="'+i+'" class="mini"><option value="">Sin etiqueta</option><option value="usar" '+(st==='usar'?'selected':'')+'>Usar de nuevo</option><option value="revisar" '+(st==='revisar'?'selected':'')+'>Revisar</option><option value="archivar" '+(st==='archivar'?'selected':'')+'>Archivar</option></select>'+
 '<div class="card-actions"><button class="mini '+(isFav(x)?'starred':'')+'" data-fav="'+i+'">'+(isFav(x)?'★ Guardado':'☆ Favorito')+'</button><button class="mini" data-detail="'+i+'">Ver ficha</button></div></div></article>';
}
function showDetail(x){const p=previewUrl(x),rl=reuseLevel(x),same=x.sha?(dupes.get(x.sha)||[]):[];
 $('#detailBody').innerHTML='<div class="detail-wrap"><div class="detail-grid"><div class="detail-preview">'+(p?'<img src="'+p+'">':'<span class="file-icon">'+icon(x)+'</span>')+'</div><div><h2>'+esc(x.name)+'</h2><div class="tags"><span class="tag">'+esc(x.category)+'</span><span class="tag">'+esc(x.subcategory)+'</span><span class="tag">'+reuseLabel(rl)+'</span></div><div class="detail-list"><div><b>Proyecto</b>'+esc(x.repo)+'</div><div><b>Rama</b>'+esc(x.branch)+'</div><div><b>Ruta</b>'+esc(x.path)+'</div><div><b>Formato</b>.'+esc(x.extension||'—')+'</div><div><b>Tamaño</b>'+fmt(x.size)+'</div><div><b>SHA</b>'+esc(x.sha||'—')+'</div><div><b>Duplicados</b>'+same.length+'</div><div><b>Etiqueta</b>'+esc(status(x)||'Sin etiqueta')+'</div></div><div class="detail-links"><a target="_blank" href="'+x.url+'">Abrir archivo original en GitHub ↗</a>'+same.slice(0,20).map(v=>'<a target="_blank" href="'+v.url+'">Mismo SHA: '+esc(v.repo)+' · '+esc(v.branch)+' · '+esc(v.path)+'</a>').join('')+'</div></div></div></div>';
 detail.showModal();
}
function fmt(n){if(!n)return'—';if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';return(n/1048576).toFixed(1)+' MB'}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}