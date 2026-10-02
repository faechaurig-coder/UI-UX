const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const scenes = {
  intro: $('#scene-intro'),
  puzzle: $('#scene-puzzle'),
  trust: $('#scene-trust'),
  rescue: $('#scene-rescue'),
  home: $('#scene-home'),
};

let stage = 0;
let objective = { type:'food', target:6, current:0 };
let selected = null;
let board = [];
let moves = 18;
let inputLocked = false;
let trust = 8;
let soundOn = true;

const palette = {
  food:'#C88B5A',
  blanket:'#8BA892',
  drop:'#7D9EAE',
  paw:'#D29E80',
  leaf:'#728D66'
};

const glyphs = {
  food: (c)=>`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 29c0-11 7-19 15-19s15 8 15 19v14c0 8-6 13-15 13s-15-5-15-13V29Z" fill="${c}"/><ellipse cx="32" cy="23" rx="8" ry="5" fill="#F3C895"/><path d="M25 41c4 3 10 3 14 0" fill="none" stroke="#7A4E36" stroke-width="3" stroke-linecap="round"/></svg>`,
  blanket: (c)=>`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="13" width="44" height="39" rx="10" fill="${c}"/><path d="M15 22h34M15 31h34M15 40h34M23 15v35M33 15v35M43 15v35" stroke="#D8E5D9" stroke-width="3" opacity=".72"/></svg>`,
  drop: (c)=>`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 7S16 27 16 39c0 10 7 17 16 17s16-7 16-17C48 27 32 7 32 7Z" fill="${c}"/><path d="M26 43c2 3 6 4 10 2" fill="none" stroke="#D4E8F0" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`,
  paw: (c)=>`<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="40" rx="15" ry="12" fill="${c}"/><ellipse cx="18" cy="25" rx="7" ry="9" fill="${c}"/><ellipse cx="31" cy="20" rx="7" ry="9" fill="${c}"/><ellipse cx="45" cy="25" rx="7" ry="9" fill="${c}"/></svg>`,
  leaf: (c)=>`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M50 13C25 14 13 24 14 42c1 8 8 11 14 8 14-6 20-20 22-37Z" fill="${c}"/><path d="M18 48c7-12 14-19 25-27" fill="none" stroke="#DDEBD8" stroke-width="3" stroke-linecap="round"/></svg>`,
};

const types = Object.keys(glyphs);

function showScene(name){
  Object.values(scenes).forEach(s=>s.classList.remove('scene--active'));
  scenes[name].classList.add('scene--active');
}

function haptic(ms=10){
  if(navigator.vibrate) navigator.vibrate(ms);
}

function toast(msg){
  const t=$('#toast');
  t.textContent=msg;
  t.classList.add('toast--show');
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>t.classList.remove('toast--show'),1700);
}

function startFoodPuzzle(){
  stage=1;
  objective={type:'food',target:6,current:0};
  moves=18;
  configurePuzzle('FIRST HELP','Find something he can eat.','food');
  showScene('puzzle');
  generateBoard();
}

function startShelterPuzzle(){
  stage=2;
  objective={type:'blanket',target:8,current:0};
  moves=16;
  configurePuzzle('SHELTER','Give the box a dry cover.','blanket');
  $('#rescue-peek-copy').textContent='The rain is getting heavier.';
  $('#board-tip').textContent='Blanket pieces will change his shelter.';
  showScene('puzzle');
  generateBoard();
}

function startSafePathPuzzle(){
  stage=3;
  objective={type:'drop',target:10,current:0};
  moves=14;
  configurePuzzle('SAFE PATH','Clear the water from his way.','key');
  $('#rescue-peek-copy').textContent='The water is reaching the box.';
  $('#board-tip').textContent='Clear water pieces so Mochi can reach the carrier.';
  showScene('puzzle');
  generateBoard();
}

function configurePuzzle(kicker,title,type){
  $('#objective-kicker').textContent=kicker;
  $('#objective-title').textContent=title;
  $('#objective-count').textContent=`0 / ${objective.target}`;
  const icon=$('#objective-icon');
  icon.className=`objective-glyph ${type}-glyph`;
  $('#moves-count').textContent=moves;
  $('#level-complete').hidden=true;
}

function generateBoard(){
  const el=$('#board');
  el.innerHTML='';
  board=[];
  selected=null;
  for(let r=0;r<7;r++){
    board[r]=[];
    for(let c=0;c<7;c++){
      let type;
      do {
        type=types[Math.floor(Math.random()*types.length)];
      } while(
        (c>=2 && board[r][c-1]===type && board[r][c-2]===type) ||
        (r>=2 && board[r-1][c]===type && board[r-2][c]===type)
      );
      board[r][c]=type;
    }
  }
  ensureMove();
  renderBoard();
}

function renderBoard(){
  const el=$('#board');
  el.innerHTML='';
  board.forEach((row,r)=>row.forEach((type,c)=>{
    const b=document.createElement('button');
    b.className='tile';
    b.dataset.r=r;
    b.dataset.c=c;
    b.setAttribute('role','gridcell');
    b.setAttribute('aria-label',type);
    b.innerHTML=glyphs[type](palette[type]);
    b.addEventListener('click',()=>onTile(r,c,b));
    el.appendChild(b);
  }));
}

function onTile(r,c,node){
  if(inputLocked) return;
  haptic(6);
  if(!selected){
    selected={r,c};
    node.classList.add('tile--selected');
    return;
  }
  const dr=Math.abs(selected.r-r), dc=Math.abs(selected.c-c);
  if(dr+dc!==1){
    selected={r,c};
    $$('.tile').forEach(x=>x.classList.remove('tile--selected'));
    node.classList.add('tile--selected');
    return;
  }
  const a=selected;
  selected=null;
  swap(a.r,a.c,r,c);
  const matches=findMatches();
  if(!matches.length){
    swap(a.r,a.c,r,c);
    haptic(16);
    renderBoard();
    toast('That one does not connect.');
    return;
  }
  moves--;
  $('#moves-count').textContent=moves;
  resolveMatches(matches);
}

function swap(r1,c1,r2,c2){
  [board[r1][c1],board[r2][c2]]=[board[r2][c2],board[r1][c1]];
}

function findMatches(){
  const set=new Set();
  for(let r=0;r<7;r++){
    let run=1;
    for(let c=1;c<=7;c++){
      if(c<7 && board[r][c] && board[r][c]===board[r][c-1]) run++;
      else{
        if(run>=3) for(let k=0;k<run;k++) set.add(`${r},${c-1-k}`);
        run=1;
      }
    }
  }
  for(let c=0;c<7;c++){
    let run=1;
    for(let r=1;r<=7;r++){
      if(r<7 && board[r][c] && board[r][c]===board[r-1][c]) run++;
      else{
        if(run>=3) for(let k=0;k<run;k++) set.add(`${r-1-k},${c}`);
        run=1;
      }
    }
  }
  return [...set].map(x=>x.split(',').map(Number));
}

async function resolveMatches(matches){
  inputLocked=true;
  const nodes=$$('.tile');
  matches.forEach(([r,c])=>{
    const idx=r*7+c;
    nodes[idx]?.classList.add('tile--matched');
    if(board[r][c]===objective.type) objective.current++;
  });
  $('#objective-count').textContent=`${Math.min(objective.current,objective.target)} / ${objective.target}`;
  haptic(matches.length>=5?22:10);
  await delay(230);

  for(const [r,c] of matches) board[r][c]=null;
  collapse();
  fill();
  renderBoard();
  await delay(150);

  const cascade=findMatches();
  if(cascade.length){
    await resolveMatches(cascade);
    return;
  }

  inputLocked=false;
  if(objective.current>=objective.target){
    completePuzzle();
  }else if(moves<=0){
    moves+=6;
    $('#moves-count').textContent=moves;
    toast('Mochi waits. Take six more moves.');
  }
}

function collapse(){
  for(let c=0;c<7;c++){
    const vals=[];
    for(let r=6;r>=0;r--) if(board[r][c]) vals.push(board[r][c]);
    for(let r=6;r>=0;r--) board[r][c]=vals[6-r]||null;
  }
}

function fill(){
  for(let r=0;r<7;r++) for(let c=0;c<7;c++) if(!board[r][c]){
    board[r][c]=types[Math.floor(Math.random()*types.length)];
  }
}

function hasMove(){
  const dirs=[[0,1],[1,0]];
  for(let r=0;r<7;r++)for(let c=0;c<7;c++)for(const[dR,dC]of dirs){
    const rr=r+dR,cc=c+dC;
    if(rr>=7||cc>=7)continue;
    swap(r,c,rr,cc);
    const good=findMatches().length>0;
    swap(r,c,rr,cc);
    if(good)return true;
  }
  return false;
}
function ensureMove(){ if(!hasMove()) generateBoard(); }

function completePuzzle(){
  const panel=$('#level-complete');
  if(stage===1){
    $('#complete-title').textContent='He stayed.';
    $('#complete-copy').textContent='You set the food down and gave him space.';
    $('#complete-btn').textContent='Keep watching';
  }else if(stage===2){
    $('#complete-title').textContent='Dry enough.';
    $('#complete-copy').textContent='The cover muffles the rain. He looks at you twice.';
    $('#complete-btn').textContent='Make a safe path';
  }else{
    $('#complete-title').textContent='The way is clear.';
    $('#complete-copy').textContent='Mochi can reach the carrier without stepping into the water.';
    $('#complete-btn').textContent='Open the carrier';
  }
  panel.hidden=false;
}

function delay(ms){return new Promise(r=>setTimeout(r,ms));}

function enterTrust(){
  showScene('trust');
  trust=8;
  $('#trust-fill').style.width='8%';
  $('#trust-copy').textContent='Stay close. Let him make the next move.';
}

let holding=false;
function beginHold(){
  if(holding)return;
  holding=true;
  const zone=$('#hand-zone');
  zone.style.transform='scale(.98)';
  const start=performance.now();
  const tick=(now)=>{
    if(!holding)return;
    const elapsed=now-start;
    trust=Math.min(100,8+elapsed/32);
    $('#trust-fill').style.width=`${trust}%`;
    const mochi=$('#mochi-trust');
    if(trust>35) mochi.style.left='39%';
    if(trust>62){
      $('#trust-copy').textContent='He came closer. Then backed away. Then came back.';
      mochi.style.left='45%';
    }
    if(trust>=100){
      holding=false;
      zone.style.transform='';
      haptic(18);
      $('#trust-copy').textContent='He chose the next step.';
      setTimeout(()=>startShelterPuzzle(),1000);
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function endHold(){
  if(trust<100){
    holding=false;
    $('#hand-zone').style.transform='';
    trust=Math.max(8,trust-8);
    $('#trust-fill').style.width=`${trust}%`;
    $('#trust-copy').textContent='Too soon. Try again, slowly.';
  }
}

async function rescueSequence(){
  const carrier=$('.carrier');
  carrier.classList.add('carrier--open');
  $('#open-carrier').disabled=true;
  $('#open-carrier').textContent='Wait…';
  haptic(14);
  await delay(1200);
  $('#mochi-rescue').classList.add('mochi--enter');
  await delay(2500);
  enterHome();
}

async function enterHome(){
  showScene('home');
  await delay(1100);
  const m=$('#mochi-home');
  m.classList.remove('mochi--hidden');
  await delay(900);
  m.classList.add('mochi--home-settled');
  $('#home-box').style.transform='translateX(-50%) translateX(95px) scale(.9)';
  $('#home-box').style.opacity='.72';
  await delay(1100);
  $('#home-message').hidden=false;
  haptic(22);
  await delay(1700);
  $('#home-ui').hidden=false;
}

function openSheet(kind){
  const sheet=$('#sheet');
  const c=$('#sheet-content');
  if(kind==='catbook'){
    c.innerHTML=`
      <p class="eyebrow" style="color:#6F8F78">CATBOOK / 01</p>
      <h2>Mochi</h2>
      <p>Cautious observer. Box enthusiast. Still deciding what “home” means.</p>
      <div class="profile-row">
        <div class="profile-avatar">M</div>
        <div>
          <strong>Discovered trait</strong>
          <p style="margin:4px 0 0">He approaches twice before he trusts once.</p>
        </div>
      </div>`;
  }else{
    c.innerHTML=`
      <p class="eyebrow" style="color:#6F8F78">MEMORY / FIRST NIGHT</p>
      <h2>He came out.</h2>
      <div class="memory-card">
        <strong>The warm corner</strong>
        <p>Mochi left the carrier on his own and chose the box beside the sofa.</p>
      </div>`;
  }
  sheet.hidden=false;
}

$('#look-btn').addEventListener('click',startFoodPuzzle);
$('#box-hotspot').addEventListener('click',()=>{
  $('#intro-hint').textContent='Two green eyes. Very small.';
  $('#look-btn').textContent='Help him';
});
$('#complete-btn').addEventListener('click',()=>{
  $('#level-complete').hidden=true;
  if(stage===1) enterTrust();
  else if(stage===2) startSafePathPuzzle();
  else showScene('rescue');
});
$('#hand-zone').addEventListener('pointerdown',beginHold);
$('#hand-zone').addEventListener('pointerup',endHold);
$('#hand-zone').addEventListener('pointercancel',endHold);
$('#hand-zone').addEventListener('pointerleave',()=>{if(holding) endHold()});
$('#open-carrier').addEventListener('click',rescueSequence);
$('#sound-toggle').addEventListener('click',()=>{
  soundOn=!soundOn;
  $('#sound-toggle span').textContent=soundOn?'♪':'×';
  toast(soundOn?'Sound on':'Sound off');
});
$$('.home-pill').forEach(b=>b.addEventListener('click',()=>openSheet(b.dataset.sheet)));
$('#sheet-close').addEventListener('click',()=>$('#sheet').hidden=true);
$('#blanket-btn').addEventListener('click',()=>{
  $('#blanket').hidden=false;
  $('#blanket-btn').textContent='Blanket placed';
  $('#blanket-btn').disabled=true;
  $('#mochi-home').style.left='24%';
  toast('Mochi noticed immediately.');
  haptic(12);
});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden) holding=false;
});
