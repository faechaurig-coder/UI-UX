const REPOS=["Stop-Vicios","TowerNeon","vida-sa","Mark-Luna","voicebox","agenda-por-bloques-selectas","vibuild","proyecto-aurora","spectclar","estudio-videos","Agenda_por_Bloques","Calculadora_Finiquitos_V2","BackPack-Time","UI-UX","Agenda-Clinica","CochesMx","mindgrow","Vr"];
const PUBLIC=new Set(["vida-sa","Mark-Luna","voicebox","Agenda_por_Bloques","Calculadora_Finiquitos_V2","UI-UX","Agenda-Clinica","mindgrow","Vr"]);
const CATEGORY_META={
"01_PERSONAJES_Y_MASCOTAS":["👤","Personajes y mascotas","Niko, Nilo, corredores, avatares y personajes."],
"02_CRIATURAS_Y_ENEMIGOS":["🐾","Criaturas y enemigos","Gatos, criaturas, enemigos y bosses."],
"03_OBJETOS":["🎒","Objetos","Armas, torres, vehículos, mochilas, portales y props."],
"04_ESCENARIOS_Y_MUNDOS":["🌄","Escenarios y mundos","Fondos, arenas, plataformas, ciudades y mundos."],
"05_UI_UX_INTERFACES":["▦","UI/UX e interfaces","Pantallas, menús, HUD, tarjetas y sistemas visuales."],
"06_ICONOS_LOGOS_BRANDING":["✦","Iconos y branding","Logos, isotipos, favicons e iconografía."],
"07_EFECTOS_VISUALES_Y_ANIMACIONES":["✨","Efectos y animaciones","Partículas, glow, transiciones y movimiento."],
"08_AUDIO":["🔊","Audio","Música, efectos, voces y ambientes."],
"09_TIPOGRAFIAS":["Aa","Tipografías","Fuentes y recursos tipográficos."],
"10_MARKETING_Y_STORES":["▣","Marketing y stores","Google Play, banners, feature graphics y promoción."],
"11_ARTE_PROCEDURAL_Y_GENERADORES":["⌘","Arte procedural","Arte y recursos generados o dibujados desde código."],
"12_VR":["🥽","VR","Todos los modelos y recursos de realidad virtual."],
"13_REFERENCIAS_VISUALES":["🖼️","Referencias visuales","Screenshots, capturas, prototipos y referencias."],
"14_RECURSOS_VARIOS":["◇","Otros recursos","Material reutilizable aún no especializado."]
};
const QUICK=[
["01_PERSONAJES_Y_MASCOTAS","Niko","🐨","Niko"],
["02_CRIATURAS_Y_ENEMIGOS","Gatos","🐱","Gatos"],
["03_OBJETOS","Armas","⚔","Armas"],
["03_OBJETOS","Torres","♜","Torres"],
["03_OBJETOS","Vehiculos_y_Movilidad","🚗","Vehículos"],
["05_UI_UX_INTERFACES","General","▦","UI / UX"],
["12_VR","VR","🥽","VR"],
["04_ESCENARIOS_Y_MUNDOS","General","🌄","Escenarios"]
];
let DATA=[],favOnly=false,dupes=new Map();
const $=s=>document.querySelector(s), q=$('#q'),cat=$('#cat'),subcat=$('#subcat'),rp=$('#repo'),reuse=$('#reuse'),sort=$('#sort'),out=$('#results'),stats=$('#stats'),chips=$('#chips'),detail=$('#detail');
Promise.all(REPOS.map(n=>fetch('inventario/'+encodeURIComponent(n)+'.json').then(r=>r.ok?r.json():[]).catch(()=>[]))).then(xs=>{DATA=xs.flat();buildDupes();populate();renderHome();render();});
[q,cat,subcat,rp,reuse,sort].forEach(e=>e.addEventListener('input',render));
cat.addEventListener('change',refreshSubcats);
$('#favOnly').onclick=()=>{favOnly=!favOnly;$('#favOnly').classList.toggle('active',favOnly);showLibrary();render()};
$('#homeBtn').onclick=showHome;$('#libraryBtn').onclick=showLibrary;$('#exploreAll').onclick=()=>{resetFilters();showLibrary();render()};
$('#closeDetail').onclick=()=>detail.close();

function showHome(){$('#homeView').hidden=false;$('#libraryView').hidden=true;$('#homeBtn').classList.add('active');$('#libraryBtn').classList.remove('active')}
function showLibrary(){$('#homeView').hidden=true;$('#libraryView').hidden=false;$('#homeBtn').classList.remove('active');$('#libraryBtn').classList.add('active')}
function resetFilters(){q.value='';cat.value='';subcat.value='';rp.value='';reuse.value='';sort.value='name';favOnly=false;$('#favOnly').classList.remove('active');refreshSubcats()}
function buildDupes(){dupes=new Map();for(const x of DATA){if(!x.sha)continue;const a=dupes.get(x.sha)||[];a.push(x);dupes.set(x.sha,a)}}
function populate(){[...new Set(DATA.map(x=>x.category))].sort().forEach(v=>cat.add(new Option((CATEGORY_META[v]||[])[1]||v,v)));[...new Set(DATA.map(x=>x.repo))].sort().forEach(v=>rp.add(new Option(v,v)));refreshSubcats()}
function refreshSubcats(){const c=cat.value;subcat.innerHTML='<option value="">Todas las subcategorías</option>';[...new Set(DATA.filter(x=>!c||x.category===c).map(x=>x.subcategory))].sort().forEach(v=>subcat.add(new Option(v.replaceAll('_',' '),v)))}
function renderHome(){
 const byCat={};for(const x of DATA)byCat[x.category]=(byCat[x.category]||0)+1;
 $('#overviewText').textContent=DATA.length.toLocaleString('es-MX')+' registros indexados de '+REPOS.length+' repositorios, incluyendo ramas históricas y recursos generados por código.';
 $('#overviewMetrics').innerHTML='<div class="metric"><b>'+DATA.length.toLocaleString('es-MX')+'</b><span>registros</span></div><div class="metric"><b>'+REPOS.length+'</b><span>repositorios</span></div><div class="metric"><b>'+Object.keys(byCat).length+'</b><span>categorías</span></div><div class="metric"><b>'+[...dupes.values()].filter(v=>v.length>1).length+'</b><span>grupos duplicados</span></div>';
 $('#categoryGrid').innerHTML=Object.entries(CATEGORY_META).map(([k,m])=>'<button class="category-card" data-cat="'+k+'"><div><div class="category-icon">'+m[0]+'</div><h3>'+m[1]+'</h3><p>'+m[2]+'</p></div><div class="category-count">'+(byCat[k]||0).toLocaleString('es-MX')+' recursos</div></button>').join('');
 document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>openCategory(b.dataset.cat));
 $('#quickGrid').innerHTML=QUICK.map((v,i)=>'<button class="quick-card" data-quick="'+i+'"><div style="font-size:26px">'+v[2]+'</div><b>'+v[3]+'</b><span>'+countQuick(v[0],v[1]).toLocaleString('es-MX')+' recursos</span></button>').join('');
 document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const v=QUICK[+b.dataset.quick];openQuick(v[0],v[1])});
}
function countQuick(c,s){return DATA.filter(x=>x.category===c&&x.subcategory===s).length}
function openCategory(c){resetFilters();cat.value=c;refreshSubcats();showLibrary();render()}
function openQuick(c,s){resetFilters();cat.value=c;refreshSubcats();subcat.value=s;showLibrary();render()}
function localKey(x){return 'asset:'+[x.repo,x.branch,x.path].join('|')}
function isFav(x){return localStorage.getItem(localKey(x)+':fav')==='1'}
function toggleFav(x){localStorage.setItem(localKey(x)+':fav',isFav(x)?'0':'1');render()}
function status(x){return localStorage.getItem(localKey(x)+':status')||''}
function setStatus(x,v){localStorage.setItem(localKey(x)+':status',v);render()}
function reuseLevel(x){const e=(x.extension||'').toLowerCase(),b=(x.branch||'').toLowerCase(),p=(x.path||'').toLowerCase();const direct=['png','jpg','jpeg','webp','gif','svg','ico','avif','glb','gltf','fbx','obj','wav','mp3','ogg','m4a','ttf','otf','woff','woff2'].includes(e);const canonical=/^(main|master)$/.test(b)||/canonical/.test(b);if(direct&&canonical)return'listo';if(direct)return'adaptar';if(/\.((js|jsx|ts|tsx|kt|css|html|md|json))$/.test(p))return'referencia';return'adaptar'}
function reuseLabel(v){return v==='listo'?'Listo para usar':v==='adaptar'?'Requiere adaptación':'Referencia / código'}
function previewUrl(x){const short=x.repo.split('/')[1];if(!PUBLIC.has(short))return null;const e=(x.extension||'').toLowerCase();if(!['png','jpg','jpeg','webp','gif','svg','avif'].includes(e))return null;return'https://raw.githubusercontent.com/'+x.repo+'/'+encodeURIComponent(x.branch).replace(/%2F/g,'/')+'/'+x.path.split('/').map(encodeURIComponent).join('/')}
function icon(x){const e=(x.extension||'').toLowerCase();if(['glb','gltf','fbx','obj','blend'].includes(e))return'🧊';if(['wav','mp3','ogg','m4a'].includes(e))return'🔊';if(['ttf','otf','woff','woff2'].includes(e))return'Aa';if(['js','jsx','ts','tsx','kt','css','html'].includes(e))return'⌘';if(['png','jpg','jpeg','webp','gif','svg','avif'].includes(e))return'🖼️';return'📦'}
function rowsFiltered(){const s=q.value.trim().toLowerCase(),c=cat.value,sc=subcat.value,r=rp.value,u=reuse.value;let rows=DATA.filter(x=>{const hay=[x.name,x.path,x.repo,x.branch,x.category,x.subcategory,x.extension,status(x)].join(' ').toLowerCase();return(!c||x.category===c)&&(!sc||x.subcategory===sc)&&(!r||x.repo===r)&&(!u||reuseLevel(x)===u)&&(!s||hay.includes(s))&&(!favOnly||isFav(x))});const ord={listo:0,adaptar:1,referencia:2};rows.sort((a,b)=>sort.value==='size'?(b.size||0)-(a.size||0):sort.value==='reuse'?ord[reuseLevel(a)]-ord[reuseLevel(b)]||a.name.localeCompare(b.name):sort.value==='duplicates'?((dupes.get(b.sha)||[]).length)-((dupes.get(a.sha)||[]).length)||a.name.localeCompare(b.name):a.name.localeCompare(b.name));return rows}
function render(){const rows=rowsFiltered(),favs=DATA.filter(isFav).length,dups=[...dupes.values()].filter(v=>v.length>1).length;stats.textContent=rows.length.toLocaleString('es-MX')+' visibles · '+DATA.length.toLocaleString('es-MX')+' indexados';chips.innerHTML='<span class="chip">★ '+favs+' favoritos</span><span class="chip">⧉ '+dups+' grupos duplicados</span><span class="chip">'+REPOS.length+' repositorios</span>';out.innerHTML=rows.slice(0,1800).map((x,i)=>card(x,i)).join('');out.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>toggleFav(rows[+b.dataset.fav]));out.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>showDetail(rows[+b.dataset.detail]));out.querySelectorAll('[data-status]').forEach(s=>s.onchange=()=>setStatus(rows[+s.dataset.status],s.value))}
function card(x,i){const p=previewUrl(x),rl=reuseLevel(x),dc=x.sha?(dupes.get(x.sha)||[]).length:1,st=status(x);return'<article class="card">'+(dc>1?'<span class="badge-count">⧉ '+dc+'</span>':'')+'<div class="preview">'+(p?'<img loading="lazy" src="'+p+'" onerror="this.remove()">':'<span class="file-icon">'+icon(x)+'</span>')+'<span class="preview-label">.'+esc(x.extension||'—')+'</span></div><div class="body"><div class="name">'+esc(x.name)+'</div><div class="tags"><span class="tag">'+esc((CATEGORY_META[x.category]||[])[1]||x.category)+'</span><span class="tag">'+esc(x.subcategory.replaceAll('_',' '))+'</span><span class="tag '+(rl==='listo'?'ready':rl==='adaptar'?'adapt':'ref')+'">'+reuseLabel(rl)+'</span>'+(dc>1?'<span class="tag dup">duplicado exacto</span>':'')+'</div><div class="meta">'+esc(x.repo)+' · '+esc(x.branch)+'</div><div class="origin">'+esc(x.path)+'</div><select data-status="'+i+'" class="mini"><option value="">Sin etiqueta</option><option value="usar" '+(st==='usar'?'selected':'')+'>Usar de nuevo</option><option value="revisar" '+(st==='revisar'?'selected':'')+'>Revisar</option><option value="archivar" '+(st==='archivar'?'selected':'')+'>Archivar</option></select><div class="card-actions"><button class="mini '+(isFav(x)?'starred':'')+'" data-fav="'+i+'">'+(isFav(x)?'★ Guardado':'☆ Favorito')+'</button><button class="mini" data-detail="'+i+'">Ver ficha</button></div></div></article>'}
function showDetail(x){const p=previewUrl(x),rl=reuseLevel(x),same=x.sha?(dupes.get(x.sha)||[]):[];$('#detailBody').innerHTML='<div class="detail-wrap"><div class="detail-grid"><div class="detail-preview">'+(p?'<img src="'+p+'">':'<span class="file-icon">'+icon(x)+'</span>')+'</div><div><h2>'+esc(x.name)+'</h2><div class="tags"><span class="tag">'+esc((CATEGORY_META[x.category]||[])[1]||x.category)+'</span><span class="tag">'+esc(x.subcategory.replaceAll('_',' '))+'</span><span class="tag">'+reuseLabel(rl)+'</span></div><div class="detail-list"><div><b>Proyecto</b>'+esc(x.repo)+'</div><div><b>Rama</b>'+esc(x.branch)+'</div><div><b>Ruta</b>'+esc(x.path)+'</div><div><b>Formato</b>.'+esc(x.extension||'—')+'</div><div><b>Tamaño</b>'+fmt(x.size)+'</div><div><b>SHA</b>'+esc(x.sha||'—')+'</div><div><b>Duplicados</b>'+same.length+'</div><div><b>Etiqueta</b>'+esc(status(x)||'Sin etiqueta')+'</div></div><div class="detail-links"><a target="_blank" href="'+x.url+'">Abrir archivo original en GitHub ↗</a>'+same.slice(0,20).map(v=>'<a target="_blank" href="'+v.url+'">Mismo SHA: '+esc(v.repo)+' · '+esc(v.branch)+' · '+esc(v.path)+'</a>').join('')+'</div></div></div></div>';detail.showModal()}
function fmt(n){if(!n)return'—';if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';return(n/1048576).toFixed(1)+' MB'}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}