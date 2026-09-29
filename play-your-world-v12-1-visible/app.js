(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const screens = ['homeScreen', 'exploreScreen', 'shopScreen', 'captureScreen', 'editorScreen', 'gameScreen', 'resultScreen'];

  const state = {
    stream: null,
    recorder: null,
    chunks: [],
    recordingStartedAt: 0,
    recordingTimer: null,
    videoBlob: null,
    videoUrl: null,
    levelId: null,
    levelName: null,
    surfaces: [],
    hazards: [],
    start: null,
    finish: null,
    portalIn: null,
    portalOut: null,
    springs: [],
    boosts: [],
    videoFx: { zoom:1, panX:0, panY:0, brightness:100, contrast:100, saturation:100 },
    history: [],
    tool: 'surface',
    drawing: false,
    currentPath: [],
    speed: 1,
    attempts: 0,
    game: null,
    gameFrame: null,
    result: null,
    demoMode: false,
    coins: Number(localStorage.getItem('pyw.coins') || 650),
    owned: JSON.parse(localStorage.getItem('pyw.owned') || '["classic"]'),
    equipped: localStorage.getItem('pyw.equipped') || 'classic',
    previewFrame: null,
    xp: Number(localStorage.getItem('pyw.xp') || 0),
    missionDate: localStorage.getItem('pyw.missionDate') || '',
    missionRuns: Number(localStorage.getItem('pyw.missionRuns') || 0),
    audioCtx: null,
    replayCanvas: null,
    replayRecorder: null,
    replayChunks: [],
    replayBlob: null,
    replayMime: '',
    replayActive: false,
    faceImageSrc: localStorage.getItem('pyw.face') || '',
    faceImage: null,
    selectedCharacter: localStorage.getItem('pyw.character') || 'runner',
    characterSprite: null,
    characterSpriteUrl: '',
    publicLevelId: null,
    selectedPublicLevelId: null,
    syntheticEditorMode: false,
    remixSource: null,
    returnAfterGame: 'homeScreen',
  };

  const els = {
    rotateHint: $('rotateHint'),
    cameraPreview: $('cameraPreview'),
    cameraFallback: $('cameraFallback'),
    cameraFallbackReason: $('cameraFallbackReason'),
    nativeCaptureInput: $('nativeCaptureInput'),
    captureTimer: $('captureTimer'),
    recordBtn: $('recordBtn'),
    useRecordingBtn: $('useRecordingBtn'),
    videoFileInput: $('videoFileInput'),
    editorVideo: $('editorVideo'),
    editorCanvas: $('editorCanvas'),
    editorStage: $('editorStage'),
    editorInstruction: $('editorInstruction'),
    editorVideoToggle: $('editorVideoToggle'),
    speedSelect: $('speedSelect'),
    editorToast: $('editorToast'),
    gameVideo: $('gameVideo'),
    gameCanvas: $('gameCanvas'),
    gameStage: $('gameStage'),
    tapHint: $('tapHint'),
    attemptLabel: $('attemptLabel'),
    gameTimeLabel: $('gameTimeLabel'),
    savedLevelsPanel: $('savedLevelsPanel'),
    savedLevelsList: $('savedLevelsList'),
    coinLabel: $('coinLabel'),
    shopCoinLabel: $('shopCoinLabel'),
    captureGuide: $('captureGuide'),
    captureStatus: $('captureStatus'),
    previewBadge: $('previewBadge'),
    retakeBtn: $('retakeBtn'),
    videoScrubber: $('videoScrubber'),
    timelineCurrent: $('timelineCurrent'),
    timelineDuration: $('timelineDuration'),
    shopRunnerCanvas: $('shopRunnerCanvas'),
    equippedLabel: $('equippedLabel'),
    runCoins: $('runCoins'),
    comboLabel: $('comboLabel'),
    playerLevel: $('playerLevel'),
    xpLabel: $('xpLabel'),
    xpBar: $('xpBar'),
    missionProgress: $('missionProgress'),
    heart1: $('heart1'),
    heart2: $('heart2'),
    heart3: $('heart3'),
    damageStatus: $('damageStatus'),
    shareRunBtn: $('shareRunBtn'),
    videoReadyNote: $('videoReadyNote'),
    editorRail: $('editorRail'),
    frameLayerBadge: $('frameLayerBadge'),
    advancedPanel: $('advancedPanel'),
    advancedBtn: $('advancedBtn'),
    advancedCloseBtn: $('advancedCloseBtn'),
    videoZoom: $('videoZoom'),
    videoPanX: $('videoPanX'),
    videoPanY: $('videoPanY'),
    videoBrightness: $('videoBrightness'),
    videoContrast: $('videoContrast'),
    videoSaturation: $('videoSaturation'),
    zoomValue: $('zoomValue'),
    facePhotoInput: $('facePhotoInput'),
    bigHeadBtn: $('bigHeadBtn'),
    bigHeadThumb: $('bigHeadThumb'),
    characterPanel: $('characterPanel'),
    characterName: $('characterName'),
    homeCharacterPreview: $('homeCharacterPreview'),
    publicLevelsGrid: $('publicLevelsGrid'),
    levelDetailPanel: $('levelDetailPanel'),
    levelCodeInput: $('levelCodeInput'),
  };

  const COLORS = {
    surface: '#5ee7ff',
    hazard: '#ff667a',
    start: '#77f2a1',
    finish: '#ffd166',
  };

  const SHOP = {
    classic: { name: 'Runner clásico', price: 0 },
    cap: { name: 'Gorra roja', price: 120 },
    shades: { name: 'Lentes', price: 180 },
    neon: { name: 'Trail neón', price: 250 },
    helmet: { name: 'Casco stunt', price: 300 },
    bighead: { name: 'Cabezón', price: 600 },
  };

  const PUBLIC_LEVELS = [
    {
      id:'office', code:'PYW-A7K92', title:'La oficina imposible', creator:'@franklab', plays:18421, completion:14, record:6.82, scene:'office',
      leaderboard:[['Nico',6.82],['Lau',6.91],['Mau',7.03]],
      config:{
        surfaces:[
          [{x:.055,y:.76},{x:.14,y:.75},{x:.23,y:.73},{x:.33,y:.70}],
          [{x:.42,y:.67},{x:.49,y:.64},{x:.57,y:.63},{x:.64,y:.64}],
          [{x:.72,y:.59},{x:.78,y:.56},{x:.84,y:.54},{x:.92,y:.53}]
        ],
        hazards:[
          [{x:.255,y:.655},{x:.255,y:.72}],
          [{x:.555,y:.57},{x:.575,y:.63}]
        ],
        start:{x:.07,y:.755}, finish:{x:.89,y:.53},
        portalIn:{x:.61,y:.64}, portalOut:{x:.75,y:.56},
        springs:[{x:.305,y:.705}], boosts:[{x:.47,y:.65}], speed:1
      }
    },
    {
      id:'portal', code:'PYW-P0RT4', title:'Portal de cocina', creator:'@mariaplay', plays:9642, completion:31, record:5.44, scene:'portal',
      leaderboard:[['Sara',5.44],['Xavi',5.63],['Dani',5.81]],
      config:{
        surfaces:[
          [{x:.05,y:.77},{x:.21,y:.76},{x:.35,y:.72}],
          [{x:.46,y:.68},{x:.59,y:.66}],
          [{x:.72,y:.57},{x:.91,y:.55}]
        ],
        hazards:[[{x:.32,y:.66},{x:.32,y:.73}],[{x:.58,y:.59},{x:.59,y:.66}]],
        start:{x:.06,y:.765}, finish:{x:.90,y:.55},
        portalIn:{x:.37,y:.71}, portalOut:{x:.73,y:.57},
        springs:[], boosts:[{x:.51,y:.66}], speed:1.1
      }
    },
    {
      id:'sofa', code:'PYW-TURB0', title:'Sofá Turbo', creator:'@tinyworld', plays:5210, completion:62, record:4.91, scene:'sofa',
      leaderboard:[['Iker',4.91],['Mia',5.07],['Leo',5.12]],
      config:{
        surfaces:[
          [{x:.04,y:.76},{x:.19,y:.74},{x:.34,y:.71}],
          [{x:.39,y:.69},{x:.56,y:.64},{x:.68,y:.62}],
          [{x:.75,y:.58},{x:.94,y:.55}]
        ],
        hazards:[[{x:.69,y:.55},{x:.70,y:.62}]],
        start:{x:.055,y:.755}, finish:{x:.92,y:.55},
        portalIn:null, portalOut:null,
        springs:[{x:.35,y:.705},{x:.70,y:.61}], boosts:[{x:.14,y:.75},{x:.48,y:.66}], speed:1.2
      }
    }
  ];

  function difficultyFor(completion) {
    if (completion < 5) return 'IMPOSIBLE';
    if (completion < 30) return 'EXTREMO';
    if (completion < 70) return 'DIFÍCIL';
    return 'CASUAL';
  }

  function getPublicLevel(idOrCode) {
    const raw = String(idOrCode || '').trim();
    const q = raw.toUpperCase();
    return PUBLIC_LEVELS.find(function(l){ return l.id === raw || l.code.toUpperCase() === q; }) || null;
  }

  function personalBestKey(id) { return 'pyw.best.' + id; }

  function getPersonalBest(id) {
    const v = Number(localStorage.getItem(personalBestKey(id)));
    return Number.isFinite(v) && v > 0 ? v : null;
  }

  function renderPublicFeed(feed) {
    if (!els.publicLevelsGrid) return;
    feed = feed || 'foryou';
    let levels = PUBLIC_LEVELS.slice();
    if (feed === 'trending') levels.sort(function(a,b){ return b.plays-a.plays; });
    if (feed === 'new') levels.reverse();
    els.publicLevelsGrid.innerHTML = '';
    levels.forEach(function(level){
      const best = getPersonalBest(level.id);
      const bestBadge = best ? '<span class="level-badge">Tú ' + best.toFixed(2) + 's</span>' : '';
      const card = document.createElement('button');
      card.className = 'public-level-card';
      card.dataset.levelId = level.id;
      card.innerHTML =
        '<span class="difficulty">' + difficultyFor(level.completion) + '</span>' +
        '<div class="level-thumb ' + level.scene + '"></div>' +
        '<div class="level-card-body">' +
          '<div class="level-card-row"><div><h3>' + level.title + '</h3><p>' + level.creator + ' · ' + level.code + '</p></div><strong>▶</strong></div>' +
          '<div class="level-badges">' +
            '<span class="level-badge">' + level.plays.toLocaleString('es-MX') + ' jugadas</span>' +
            '<span class="level-badge hot">' + level.completion + '% completa</span>' +
            '<span class="level-badge">WR ' + level.record.toFixed(2) + 's</span>' +
            bestBadge +
          '</div>' +
        '</div>';
      card.addEventListener('click', function(){ openLevelDetail(level.id); });
      els.publicLevelsGrid.appendChild(card);
    });
  }

  function openLevelDetail(id) {
    const level = getPublicLevel(id);
    if (!level) return;
    state.selectedPublicLevelId = level.id;
    $('detailDifficulty').textContent = difficultyFor(level.completion);
    $('detailTitle').textContent = level.title;
    $('detailCreator').textContent = level.creator;
    $('detailCode').textContent = level.code;
    $('detailPlays').textContent = level.plays.toLocaleString('es-MX');
    $('detailCompletion').textContent = level.completion + '%';
    $('detailWorldRecord').textContent = level.record.toFixed(2) + 's';
    const best = getPersonalBest(level.id);
    $('detailPersonalRecord').textContent = best ? best.toFixed(2) + 's' : '—';
    $('detailLeaderboard').innerHTML = level.leaderboard.map(function(row){
      return '<li><b>' + row[0] + '</b> · ' + row[1].toFixed(2) + 's</li>';
    }).join('');
    els.levelDetailPanel.hidden = false;
  }

  function applyPublicConfig(level, remix) {
    const cfg = JSON.parse(JSON.stringify(level.config));
    state.demoMode = true;
    state.syntheticEditorMode = !!remix;
    state.publicLevelId = remix ? null : level.id;
    state.remixSource = remix ? level.id : null;
    state.levelId = remix ? ('remix-' + level.id + '-' + Date.now()) : ('public-' + level.id);
    state.levelName = remix ? ('Remix de ' + level.title) : level.title;
    state.videoBlob = null;
    state.videoUrl = null;
    state.surfaces = cfg.surfaces || [];
    state.hazards = cfg.hazards || [];
    state.start = cfg.start;
    state.finish = cfg.finish;
    state.portalIn = cfg.portalIn || null;
    state.portalOut = cfg.portalOut || null;
    state.springs = cfg.springs || [];
    state.boosts = cfg.boosts || [];
    state.videoFx = defaultVideoFx();
    state.speed = cfg.speed || 1;
    state.attempts = 0;
    state.history = [];
    state.returnAfterGame = remix ? 'editorScreen' : 'exploreScreen';
    els.speedSelect.value = String(state.speed);
  }

  function playPublicLevel(id) {
    const level = getPublicLevel(id);
    if (!level) return;
    applyPublicConfig(level, false);
    els.levelDetailPanel.hidden = true;
    playDemo();
  }

  function openSyntheticEditor(level) {
    applyPublicConfig(level, true);
    showScreen('editorScreen');
    els.editorVideo.pause();
    els.editorVideo.removeAttribute('src');
    els.editorVideo.load();
    els.editorVideo.style.display = 'none';
    els.editorVideoToggle.style.display = 'none';
    const timeline = document.querySelector('.timeline');
    if (timeline) timeline.style.display = 'none';
    fitCanvas(els.editorCanvas, els.editorStage);
    setTool('surface');
    drawEditor();
    toast('Remix de ' + level.title + ': cambia obstáculos, portales, resortes o boost.', 2400);
  }

  function recordPublicResult(success, elapsed) {
    if (!success || !state.publicLevelId) return false;
    const key = personalBestKey(state.publicLevelId);
    const old = getPersonalBest(state.publicLevelId);
    if (!old || elapsed < old) {
      localStorage.setItem(key, String(elapsed));
      return true;
    }
    return false;
  }

  async function sharePublicLevel(id) {
    const level = getPublicLevel(id);
    if (!level) return;
    const url = new URL(location.href);
    url.searchParams.set('level', level.code);
    url.searchParams.set('v', '8');
    const shareText = 'Hice el nivel “' + level.title + '” en Play Your World. Sólo ' + level.completion + '% lo completa 💀 Código: ' + level.code;
    try {
      if (navigator.share) await navigator.share({ title:level.title, text:shareText, url:url.toString() });
      else await navigator.clipboard?.writeText(shareText + ' ' + url.toString());
      awardCoins(10, 'Reto compartido');
    } catch (_) {}
  }


  const CHARACTER_ATLAS_DATA = "data:image/webp;base64,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";
  const CHARACTER_CONFIG = {
    runner: { name:'Runner', row:0, runFps:8.4, size:1.82, bob:.036, tilt:.026, stretch:.055, landSquash:.17 },
    cat:    { name:'Gatito', row:1, runFps:10.2, size:1.74, bob:.048, tilt:.034, stretch:.075, landSquash:.21 },
    skate:  { name:'Skater', row:2, runFps:6.6, size:1.90, bob:.018, tilt:.045, stretch:.028, landSquash:.13 },
  };

  async function initCharacterSprite() {
    try {
      const img=new Image();
      img.decoding='async';
      await new Promise((resolve,reject)=>{
        img.onload=resolve;
        img.onerror=reject;
        img.src=CHARACTER_ATLAS_DATA;
      });
      if(!img.naturalWidth || !img.naturalHeight) throw new Error('Atlas loaded without dimensions');
      state.characterSprite=img;
      state.characterSpriteUrl=CHARACTER_ATLAS_DATA;
      state.characterSpriteReady=true;
      updateCharacterUI();
    } catch(err) {
      console.warn('Character atlas failed; procedural fallback enabled',err);
      state.characterSprite=null;
      state.characterSpriteReady=false;
      updateCharacterUI();
    }
  }

  function selectCharacter(id) {
    if(!CHARACTER_CONFIG[id]) return;
    state.selectedCharacter=id;
    localStorage.setItem('pyw.character',id);
    updateCharacterUI();
    if(state.previewFrame) cancelAnimationFrame(state.previewFrame);
    if($('shopScreen').classList.contains('active')) requestAnimationFrame(drawShopPreview);
  }

  function updateCharacterUI() {
    const cfg=CHARACTER_CONFIG[state.selectedCharacter] || CHARACTER_CONFIG.runner;
    if(els.characterName) els.characterName.textContent=cfg.name;
    if(els.homeCharacterPreview) {
      els.homeCharacterPreview.className='home-character-preview '+state.selectedCharacter;
    }
    document.querySelectorAll('.character-card[data-character]').forEach(card=>{
      card.classList.toggle('selected',card.dataset.character===state.selectedCharacter);
    });
    if(state.characterSpriteUrl){
      document.querySelectorAll('.character-thumb, .home-character-preview').forEach(el=>{
        el.style.backgroundImage='url("'+state.characterSpriteUrl+'")';
      });
    }
  }

  function drawSpriteCharacter(ctx,p,t,crashed) {
    const img=state.characterSprite;
    if(!img || !img.complete || !img.naturalWidth) return false;

    const game=state.game;
    const cfg=CHARACTER_CONFIG[state.selectedCharacter] || CHARACTER_CONFIG.runner;
    const H=p.height;
    const now=performance.now();
    const airborne=!p.grounded && !crashed;
    const hitActive=!!game && now < game.hitReactionUntil;
    const damage=game?.damage || 0;
    const boosted=!!game && now < game.boostUntil;

    // Animation speed follows actual game speed: boost visibly increases cadence.
    const speedRatio=Math.max(.65,Math.min(1.75,(game?.speed || 1)/(els.gameCanvas.clientWidth*.145 || 1)));
    const cadence=cfg.runFps * speedRatio * (boosted?1.23:1) * (damage>=2?.70:1);
    const cycle=t*cadence;
    const gait=Math.sin(cycle*Math.PI);
    const footPhase=Math.floor(cycle)%2;

    // State machine: KO > hit > airborne > runA/runB.
    let frame=footPhase;                 // 0/1 actual changing leg poses
    if(airborne) frame=2;                // jump pose
    if(hitActive && !crashed) frame=3;   // hit pose
    if(crashed) frame=4;                 // KO pose
    if(damage>=2 && !airborne && !hitActive && !crashed) {
      // Last-heart limp: irregularly falls back into hurt pose.
      frame=(Math.floor(cycle*0.72)%3===1)?3:footPhase;
    }

    const cellW=img.naturalWidth/5;
    const cellH=img.naturalHeight/3;
    const sxSrc=frame*cellW;
    const sySrc=cfg.row*cellH;

    let visual=H*cfg.size;
    let bob=p.grounded&&!crashed ? Math.abs(gait)*H*cfg.bob : 0;
    let rot=p.grounded&&!crashed ? gait*cfg.tilt : 0;
    let scaleX=1, scaleY=1;

    // Foot-contact squash / mid-stride stretch.
    if(p.grounded&&!crashed){
      const contact=Math.abs(Math.cos(cycle*Math.PI));
      scaleX*=1+contact*cfg.stretch*.34;
      scaleY*=1-contact*cfg.stretch*.26;
    }

    // Landing anticipation/compression.
    if(game?.landFxUntil && now<game.landFxUntil && !crashed){
      const k=Math.max(0,Math.min(1,(game.landFxUntil-now)/180));
      scaleX*=1+cfg.landSquash*k;
      scaleY*=1-cfg.landSquash*.72*k;
      bob-=H*.025*k;
    }

    if(airborne){
      const vyNorm=Math.max(-1,Math.min(1,p.vy/Math.max(1,Math.abs(game?.jumpVelocity||1))));
      scaleX*=.95-Math.min(0,vyNorm)*.03;
      scaleY*=1.08+Math.abs(vyNorm)*.07;
      rot+=(state.selectedCharacter==='cat' ? (p.vy<0?-.18:.15) : state.selectedCharacter==='skate' ? -.13 : -.09);
    }

    // Personality per character.
    if(state.selectedCharacter==='runner'){
      rot+=damage>=2&&!crashed ? .10+Math.sin(t*7)*.025 : 0;
      if(boosted&&!airborne) scaleX*=1.06;
      ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle='#5ee7ff';ctx.lineWidth=2.2;
      ctx.beginPath();ctx.moveTo(p.x-H*.55,p.y+H*.18);ctx.lineTo(p.x-H*.15,p.y+H*.10);ctx.stroke();ctx.restore();
    }else if(state.selectedCharacter==='cat'){
      rot+=damage>=2&&!crashed ? .085 : 0;
      if(!airborne && Math.floor(cycle)%6===5){scaleX*=1.08;scaleY*=.94;}
      ctx.save();ctx.globalAlpha=.34;ctx.fillStyle='#f2d1ae';
      for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(p.x-H*(.27+i*.12),p.y+H*.26,2.1,0,Math.PI*2);ctx.fill();}ctx.restore();
    }else{
      rot+=damage>=2&&!crashed ? .11 : 0;
      if(!airborne && Math.floor(cycle)%8===7) rot-=.10; // small wheelie beat
      ctx.save();ctx.globalAlpha=.45;ctx.strokeStyle='#ffd166';ctx.lineWidth=2;
      for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(p.x-H*(.35+i*.12),p.y+H*.27);ctx.lineTo(p.x-H*(.23+i*.12),p.y+H*.24);ctx.stroke();}ctx.restore();
    }

    if(hitActive&&!crashed){
      rot+=Math.sin(t*30)*.13;
      scaleX*=1.08; scaleY*=.86;
      bob+=H*.045;
    }
    if(crashed){
      rot+=p.rotation;
      scaleX*=p.impactScaleX||1;
      scaleY*=p.impactScaleY||1;
    }

    ctx.save();
    ctx.translate(p.x,p.y-bob);
    ctx.rotate(rot);
    ctx.scale(scaleX,scaleY);
    ctx.globalAlpha=(game && now<game.invulnerableUntil && !crashed && Math.floor(t*14)%2===0)?0.46:1;

    // Character is deliberately ~1/3 smaller than V10.
    const yOffset=state.selectedCharacter==='cat' ? -.48 : state.selectedCharacter==='skate' ? -.53 : -.55;
    try {
      ctx.drawImage(img,sxSrc,sySrc,cellW,cellH,-visual*.50,visual*yOffset,visual,visual);
      ctx.restore();
      return true;
    } catch (err) {
      ctx.restore();
      console.warn('Sprite draw failed; using procedural fallback', err);
      return false;
    }
  }


  function saveEconomy() {
    localStorage.setItem('pyw.coins', String(state.coins));
    localStorage.setItem('pyw.owned', JSON.stringify(state.owned));
    localStorage.setItem('pyw.equipped', state.equipped);
    refreshEconomyUI();
  }

  function refreshEconomyUI() {
    if (els.coinLabel) els.coinLabel.textContent = String(state.coins);
    if (els.shopCoinLabel) els.shopCoinLabel.textContent = String(state.coins);
    if (els.equippedLabel) els.equippedLabel.textContent = SHOP[state.equipped]?.name || 'Runner clásico';
    refreshProgressionUI();
    document.querySelectorAll('[data-item]').forEach((card) => {
      const id = card.dataset.item;
      if (!SHOP[id]) return;
      const owned = state.owned.includes(id);
      card.classList.toggle('owned', owned);
      const btn = card.querySelector('[data-buy]');
      if (!btn) return;
      btn.textContent = state.equipped === id ? 'Equipado' : owned ? 'Equipar' : 'Comprar';
    });
  }

  function showHomeToast(message) {
    const el = $('homeToast');
    if (!el) return;
    el.textContent = message; el.hidden = false;
    clearTimeout(showHomeToast._t);
    showHomeToast._t = setTimeout(() => { el.hidden = true; }, 1800);
  }

  function buyOrEquip(id) {
    const item = SHOP[id];
    if (!item) return;
    if (state.owned.includes(id)) {
      state.equipped = id;
      saveEconomy();
      drawShopPreview();
      return;
    }
    if (state.coins < item.price) {
      showHomeToast('Te faltan monedas.');
      return;
    }
    state.coins -= item.price;
    state.owned.push(id);
    state.equipped = id;
    saveEconomy();
    drawShopPreview();
  }

  function awardCoins(amount, reason = '') {
    state.coins += amount;
    saveEconomy();
    if (reason) showHomeToast(`+${amount} ◉ · ${reason}`);
  }

  function defaultVideoFx() {
    return { zoom:1, panX:0, panY:0, brightness:100, contrast:100, saturation:100 };
  }

  function syncVideoFxControls() {
    const fx = state.videoFx || defaultVideoFx();
    if (els.videoZoom) els.videoZoom.value = String(fx.zoom);
    if (els.videoPanX) els.videoPanX.value = String(fx.panX);
    if (els.videoPanY) els.videoPanY.value = String(fx.panY);
    if (els.videoBrightness) els.videoBrightness.value = String(fx.brightness);
    if (els.videoContrast) els.videoContrast.value = String(fx.contrast);
    if (els.videoSaturation) els.videoSaturation.value = String(fx.saturation);
    if (els.zoomValue) els.zoomValue.textContent = `${Number(fx.zoom).toFixed(2)}×`;
    applyEditorVideoFx();
  }

  function applyEditorVideoFx() {
    if (!els.editorVideo) return;
    const fx = state.videoFx || defaultVideoFx();
    els.editorVideo.style.transformOrigin = '50% 50%';
    els.editorVideo.style.transform = `translate(${fx.panX}%, ${fx.panY}%) scale(${fx.zoom})`;
    els.editorVideo.style.filter = `brightness(${fx.brightness}%) contrast(${fx.contrast}%) saturate(${fx.saturation}%)`;
  }

  function setVideoPreset(name) {
    const presets = {
      clean: { zoom:1,panX:0,panY:0,brightness:103,contrast:103,saturation:100 },
      cinema:{ zoom:1.06,panX:0,panY:0,brightness:92,contrast:122,saturation:82 },
      vivid:{ zoom:1.03,panX:0,panY:0,brightness:105,contrast:116,saturation:145 },
      dream:{ zoom:1.08,panX:0,panY:0,brightness:112,contrast:88,saturation:125 },
    };
    state.videoFx = {...(presets[name] || defaultVideoFx())};
    syncVideoFxControls();
  }

  function drawVideoWithFx(ctx, video, w, h) {
    if (!video || video.readyState < 2) return;
    const fx = state.videoFx || defaultVideoFx();
    const vw=video.videoWidth||w, vh=video.videoHeight||h;
    const videoRatio=vw/vh, stageRatio=w/h;
    let baseW,baseH;
    if(videoRatio>stageRatio){baseW=w;baseH=w/videoRatio;}
    else{baseH=h;baseW=h*videoRatio;}
    const dw=baseW*fx.zoom, dh=baseH*fx.zoom;
    const dx=(w-dw)/2 + (fx.panX/100)*w;
    const dy=(h-dh)/2 + (fx.panY/100)*h;
    ctx.save();
    ctx.fillStyle='#02050a';ctx.fillRect(0,0,w,h);
    ctx.filter = `brightness(${fx.brightness}%) contrast(${fx.contrast}%) saturate(${fx.saturation}%)`;
    try { ctx.drawImage(video, dx, dy, dw, dh); } catch (_) {}
    ctx.restore();
  }

  function ensureFaceImage() {
    if (!state.faceImageSrc) return null;
    if (state.faceImage && state.faceImage.src === state.faceImageSrc) return state.faceImage;
    const img = new Image();
    img.src = state.faceImageSrc;
    state.faceImage = img;
    return img;
  }

  async function processFacePhoto(file) {
    if (!file) return;
    const dataUrl = await new Promise((resolve,reject)=>{
      const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file);
    });
    const img = await new Promise((resolve,reject)=>{
      const im=new Image(); im.onload=()=>resolve(im); im.onerror=reject; im.src=dataUrl;
    });
    const size=256, canvas=document.createElement('canvas'); canvas.width=size; canvas.height=size;
    const ctx=canvas.getContext('2d');
    const scale=Math.max(size/img.width,size/img.height);
    const dw=img.width*scale, dh=img.height*scale;
    ctx.drawImage(img,(size-dw)/2,(size-dh)/2,dw,dh);
    state.faceImageSrc=canvas.toDataURL('image/jpeg',.84);
    localStorage.setItem('pyw.face',state.faceImageSrc);
    state.faceImage=null; ensureFaceImage();
    if (els.bigHeadThumb) {
      els.bigHeadThumb.textContent='';
      els.bigHeadThumb.style.backgroundImage=`url("${state.faceImageSrc}")`;
      els.bigHeadThumb.style.backgroundSize='cover';
      els.bigHeadThumb.style.backgroundPosition='center';
      els.bigHeadThumb.style.width='54px'; els.bigHeadThumb.style.height='54px';
      els.bigHeadThumb.style.borderRadius='50%'; els.bigHeadThumb.style.display='block';
    }
    if (!state.owned.includes('bighead')) {
      if (state.coins >= SHOP.bighead.price) {
        state.coins -= SHOP.bighead.price;
        state.owned.push('bighead');
      } else {
        showHomeToast('Selfie lista. Cabezón cuesta 600 ◉ en esta demo.');
        saveEconomy();
        return;
      }
    }
    state.equipped='bighead';
    saveEconomy();
    drawShopPreview();
    showHomeToast('¡Cabezón equipado! Tu foto sólo se guardó en este dispositivo.');
  }

  function drawSpecialMarker(ctx,p,type,w,h,t=0) {
    if (!p) return;
    const x=p.x*w,y=p.y*h;
    ctx.save(); ctx.translate(x,y);
    if(type==='portalIn'||type==='portalOut'){
      const color=type==='portalIn'?'#9a78ff':'#5ee7ff';
      const pulse=1+Math.sin(t*6)*.08;
      ctx.scale(pulse,pulse);ctx.strokeStyle=color;ctx.lineWidth=5;ctx.shadowColor=color;ctx.shadowBlur=18;
      ctx.beginPath();ctx.ellipse(0,0,14,25,0,0,Math.PI*2);ctx.stroke();
      ctx.lineWidth=2;ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(0,0,8,18,0,0,Math.PI*2);ctx.stroke();
    } else if(type==='spring'){
      ctx.strokeStyle='#77f2a1';ctx.lineWidth=4;ctx.shadowColor='#77f2a1';ctx.shadowBlur=12;
      ctx.beginPath();ctx.moveTo(-14,9);ctx.lineTo(-8,2);ctx.lineTo(-2,9);ctx.lineTo(4,2);ctx.lineTo(10,9);ctx.stroke();
      ctx.fillStyle='#77f2a1';ctx.fillRect(-15,10,30,5);
    } else if(type==='boost'){
      ctx.fillStyle='#ffd166';ctx.shadowColor='#ffd166';ctx.shadowBlur=12;
      ctx.beginPath();ctx.moveTo(-18,-8);ctx.lineTo(-2,0);ctx.lineTo(-18,8);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(16,0);ctx.lineTo(0,8);ctx.closePath();ctx.fill();
    }
    ctx.restore();
  }


  function todayKey() { return new Date().toISOString().slice(0,10); }

  function ensureMissionDay() {
    const today = todayKey();
    if (state.missionDate !== today) {
      state.missionDate = today;
      state.missionRuns = 0;
      localStorage.setItem('pyw.missionDate', today);
      localStorage.setItem('pyw.missionRuns', '0');
    }
  }

  function addXp(amount) {
    state.xp += amount;
    localStorage.setItem('pyw.xp', String(state.xp));
    refreshProgressionUI();
  }

  function refreshProgressionUI() {
    ensureMissionDay();
    const level = Math.floor(state.xp / 100) + 1;
    const within = state.xp % 100;
    if (els.playerLevel) els.playerLevel.textContent = String(level);
    if (els.xpLabel) els.xpLabel.textContent = `${within} / 100 XP`;
    if (els.xpBar) els.xpBar.style.width = `${within}%`;
    if (els.missionProgress) els.missionProgress.textContent = `${Math.min(state.missionRuns,3)} / 3 · recompensa 150 ◉`;
  }

  function recordMissionRun() {
    ensureMissionDay();
    if (state.missionRuns >= 3) return;
    state.missionRuns += 1;
    localStorage.setItem('pyw.missionRuns', String(state.missionRuns));
    if (state.missionRuns === 3) awardCoins(150, 'Misión diaria completada');
    refreshProgressionUI();
  }

  function getAudioCtx() {
    if (!state.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) state.audioCtx = new AC();
    }
    if (state.audioCtx?.state === 'suspended') state.audioCtx.resume().catch(()=>{});
    return state.audioCtx;
  }

  function tone(freq=440,duration=.08,type='sine',gain=.035,slide=0) {
    const ctx=getAudioCtx(); if(!ctx) return;
    const osc=ctx.createOscillator(), g=ctx.createGain();
    osc.type=type; osc.frequency.setValueAtTime(freq,ctx.currentTime);
    if(slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),ctx.currentTime+duration);
    g.gain.setValueAtTime(gain,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration);
  }

  function sfx(name) {
    if(name==='jump'){ tone(430,.08,'square',.025,190); }
    if(name==='coin'){ tone(730,.06,'triangle',.03,220); setTimeout(()=>tone(980,.06,'triangle',.025,100),45); }
    if(name==='land'){ tone(110,.05,'sine',.018,-30); }
    if(name==='crash'){ tone(125,.15,'sawtooth',.045,-75); setTimeout(()=>tone(72,.18,'square',.025,-25),55); }
    if(name==='win'){ [523,659,784].forEach((n,i)=>setTimeout(()=>tone(n,.14,'triangle',.035,80),i*90)); }
  }

  function createCollectibles(w,h) {
    if (!state.start || !state.finish) return [];
    const sx=state.start.x*w, sy=state.start.y*h, fx=state.finish.x*w, fy=state.finish.y*h;
    return [.28,.52,.76].map((t,i)=>({
      x:sx+(fx-sx)*t,
      y:sy+(fy-sy)*t-h*(i===1?.10:.075),
      collected:false,
      phase:i*1.7
    }));
  }


  const KEYFRAME_QUANTUM = 0.25;
  const EDITOR_FRAME_WINDOW = 0.16;

  function pathPoints(entry) { return Array.isArray(entry) ? entry : (entry?.points || []); }
  function pathTime(entry) { return Array.isArray(entry) ? 0 : Number(entry?.time || 0); }
  function isTimedPath(entry) { return !Array.isArray(entry) && Number.isFinite(Number(entry?.time)); }
  function quantizeFrameTime(t) { return Math.max(0, Math.round((Number(t)||0) / KEYFRAME_QUANTUM) * KEYFRAME_QUANTUM); }
  function currentEditorTime() { return Number.isFinite(els.editorVideo.currentTime) ? els.editorVideo.currentTime : 0; }

  function timedLayerTimes() {
    const times=[];
    [...(state.surfaces||[]),...(state.hazards||[])].forEach(entry=>{
      if(isTimedPath(entry)) times.push(quantizeFrameTime(pathTime(entry)));
    });
    return [...new Set(times.map(t=>t.toFixed(2)))].map(Number).sort((a,b)=>a-b);
  }

  function nearestLayerTime(t) {
    const times=timedLayerTimes();
    if(!times.length) return null;
    let best=times[0], dist=Math.abs(t-best);
    for(const candidate of times){
      const d=Math.abs(t-candidate);
      if(d<dist){best=candidate;dist=d;}
    }
    return best;
  }

  function editorEntriesAt(entries,t) {
    const raw=(entries||[]).filter(entry=>Array.isArray(entry));
    const layer=nearestLayerTime(t);
    if(layer===null || Math.abs(t-layer)>EDITOR_FRAME_WINDOW) return raw;
    return raw.concat((entries||[]).filter(entry=>isTimedPath(entry) && Math.abs(quantizeFrameTime(pathTime(entry))-layer)<0.01));
  }

  function gameplayEntriesAt(entries,t) {
    const raw=(entries||[]).filter(entry=>Array.isArray(entry));
    const timed=(entries||[]).filter(isTimedPath);
    if(!timed.length) return raw;
    const layer=nearestLayerTime(t);
    if(layer===null) return raw;
    return raw.concat(timed.filter(entry=>Math.abs(quantizeFrameTime(pathTime(entry))-layer)<0.01));
  }

  function updateFrameLayerBadge() {
    if(!els.frameLayerBadge) return;
    if(state.syntheticEditorMode){els.frameLayerBadge.textContent='Nivel estático';return;}
    const t=currentEditorTime();
    const layer=nearestLayerTime(t);
    const active=editorEntriesAt([...(state.surfaces||[]),...(state.hazards||[])],t).filter(entry=>!Array.isArray(entry));
    if(layer!==null && Math.abs(t-layer)<=EDITOR_FRAME_WINDOW){
      els.frameLayerBadge.textContent='Frame '+layer.toFixed(2)+'s · '+active.length+' trazo'+(active.length===1?'':'s');
    }else{
      els.frameLayerBadge.textContent='Frame '+quantizeFrameTime(t).toFixed(2)+'s · nuevo';
    }
  }

  function showScreen(id) {
    screens.forEach((name) => $(name).classList.toggle('active', name === id));
    updateOrientationHint();
    refreshEconomyUI();
    if (id === 'shopScreen') requestAnimationFrame(drawShopPreview);
    if (id === 'exploreScreen') renderPublicFeed(document.querySelector('.explore-tab.active')?.dataset.feed || 'foryou');
  }

  function updateOrientationHint() {
    const landscape = window.innerWidth >= window.innerHeight;
    els.rotateHint.hidden = landscape || window.innerWidth > 900;
  }

  function toast(message, ms = 1700) {
    els.editorToast.textContent = message;
    els.editorToast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { els.editorToast.hidden = true; }, ms);
  }

  function formatTime(ms) {
    const total = Math.max(0, ms) / 1000;
    const min = Math.floor(total / 60).toString().padStart(2, '0');
    const sec = Math.floor(total % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  function cloneLevelData() {
    return JSON.parse(JSON.stringify({
      surfaces: state.surfaces,
      hazards: state.hazards,
      start: state.start,
      finish: state.finish,
      portalIn: state.portalIn,
      portalOut: state.portalOut,
      springs: state.springs,
      boosts: state.boosts,
      videoFx: state.videoFx,
      speed: state.speed,
    }));
  }

  function pushHistory() {
    state.history.push(cloneLevelData());
    if (state.history.length > 40) state.history.shift();
  }

  function restoreHistory() {
    const previous = state.history.pop();
    if (!previous) return;
    Object.assign(state, previous);
    els.speedSelect.value = String(state.speed);
    drawEditor();
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
    }
    if (state.recordingTimer) clearInterval(state.recordingTimer);
  }


  function launchDemo() {
    stopCamera();
    stopGame();
    state.demoMode = true;
    state.videoBlob = null;
    state.videoUrl = null;
    state.levelId = 'demo';
    state.levelName = 'Sala demo';
    state.speed = 1;
    state.attempts = 0;
    state.surfaces = [
      [{x:.055,y:.76},{x:.14,y:.75},{x:.23,y:.73},{x:.33,y:.70}],
      [{x:.42,y:.67},{x:.49,y:.64},{x:.57,y:.63},{x:.64,y:.64}],
      [{x:.72,y:.59},{x:.78,y:.56},{x:.84,y:.54},{x:.92,y:.53}]
    ];
    state.hazards = [
      [{x:.255,y:.655},{x:.255,y:.72}],
      [{x:.555,y:.57},{x:.575,y:.63}]
    ];
    state.start = {x:.07,y:.755};
    state.finish = {x:.89,y:.53};
    state.portalIn = {x:.61,y:.64};
    state.portalOut = {x:.75,y:.56};
    state.springs = [{x:.305,y:.705}];
    state.boosts = [{x:.47,y:.65}];
    state.videoFx = defaultVideoFx();
    playDemo();
  }

  async function playDemo() {
    state.attempts += 1;
    showScreen('gameScreen');
    els.attemptLabel.textContent = String(state.attempts);
    els.gameTimeLabel.textContent = '0.0';
    if (els.runCoins) els.runCoins.textContent = '+0';
    if (els.comboLabel) els.comboLabel.textContent = 'x1';
    els.tapHint.style.opacity = '1';
    els.gameVideo.pause();
    els.gameVideo.removeAttribute('src');
    els.gameVideo.load();
    fitCanvas(els.gameCanvas, els.gameStage);
    startGame();
  }

  function drawDemoWorld(ctx, w, h, t) {
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#dcecf3');
    grad.addColorStop(.58,'#c8dbe0');
    grad.addColorStop(.581,'#8e7967');
    grad.addColorStop(1,'#705c4d');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);

    ctx.fillStyle='rgba(255,255,255,.78)';
    ctx.fillRect(w*.055,h*.09,w*.23,h*.29);
    ctx.strokeStyle='rgba(56,78,89,.28)';
    ctx.lineWidth=3;
    ctx.strokeRect(w*.055,h*.09,w*.23,h*.29);
    ctx.beginPath(); ctx.moveTo(w*.17,h*.09); ctx.lineTo(w*.17,h*.38); ctx.moveTo(w*.055,h*.235); ctx.lineTo(w*.285,h*.235); ctx.stroke();
    ctx.fillStyle='rgba(85,170,210,.16)'; ctx.fillRect(w*.06,h*.095,w*.22,h*.28);

    roundRect(ctx,w*.69,h*.60,w*.25,h*.17,24,'#5d7180');
    roundRect(ctx,w*.71,h*.54,w*.20,h*.10,22,'#718896');
    roundRect(ctx,w*.68,h*.61,w*.045,h*.13,18,'#4d616e');
    roundRect(ctx,w*.91,h*.61,w*.045,h*.13,18,'#4d616e');

    ctx.fillStyle='#765a43';
    ctx.beginPath(); ctx.moveTo(w*.045,h*.755); ctx.lineTo(w*.34,h*.695); ctx.lineTo(w*.345,h*.72); ctx.lineTo(w*.05,h*.78); ctx.closePath(); ctx.fill();
    ctx.fillRect(w*.08,h*.76,w*.018,h*.17);
    ctx.fillRect(w*.30,h*.715,w*.018,h*.18);

    roundRect(ctx,w*.236,h*.64,w*.035,h*.07,7,'#f3ede6');
    ctx.strokeStyle='#d5cbc1'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(w*.272,h*.672,w*.012,-1.2,1.2); ctx.stroke();

    roundRect(ctx,w*.405,h*.635,w*.25,h*.055,16,'#6f8b78');
    roundRect(ctx,w*.455,h*.49,w*.17,h*.16,20,'#799986');
    ctx.fillRect(w*.44,h*.68,w*.018,h*.21);
    ctx.fillRect(w*.61,h*.68,w*.018,h*.21);

    ctx.fillStyle='#9e6f4a'; ctx.beginPath(); ctx.moveTo(w*.54,h*.63); ctx.lineTo(w*.59,h*.63); ctx.lineTo(w*.58,h*.70); ctx.lineTo(w*.55,h*.70); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#3d7d55'; ctx.lineWidth=5;
    for (let i=0;i<5;i++){ const bx=w*(.565 + (i-2)*.009); const by=h*.63; ctx.beginPath(); ctx.moveTo(bx,by); ctx.quadraticCurveTo(bx+w*(i-2)*.015,h*(.55-i*.006),bx+w*(i-2)*.024,h*(.52+i*.01)); ctx.stroke(); }

    ctx.fillStyle='#4d5c68';
    ctx.save(); ctx.translate(w*.71,h*.595); ctx.rotate(-.075); ctx.fillRect(0,0,w*.23,h*.035); ctx.restore();
    ctx.fillRect(w*.75,h*.60,w*.02,h*.22);
    ctx.fillRect(w*.90,h*.58,w*.02,h*.24);

    ctx.fillStyle='rgba(58,80,90,.30)';
    ctx.beginPath(); ctx.ellipse(w*.53,h*.88,w*.24,h*.06,0,0,Math.PI*2); ctx.fill();

    if (t < 2.6) {
      roundRect(ctx,w*.19,h*.52,w*.14,h*.055,14,'rgba(6,17,30,.72)');
      ctx.fillStyle='#fff'; ctx.font=`800 ${Math.max(10,h*.023)}px system-ui`; ctx.textAlign='center'; ctx.fillText('Toca para saltar',w*.26,h*.555);
    }
  }

  function roundRect(ctx,x,y,w,h,r,fill){
    r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
  }

  function chooseReplayMime() {
    const candidates = [
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    return candidates.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
  }

  function startReplayRecording() {
    state.replayBlob = null;
    state.replayChunks = [];
    state.replayActive = false;
    if (!els.gameCanvas?.captureStream || !window.MediaRecorder) return;

    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1280;
    state.replayCanvas = canvas;

    const stream = canvas.captureStream(30);
    const mime = chooseReplayMime();
    try {
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 4500000 } : undefined);
      state.replayRecorder = recorder;
      state.replayMime = recorder.mimeType || mime || 'video/webm';
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) state.replayChunks.push(e.data);
      };
      recorder.onstop = () => {
        if (state.replayChunks.length) {
          state.replayBlob = new Blob(state.replayChunks, { type: state.replayMime || 'video/webm' });
        }
        state.replayActive = false;
        updateShareVideoState();
      };
      recorder.start(200);
      state.replayActive = true;
    } catch (error) {
      console.warn('Replay recorder unavailable', error);
      state.replayRecorder = null;
      state.replayActive = false;
    }
  }

  function stopReplayRecording() {
    if (state.replayRecorder?.state === 'recording') {
      try { state.replayRecorder.stop(); } catch (_) {}
    } else {
      state.replayActive = false;
      updateShareVideoState();
    }
  }

  function updateShareVideoState() {
    if (!els.shareRunBtn || !els.videoReadyNote) return;
    if (state.replayBlob) {
      els.shareRunBtn.textContent = 'Compartir video';
      els.shareRunBtn.classList.remove('is-preparing');
      els.shareRunBtn.classList.add('is-ready');
      els.videoReadyNote.textContent = 'Video listo · vertical y preparado para compartir.';
    } else if (state.replayActive || state.replayRecorder?.state === 'recording') {
      els.shareRunBtn.textContent = 'Preparando video…';
      els.shareRunBtn.classList.add('is-preparing');
      els.shareRunBtn.classList.remove('is-ready');
      els.videoReadyNote.textContent = 'Estamos generando tu clip automáticamente.';
    } else {
      els.shareRunBtn.textContent = 'Compartir video';
      els.shareRunBtn.classList.remove('is-preparing','is-ready');
      els.videoReadyNote.textContent = 'Tu navegador usará una tarjeta o enlace si no permite video.';
    }
  }

  function drawReplayFrame() {
    const out = state.replayCanvas;
    const source = els.gameCanvas;
    if (!out || !source || !state.game) return;
    const ctx = out.getContext('2d');
    const w = out.width, h = out.height;
    const game = state.game;
    const success = state.result?.success;

    const bg = ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#132846');
    bg.addColorStop(.5,'#081426');
    bg.addColorStop(1,'#03070d');
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,w,h);

    ctx.fillStyle='#5ee7ff';
    ctx.font='900 24px system-ui';
    ctx.fillText('PLAY YOUR WORLD',42,62);
    ctx.fillStyle='#fff';
    ctx.font='900 46px system-ui';
    ctx.fillText('CONVERTÍ MI MUNDO',42,125);
    ctx.fillText('EN UN JUEGO',42,178);

    ctx.save();
    roundedBody(ctx,32,225,656,690,30);
    ctx.clip();
    ctx.fillStyle='#000';
    ctx.fillRect(32,225,656,690);
    const sw=source.width, sh=source.height;
    const srcRatio=sw/sh, boxRatio=656/690;
    let sx=0,sy=0,sWidth=sw,sHeight=sh;
    if(srcRatio>boxRatio){sWidth=sh*boxRatio;sx=(sw-sWidth)/2;}
    else{sHeight=sw/boxRatio;sy=(sh-sHeight)/2;}
    ctx.drawImage(source,sx,sy,sWidth,sHeight,32,225,656,690);
    ctx.restore();

    ctx.fillStyle='rgba(255,255,255,.08)';
    roundedBody(ctx,42,952,636,150,24); ctx.fill();
    ctx.fillStyle='#fff';
    ctx.font='800 27px system-ui';
    ctx.fillText(`Tiempo  ${(game.elapsed||0).toFixed(1)}s`,70,1002);
    ctx.fillText(`Orbes  ${game.collected||0}/3`,70,1046);
    ctx.fillStyle='#ffd166';
    ctx.font='900 23px system-ui';
    ctx.fillText(success === false ? 'BONK 💥' : '¿PUEDES SUPERARLO?',70,1083);

    ctx.fillStyle='#a9b6ca';
    ctx.font='700 18px system-ui';
    ctx.fillText('Graba · dibuja · juega · comparte',42,1196);
    ctx.fillStyle='#5ee7ff';
    ctx.font='800 18px system-ui';
    ctx.fillText('PLAY YOUR WORLD · ALPHA',42,1232);
  }

  function showNativeCameraFallback(reason) {
    stopCamera();
    els.cameraPreview.srcObject = null;
    els.cameraPreview.classList.remove('camera-live','camera-ready');
    els.cameraFallback.hidden = false;
    els.captureGuide.hidden = true;
    els.recordBtn.disabled = true;
    els.captureStatus.textContent = 'Usa la cámara nativa del teléfono o elige un video.';
    if (els.cameraFallbackReason) els.cameraFallbackReason.textContent = reason || 'Este navegador no pudo mostrar la cámara dentro de la página.';
  }

  function waitForCameraPreview(video, timeoutMs=2400) {
    return new Promise((resolve) => {
      let done=false;
      const finish=(ok)=>{ if(done)return; done=true; cleanup(); resolve(ok); };
      const check=()=>{ if(video.videoWidth>0 && video.videoHeight>0 && video.readyState>=2) finish(true); };
      const cleanup=()=>{
        clearTimeout(timer);
        video.removeEventListener('loadedmetadata',check);
        video.removeEventListener('canplay',check);
        video.removeEventListener('playing',check);
      };
      video.addEventListener('loadedmetadata',check);
      video.addEventListener('canplay',check);
      video.addEventListener('playing',check);
      const timer=setTimeout(()=>finish(video.videoWidth>0 && video.videoHeight>0),timeoutMs);
      check();
    });
  }

  async function openCapture() {
    stopGame();
    stopCamera();
    resetWorkingVideo();
    showScreen('captureScreen');
    els.cameraFallback.hidden = true;
    els.useRecordingBtn.disabled = true;
    els.recordBtn.disabled = false;
    els.captureTimer.textContent = '00:00';
    els.retakeBtn.hidden = true;
    els.previewBadge.hidden = true;
    els.captureGuide.hidden = false;
    els.captureStatus.textContent = 'Abriendo cámara…';
    els.cameraPreview.controls = false;
    els.cameraPreview.removeAttribute('src');
    els.cameraPreview.srcObject = null;
    els.cameraPreview.classList.add('camera-live');
    els.cameraPreview.classList.remove('camera-ready');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showNativeCameraFallback('Este navegador no permite preview web. Abre la cámara nativa del teléfono.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 16 / 9 },
        },
      });
      state.stream = stream;
      els.cameraPreview.srcObject = stream;
      els.cameraPreview.muted = true;
      els.cameraPreview.playsInline = true;
      await els.cameraPreview.play();
      const visible = await waitForCameraPreview(els.cameraPreview, 2600);
      if (!visible) {
        showNativeCameraFallback('La cámara dio permiso, pero este navegador no mostró la imagen. Usa la cámara nativa.');
        return;
      }
      els.cameraPreview.classList.add('camera-ready');
      els.captureStatus.textContent = 'Cámara lista. Mantén el teléfono estable y graba 5–8 segundos.';
    } catch (error) {
      console.warn('Camera unavailable', error);
      const msg = error && error.name === 'NotAllowedError'
        ? 'La cámara web está bloqueada por permisos del navegador. Usa la cámara nativa.'
        : 'No pude abrir el preview web. Usa la cámara nativa del teléfono.';
      showNativeCameraFallback(msg);
    }
  }

  function resetWorkingVideo() {
    if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
    state.videoBlob = null;
    state.videoUrl = null;
    state.levelId = null;
    state.levelName = null;
    state.surfaces = [];
    state.hazards = [];
    state.start = null;
    state.finish = null;
    state.portalIn = null;
    state.portalOut = null;
    state.springs = [];
    state.boosts = [];
    state.videoFx = defaultVideoFx();
    state.history = [];
    state.attempts = 0;
    state.demoMode = false;
    state.syntheticEditorMode = false;
    state.publicLevelId = null;
    state.remixSource = null;
    state.returnAfterGame = 'homeScreen';
    els.editorVideo.style.display = '';
    els.editorVideoToggle.style.display = '';
    const timeline = document.querySelector('.timeline');
    if (timeline) timeline.style.display = '';
  }

  function pickRecorderMimeType() {
    const candidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    return candidates.find((type) => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) || '';
  }

  function startRecording() {
    if (!state.stream || !window.MediaRecorder) {
      els.nativeCaptureInput?.click();
      return;
    }
    state.chunks = [];
    const mimeType = pickRecorderMimeType();
    try {
      state.recorder = new MediaRecorder(state.stream, mimeType ? { mimeType } : undefined);
    } catch (error) {
      console.warn('MediaRecorder init failed', error);
      els.videoFileInput.click();
      return;
    }

    state.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) state.chunks.push(e.data);
    };
    state.recorder.onstop = () => {
      const type = state.recorder?.mimeType || 'video/webm';
      const blob = new Blob(state.chunks, { type });
      setVideoBlob(blob);
    };

    state.recorder.start(120);
    state.recordingStartedAt = performance.now();
    els.recordBtn.classList.add('recording');
    els.useRecordingBtn.disabled = true;
    state.recordingTimer = setInterval(() => {
      const elapsed = performance.now() - state.recordingStartedAt;
      els.captureTimer.textContent = formatTime(elapsed);
      if (elapsed >= 10000) stopRecording();
    }, 100);
  }

  function stopRecording() {
    if (state.recorder && state.recorder.state === 'recording') state.recorder.stop();
    els.recordBtn.classList.remove('recording');
    if (state.recordingTimer) clearInterval(state.recordingTimer);
    state.recordingTimer = null;
  }

  async function setVideoBlob(blob) {
    if (!blob || !blob.size) return;
    if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
    state.videoBlob = blob;
    state.videoUrl = URL.createObjectURL(blob);
    stopCamera();

    els.cameraPreview.srcObject = null;
    els.cameraPreview.classList.remove('camera-live');
    els.cameraPreview.classList.add('camera-ready');
    els.cameraPreview.src = state.videoUrl;
    els.cameraPreview.muted = true;
    els.cameraPreview.loop = true;
    els.cameraPreview.controls = true;
    els.cameraPreview.load();
    els.captureGuide.hidden = true;
    els.previewBadge.hidden = false;
    els.retakeBtn.hidden = false;
    els.recordBtn.disabled = false;
    els.useRecordingBtn.disabled = false;
    els.cameraFallback.hidden = true;
    els.captureStatus.textContent = 'Revisa lo que grabaste. Si te gusta, úsalo para crear el nivel.';

    try {
      await waitForMetadata(els.cameraPreview);
      els.cameraPreview.currentTime = 0;
      await els.cameraPreview.play();
    } catch (_) {
      // Some mobile browsers require a manual tap on the preview.
    }
  }

  async function openEditor() {
    if (!state.videoBlob || !state.videoUrl) return;
    stopCamera();
    showScreen('editorScreen');
    els.editorVideo.src = state.videoUrl;
    els.editorVideo.currentTime = 0;
    els.editorVideo.pause();
    await waitForMetadata(els.editorVideo);
    const duration = Number.isFinite(els.editorVideo.duration) ? els.editorVideo.duration : 0;
    els.videoScrubber.value = '0';
    els.timelineCurrent.textContent = '0.0s';
    els.timelineDuration.textContent = `${duration.toFixed(1)}s`;
    fitCanvas(els.editorCanvas, els.editorStage);
    els.editorRail?.classList.add('collapsed');
    syncVideoFxControls();
    updateFrameLayerBadge();
    setTool(state.tool || 'surface');
    drawEditor();
  }

  function waitForMetadata(video) {
    if (video.readyState >= 1) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => { video.removeEventListener('loadedmetadata', done); resolve(); };
      video.addEventListener('loadedmetadata', done, { once: true });
    });
  }

  function fitCanvas(canvas, container) {
    const rect = container.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.dataset.cssWidth = String(rect.width);
    canvas.dataset.cssHeight = String(rect.height);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    canvas.dataset.ratio = String(ratio);
  }

  function cssSize(canvas) {
    return {
      w: parseFloat(canvas.dataset.cssWidth) || canvas.clientWidth,
      h: parseFloat(canvas.dataset.cssHeight) || canvas.clientHeight,
    };
  }

  function pointFromEvent(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  }

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll('.tool[data-tool], .advanced-tool[data-tool]').forEach((button) => {
      button.classList.toggle('active', button.dataset.tool === tool);
      button.classList.toggle('selected', button.dataset.tool === tool);
    });
    const copy = {
      surface: 'Dibuja por dónde puede correr.',
      hazard: 'Marca lo que debe evitar.',
      start: 'Toca una superficie para colocar el inicio.',
      finish: 'Toca dónde termina el nivel.',
      erase: 'Toca una línea o marcador para borrarlo.',
      portalIn: 'Coloca la entrada del portal.',
      portalOut: 'Coloca dónde reaparece el runner.',
      spring: 'Coloca un resorte para un súper salto.',
      boost: 'Coloca un boost de velocidad.',
    };
    els.editorInstruction.textContent = copy[tool] || '';
  }

  function simplifyPath(points, tolerance = 0.003) {
    if (points.length <= 2) return points;

    const sqTol = tolerance * tolerance;
    const sqDistToSegment = (p, a, b) => {
      let x = a.x;
      let y = a.y;
      let dx = b.x - x;
      let dy = b.y - y;
      if (dx !== 0 || dy !== 0) {
        const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) { x = b.x; y = b.y; }
        else if (t > 0) { x += dx * t; y += dy * t; }
      }
      dx = p.x - x;
      dy = p.y - y;
      return dx * dx + dy * dy;
    };

    const simplifyDP = (pts, first, last, out) => {
      let maxSqDist = sqTol;
      let index = -1;
      for (let i = first + 1; i < last; i++) {
        const sqDist = sqDistToSegment(pts[i], pts[first], pts[last]);
        if (sqDist > maxSqDist) { index = i; maxSqDist = sqDist; }
      }
      if (index !== -1) {
        if (index - first > 1) simplifyDP(pts, first, index, out);
        out.push(pts[index]);
        if (last - index > 1) simplifyDP(pts, index, last, out);
      }
    };

    const result = [points[0]];
    simplifyDP(points, 0, points.length - 1, result);
    result.push(points[points.length - 1]);
    return result;
  }

  function nearestDistanceToPath(p, path) {
    let best = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      best = Math.min(best, pointSegmentDistanceNormalized(p, path[i], path[i + 1]));
    }
    return best;
  }

  function pointSegmentDistanceNormalized(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    return Math.hypot(p.x - x, p.y - y);
  }

  function eraseAt(p) {
    pushHistory();
    let target = null;
    let targetDist = 0.035;
    state.surfaces.forEach((path, i) => {
      const d = nearestDistanceToPath(p, pathPoints(path));
      if (d < targetDist) { target = ['surface', i]; targetDist = d; }
    });
    state.hazards.forEach((path, i) => {
      const d = nearestDistanceToPath(p, pathPoints(path));
      if (d < targetDist) { target = ['hazard', i]; targetDist = d; }
    });
    if (state.start && Math.hypot(p.x - state.start.x, p.y - state.start.y) < targetDist) target = ['start'];
    if (state.finish && Math.hypot(p.x - state.finish.x, p.y - state.finish.y) < targetDist) target = ['finish'];

    const markerChecks = [['portalIn',state.portalIn],['portalOut',state.portalOut]];
    for (const [name,marker] of markerChecks) {
      if (marker && Math.hypot(p.x-marker.x,p.y-marker.y) < targetDist) { target=[name]; targetDist=Math.hypot(p.x-marker.x,p.y-marker.y); }
    }
    (state.springs||[]).forEach((m,i)=>{const d=Math.hypot(p.x-m.x,p.y-m.y);if(d<targetDist){target=['spring',i];targetDist=d;}});
    (state.boosts||[]).forEach((m,i)=>{const d=Math.hypot(p.x-m.x,p.y-m.y);if(d<targetDist){target=['boost',i];targetDist=d;}});

    if (!target) { state.history.pop(); return; }
    if (target[0] === 'surface') state.surfaces.splice(target[1], 1);
    if (target[0] === 'hazard') state.hazards.splice(target[1], 1);
    if (target[0] === 'start') state.start = null;
    if (target[0] === 'finish') state.finish = null;
    if (target[0] === 'portalIn') state.portalIn = null;
    if (target[0] === 'portalOut') state.portalOut = null;
    if (target[0] === 'spring') state.springs.splice(target[1],1);
    if (target[0] === 'boost') state.boosts.splice(target[1],1);
    drawEditor();
  }

  function drawPath(ctx, path, color, width, w, h, dashed = false) {
    if (!path || path.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(path[0].x * w, path[0].y * h);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x * w, path[i].y * h);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    if (dashed) ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.restore();
  }

  function drawMarker(ctx, p, kind, w, h) {
    if (!p) return;
    const x = p.x * w;
    const y = p.y * h;
    ctx.save();
    ctx.translate(x, y);
    if (kind === 'start') {
      ctx.fillStyle = COLORS.start;
      ctx.shadowColor = COLORS.start;
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#06111e'; ctx.lineWidth = 3; ctx.stroke();
      ctx.font = '900 10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#06111e'; ctx.fillText('S', 0, 3.5);
    } else {
      ctx.strokeStyle = COLORS.finish;
      ctx.fillStyle = COLORS.finish;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-7, 12); ctx.lineTo(-7, -12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5, -11); ctx.lineTo(13, -6); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawEditor() {
    const canvas = els.editorCanvas;
    const { w, h } = cssSize(canvas);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (state.syntheticEditorMode) drawDemoWorld(ctx, w, h, performance.now()/1000);
    const now = currentEditorTime();

    const renderEntries = (entries, color, width, dashed) => {
      editorEntriesAt(entries,now).forEach((entry) => {
        drawPath(ctx, pathPoints(entry), color, width, w, h, dashed);
      });
    };

    renderEntries(state.surfaces, COLORS.surface, 5, false);
    renderEntries(state.hazards, COLORS.hazard, 7, true);
    if (state.currentPath.length > 1) {
      drawPath(ctx, state.currentPath, state.tool === 'hazard' ? COLORS.hazard : COLORS.surface, state.tool === 'hazard' ? 7 : 5, w, h, state.tool === 'hazard');
    }
    drawMarker(ctx, state.start, 'start', w, h);
    drawMarker(ctx, state.finish, 'finish', w, h);
    drawSpecialMarker(ctx,state.portalIn,'portalIn',w,h,performance.now()/1000);
    drawSpecialMarker(ctx,state.portalOut,'portalOut',w,h,performance.now()/1000);
    (state.springs||[]).forEach(p=>drawSpecialMarker(ctx,p,'spring',w,h));
    (state.boosts||[]).forEach(p=>drawSpecialMarker(ctx,p,'boost',w,h));
    updateFrameLayerBadge();
  }

  function validateLevel() {
    const missing = [];
    if (!state.videoBlob && !state.syntheticEditorMode && !state.demoMode) missing.push('video');
    if (!state.surfaces.length) missing.push('una superficie');
    if (!state.start) missing.push('el inicio');
    if (!state.finish) missing.push('la meta');
    if (missing.length) {
      toast(`Falta ${missing.join(', ')}.`);
      return false;
    }
    return true;
  }

  function normalizeLevelForSave() {
    return {
      id: state.levelId || (crypto.randomUUID ? crypto.randomUUID() : `level-${Date.now()}`),
      name: state.levelName || `Mi mundo ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}`,
      createdAt: Date.now(),
      synthetic: state.syntheticEditorMode,
      remixSource: state.remixSource,
      surfaces: state.surfaces,
      hazards: state.hazards,
      start: state.start,
      finish: state.finish,
      portalIn: state.portalIn,
      portalOut: state.portalOut,
      springs: state.springs,
      boosts: state.boosts,
      videoFx: state.videoFx,
      speed: state.speed,
    };
  }

  async function saveCurrentLevel() {
    if (!validateLevel()) return;
    const data = normalizeLevelForSave();
    if (state.videoBlob) data.videoBlob = state.videoBlob;
    await dbPutLevel(data);
    state.levelId = data.id;
    state.levelName = data.name;
    toast('Nivel guardado en este dispositivo.');
  }

  async function playLevel() {
    if (!validateLevel()) return;
    state.speed = parseFloat(els.speedSelect.value) || 1;
    if (state.syntheticEditorMode) {
      state.demoMode = true;
      state.returnAfterGame = 'editorScreen';
      return playDemo();
    }
    state.attempts += 1;
    showScreen('gameScreen');
    els.attemptLabel.textContent = String(state.attempts);
    els.gameTimeLabel.textContent = '0.0';
    if (els.runCoins) els.runCoins.textContent = '+0';
    if (els.comboLabel) els.comboLabel.textContent = 'x1';
    els.tapHint.style.opacity = '1';
    els.gameVideo.src = state.videoUrl;
    els.gameVideo.loop = true;
    els.gameVideo.muted = true;
    await waitForMetadata(els.gameVideo);
    fitCanvas(els.gameCanvas, els.gameStage);
    try { els.gameVideo.currentTime = 0; await els.gameVideo.play(); } catch (_) {}
    startGame();
  }

  function startGame() {
    stopGame(false);
    state.result = null;
    const canvas = els.gameCanvas;
    const { w, h } = cssSize(canvas);
    const speedMultiplier = state.speed;
    const playerHeight = Math.max(40, h * 0.09);
    const playerWidth = playerHeight * 0.42;
    const start = { x: state.start.x * w, y: state.start.y * h };

    state.game = {
      running: true,
      success: false,
      failed: false,
      startTime: performance.now(),
      lastTime: performance.now(),
      elapsed: 0,
      speed: w * 0.145 * speedMultiplier,
      gravity: h * 2.45,
      jumpVelocity: -h * (0.92 + (speedMultiplier - 1) * 0.1),
      particles: [],
      dust: [],
      confetti: [],
      crashWord: 'OOF!',
      collectibles: createCollectibles(w,h),
      collected: 0,
      combo: 1,
      lastGroundedAt: performance.now(),
      jumpBufferedUntil: 0,
      portalCooldown: 0,
      boostUntil: 0,
      springCooldown: 0,
      landFxUntil: 0,
      hearts: 3,
      damage: 0,
      invulnerableUntil: 0,
      hitReactionUntil: 0,
      hitFxUntil: 0,
      hitWord: '',
      lastSafe: { x:start.x, y:start.y-playerHeight*.55 },
      player: {
        x: start.x,
        y: start.y - playerHeight * 0.55,
        vx: 0,
        vy: 0,
        width: playerWidth,
        height: playerHeight,
        grounded: true,
        rotation: 0,
        crashSpin: 0,
        crashVX: 0,
        crashVY: 0,
        crashAge: 0,
        ragdollSeed: 0,
        impactScaleX: 1,
        impactScaleY: 1,
      },
    };

    updateLivesHud();
    if (els.damageStatus) els.damageStatus.hidden = true;
    startReplayRecording();

    const loop = (now) => {
      if (!state.game) return;
      const dt = Math.min((now - state.game.lastTime) / 1000, 0.033);
      state.game.lastTime = now;
      state.game.elapsed = (now - state.game.startTime) / 1000;
      els.gameTimeLabel.textContent = state.game.elapsed.toFixed(1);
      updateGame(dt);
      drawGame(now / 1000);
      if (state.game?.running || state.game?.failed) state.gameFrame = requestAnimationFrame(loop);
    };
    state.gameFrame = requestAnimationFrame(loop);
  }

  function stopGame(clear = true) {
    if (state.gameFrame) cancelAnimationFrame(state.gameFrame);
    state.gameFrame = null;
    if (clear) state.game = null;
    try { els.gameVideo.pause(); } catch (_) {}
  }

  function pixelPaths(paths, w, h) {
    return paths.map((entry) => pathPoints(entry).map((p) => ({ x: p.x * w, y: p.y * h }))).filter((p) => p.length > 1);
  }

  function segmentYAtX(a, b, x) {
    const minX = Math.min(a.x, b.x) - 0.5;
    const maxX = Math.max(a.x, b.x) + 0.5;
    if (x < minX || x > maxX) return null;
    const dx = b.x - a.x;
    if (Math.abs(dx) < 0.5) return null;
    const t = (x - a.x) / dx;
    if (t < 0 || t > 1) return null;
    const slope = (b.y - a.y) / dx;
    if (Math.abs(Math.atan(slope) * 180 / Math.PI) > 68) return null;
    return { y: a.y + (b.y - a.y) * t, slope };
  }

  function surfaceCandidatesAtX(paths, x) {
    const out = [];
    for (const path of paths) {
      for (let i = 0; i < path.length - 1; i++) {
        const hit = segmentYAtX(path[i], path[i + 1], x);
        if (hit) out.push(hit);
      }
    }
    return out;
  }

  function distancePointToSegmentPx(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  function collidesWithPaths(point, paths, radius) {
    for (const path of paths) {
      for (let i = 0; i < path.length - 1; i++) {
        if (distancePointToSegmentPx(point, path[i], path[i + 1]) <= radius) return true;
      }
    }
    return false;
  }

  function updateGame(dt) {
    const game = state.game;
    if (!game) return;
    const canvas = els.gameCanvas;
    const { w, h } = cssSize(canvas);
    const player = game.player;
    const nowMs = performance.now();

    if (game.failed) {
      player.crashAge += dt;
      player.impactScaleX += (1-player.impactScaleX)*Math.min(1,dt*12);
      player.impactScaleY += (1-player.impactScaleY)*Math.min(1,dt*12);
      player.x += player.crashVX * dt;
      player.y += player.crashVY * dt;
      player.crashVY += game.gravity * 0.8 * dt;
      player.rotation += player.crashSpin * dt;
      if (game.elapsed - game.failAt > 1.05) finishRun(false);
      return;
    }
    if (!game.running) return;

    const videoTime = state.demoMode ? 0 : (Number.isFinite(els.gameVideo.currentTime) ? els.gameVideo.currentTime : game.elapsed);
    const surfaces = pixelPaths(gameplayEntriesAt(state.surfaces, videoTime), w, h);
    const hazards = pixelPaths(gameplayEntriesAt(state.hazards, videoTime), w, h);
    const previousFootY = player.y + player.height * 0.48;

    game.portalCooldown = Math.max(0, game.portalCooldown - dt);
    game.springCooldown = Math.max(0, game.springCooldown - dt);
    const damageSpeed = game.damage >= 2 ? .82 : game.damage === 1 ? .94 : 1;
    const hitSpeed = nowMs < game.hitReactionUntil ? .38 : 1;
    const speedNow = game.speed * damageSpeed * hitSpeed * (performance.now() < game.boostUntil ? 1.55 : 1);
    player.x += speedNow * dt;
    if (!player.grounded) {
      player.vy += game.gravity * dt;
      player.y += player.vy * dt;
    }

    const footX = player.x + player.width * 0.15;
    const footY = player.y + player.height * 0.48;
    const candidates = surfaceCandidatesAtX(surfaces, footX).sort((a, b) => a.y - b.y);
    let support = null;

    if (player.grounded) {
      const maxStep = player.height * 0.42;
      support = candidates
        .filter((c) => Math.abs(c.y - footY) <= maxStep)
        .sort((a, b) => Math.abs(a.y - footY) - Math.abs(b.y - footY))[0] || null;
      if (support) {
        player.y = support.y - player.height * 0.48;
        player.vy = Math.max(0, game.speed * support.slope * 0.05);
        game.lastGroundedAt = nowMs;
        if (nowMs > game.invulnerableUntil && player.x > 10) game.lastSafe = {x:player.x, y:player.y};
      } else {
        player.grounded = false;
        player.vy = Math.max(player.vy, 20);
      }
    } else if (player.vy >= 0) {
      support = candidates
        .filter((c) => previousFootY <= c.y + player.height * 0.16 && footY >= c.y - player.height * 0.06)
        .sort((a, b) => a.y - b.y)[0] || null;
      if (support) {
        player.grounded = true;
        player.y = support.y - player.height * 0.48;
        player.vy = 0;
        game.lastGroundedAt = nowMs;
        game.lastSafe = {x:player.x, y:player.y};
        game.landFxUntil = nowMs + 180;
        game.dust.push(...Array.from({length:6},()=>({x:player.x,y:support.y,vx:(Math.random()-.5)*70,vy:-20-Math.random()*35,life:.35+Math.random()*.2})));
        sfx('land');
        if (game.jumpBufferedUntil > nowMs) { game.jumpBufferedUntil = 0; jump(); }
      }
    }

    const bodyPoint = { x: player.x, y: player.y };
    const feetPoint = { x: player.x, y: player.y + player.height * 0.25 };
    if (nowMs >= game.invulnerableUntil && (collidesWithPaths(bodyPoint, hazards, player.width * 0.7) || collidesWithPaths(feetPoint, hazards, player.width * 0.55))) {
      takeHit('hazard');
      return;
    }

    for (const coin of game.collectibles || []) {
      if (!coin.collected && Math.hypot(player.x-coin.x, player.y-coin.y) < Math.max(26,player.height*.7)) {
        coin.collected=true; game.collected += 1; game.combo = Math.min(4,game.combo+1);
        if (els.runCoins) els.runCoins.textContent = `+${game.collected*5}`;
        if (els.comboLabel) els.comboLabel.textContent = `x${game.combo}`;
        sfx('coin');
      }
    }

        const nearNorm = (p, radiusPx) => p && Math.hypot(player.x-p.x*w, player.y-p.y*h) <= radiusPx;

    if (state.portalIn && state.portalOut && game.portalCooldown <= 0 && nearNorm(state.portalIn, Math.max(24,player.height*.55))) {
      player.x = state.portalOut.x*w;
      player.y = state.portalOut.y*h - player.height*.35;
      player.vy = Math.min(player.vy,-h*.12);
      player.grounded = false;
      game.portalCooldown = .65;
      game.particles.push(...Array.from({length:18},(_,i)=>({x:player.x,y:player.y,vx:(Math.random()-.5)*130,vy:(Math.random()-.5)*130,r:2+Math.random()*4,color:i%2?'#5ee7ff':'#9a78ff'})));
      tone(240,.12,'sine',.035,520);
      if(navigator.vibrate) navigator.vibrate(18);
    }

    if (game.springCooldown <= 0) {
      for (const pad of state.springs || []) {
        if (nearNorm(pad, Math.max(22,player.height*.45))) {
          player.grounded=false; player.vy=game.jumpVelocity*1.42; game.springCooldown=.35;
          tone(330,.09,'square',.03,400); if(navigator.vibrate) navigator.vibrate(14); break;
        }
      }
    }

    for (const boost of state.boosts || []) {
      if (nearNorm(boost, Math.max(24,player.height*.45))) {
        game.boostUntil=performance.now()+750;
      }
    }

    const finish = { x: state.finish.x * w, y: state.finish.y * h };
    if (Math.hypot(player.x - finish.x, player.y - finish.y) < Math.max(30, player.height * 0.8) || player.x >= finish.x + player.width * 0.3) {
      finishRun(true);
      return;
    }

    if (player.y > h + player.height * 0.7) { takeHit('fall'); return; }
    if (player.x > w + player.width) crash('fall');
  }

  function jump() {
    const game = state.game;
    if (!game || !game.running || game.failed) return;
    const p = game.player;
    const now = performance.now();
    const canCoyote = now - game.lastGroundedAt <= 130;
    if (p.grounded || canCoyote) {
      p.grounded = false;
      p.vy = game.jumpVelocity;
      game.lastGroundedAt = -99999;
      els.tapHint.style.opacity = '0';
      sfx('jump');
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      game.jumpBufferedUntil = now + 150;
    }
  }

  function updateLivesHud(hitIndex=-1) {
    if (!state.game) return;
    const hearts = state.game.hearts;
    [els.heart1,els.heart2,els.heart3].forEach((el,i)=>{
      if(!el) return;
      el.classList.toggle('lost', i >= hearts);
      el.classList.remove('hit');
    });
    if (hitIndex >= 0) {
      const el=[els.heart1,els.heart2,els.heart3][hitIndex];
      if(el){ void el.offsetWidth; el.classList.add('hit'); }
    }
  }

  function showDamageStatus(text) {
    if(!els.damageStatus) return;
    els.damageStatus.textContent=text;
    els.damageStatus.hidden=false;
    clearTimeout(showDamageStatus._t);
    showDamageStatus._t=setTimeout(()=>{els.damageStatus.hidden=true;},850);
  }

  function takeHit(kind) {
    const game=state.game;
    if(!game || game.failed || !game.running) return;
    const now=performance.now();
    if(now < game.invulnerableUntil) return;

    game.hearts = Math.max(0, game.hearts-1);
    game.damage = 3-game.hearts;
    game.hitFxUntil = now+700;
    game.hitWord = game.hearts===2 ? '¡AUCH!' : game.hearts===1 ? '¡ÚLTIMA!' : '¡BONK!';
    updateLivesHud(game.hearts);
    showDamageStatus(game.hearts>0 ? (game.hitWord+' · '+game.hearts+' '+(game.hearts===1?'VIDA':'VIDAS')) : '💥 FIN DE LA CARRERA');
    sfx('crash');
    if(navigator.vibrate) navigator.vibrate(game.hearts>0?[35,20,45]:[60,30,100]);

    if(game.hearts<=0){
      crash(kind);
      return;
    }

    const p=game.player;
    game.invulnerableUntil=now+1250;
    game.hitReactionUntil=now+420;

    game.particles.push(...Array.from({length:10},(_,i)=>({
      x:p.x,y:p.y-p.height*.1,
      vx:(Math.random()-.5)*130,vy:-25-Math.random()*90,
      r:2+Math.random()*4,color:i%2?'#ffd166':'#f8fafc'
    })));

    if(kind==='fall'){
      p.x=game.lastSafe.x;
      p.y=game.lastSafe.y;
      p.vy=0;
      p.rotation=0;
      p.grounded=true;
    }else{
      p.x=Math.max(8,p.x-p.width*.9);
      p.vy=-game.gravity*.13;
      p.grounded=false;
      p.rotation=-.12;
    }
  }

  function drawDamageFx(ctx,game,t) {
    if(!game || performance.now()>game.hitFxUntil || !game.hitWord) return;
    const p=game.player;
    ctx.save();
    ctx.translate(p.x+p.width*.8,p.y-p.height*.55);
    ctx.rotate(-.08);
    ctx.font='1000 '+Math.max(16,p.height*.26)+'px system-ui';
    ctx.lineWidth=5;ctx.strokeStyle='#07101f';ctx.fillStyle='#ffd166';
    ctx.strokeText(game.hitWord,0,0);ctx.fillText(game.hitWord,0,0);
    for(let i=0;i<3;i++){
      const a=t*5+i*2.1,r=p.height*(.28+i*.035);
      const x=Math.cos(a)*r,y=Math.sin(a)*r*.45-p.height*.12;
      ctx.fillStyle=i%2?'#5ee7ff':'#ffd166';
      ctx.beginPath();ctx.arc(x,y,2.5+i*.5,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function crash(kind) {
    const game = state.game;
    if (!game || game.failed || !game.running) return;
    game.failed = true;
    game.running = false;
    game.failAt = game.elapsed;
    const p = game.player;
    p.crashVX = game.speed * (kind === 'hazard' ? 1.05 : 0.55);
    p.crashVY = kind === 'hazard' ? -game.gravity * 0.23 : Math.max(120, p.vy);
    p.crashSpin = kind === 'hazard' ? 10.5 : 7.5;
    p.crashAge = 0;
    p.ragdollSeed = Math.random()*10;
    p.impactScaleX = kind === 'hazard' ? 1.22 : 1.12;
    p.impactScaleY = kind === 'hazard' ? .76 : .86;
    game.crashWord = game.hearts===0 ? (kind==='hazard'?'K.O.!':'NOOO!') : (kind === 'hazard' ? (Math.random() > .5 ? 'BONK!' : 'OOF!') : (Math.random() > .5 ? 'NOOO!' : 'OOF!'));
    game.particles = Array.from({length:14},(_,i)=>({
      x:p.x,y:p.y-p.height*.05,
      vx:(Math.random()-.35)*180,vy:(Math.random()-.75)*150,
      r:3+Math.random()*5,color:i%3===0?'#ffd166':i%2===0?'#5ee7ff':'#ff7890'
    }));
    sfx('crash');
    if (navigator.vibrate) navigator.vibrate([55, 25, 90]);
  }

  function drawGame(t) {
    const canvas = els.gameCanvas;
    const { w, h } = cssSize(canvas);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (state.game?.failed && state.game.player.crashAge < .18) {
      const power = (1 - state.game.player.crashAge/.18) * 7;
      ctx.translate((Math.random()-.5)*power, (Math.random()-.5)*power);
    }
    if (state.demoMode) drawDemoWorld(ctx, w, h, t);
    else drawVideoWithFx(ctx, els.gameVideo, w, h);
    if (!state.game) { ctx.restore(); return; }
    const p = state.game.player;
    drawGameJuice(ctx,state.game,t,w,h);
    drawSpecialMarker(ctx,state.portalIn,'portalIn',w,h,t);
    drawSpecialMarker(ctx,state.portalOut,'portalOut',w,h,t);
    (state.springs||[]).forEach(m=>drawSpecialMarker(ctx,m,'spring',w,h,t));
    (state.boosts||[]).forEach(m=>drawSpecialMarker(ctx,m,'boost',w,h,t));
    drawMarker(ctx, state.finish, 'finish', w, h);
    drawDamageFx(ctx, state.game, t);
    drawCrashFx(ctx, state.game, t);
    drawRunner(ctx, p, t, state.game.failed);
    ctx.restore();
    drawReplayFrame();
  }

  function drawGameJuice(ctx, game, t, w, h) {
    ctx.save();
    for (const coin of game.collectibles || []) {
      if (coin.collected) continue;
      const pulse = 1 + Math.sin(t*5+coin.phase)*.12;
      ctx.translate(coin.x,coin.y);
      ctx.scale(pulse,pulse);
      ctx.shadowColor='#ffd166';ctx.shadowBlur=14;ctx.fillStyle='#ffd166';
      ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#7a5510';ctx.font='900 9px system-ui';ctx.textAlign='center';ctx.fillText('◉',0,3);
      ctx.setTransform(1,0,0,1,0,0);
    }
    for (const d of game.dust || []) {
      d.x += d.vx/60; d.y += d.vy/60; d.vy += 3; d.life -= 1/60;
      if(d.life>0){ctx.globalAlpha=Math.min(1,d.life*3);ctx.fillStyle='#e8eef2';ctx.beginPath();ctx.arc(d.x,d.y,3+d.life*4,0,Math.PI*2);ctx.fill();}
    }
    game.dust=(game.dust||[]).filter(d=>d.life>0);
    ctx.restore();
  }

  function drawCrashFx(ctx, game, t) {
    if (!game?.failed) return;
    const p = game.player;
    const age = Math.max(0, game.elapsed - game.failAt);
    ctx.save();
    for (const part of game.particles || []) {
      const a = Math.max(0, 1 - age / 1.05);
      ctx.globalAlpha = a;
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x + part.vx * age, part.y + part.vy * age + 120 * age * age, part.r * a, 0, Math.PI * 2);
      ctx.fill();
    }
    if (age < .58) {
      ctx.translate(p.x + 24, p.y - p.height * .62);
      ctx.rotate(-.12);
      ctx.font = `900 ${Math.max(18,p.height*.34)}px system-ui`;
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#07101f';
      ctx.fillStyle = game.crashWord === 'BONK!' ? '#ffd166' : '#ff7890';
      ctx.strokeText(game.crashWord || 'OOF!',0,0);
      ctx.fillText(game.crashWord || 'OOF!',0,0);
    }
    ctx.restore();
  }

  function drawRunner(ctx,p,t,crashed){
    let rendered=false;
    try { rendered=drawSpriteCharacter(ctx,p,t,crashed); } catch(err) {
      console.warn('Sprite renderer failed',err);
      rendered=false;
    }
    if(rendered) return;
    try {
      drawRunnerProcedural(ctx,p,t,crashed);
      return;
    } catch(err) {
      console.warn('Procedural renderer failed',err);
    }
    // Last-resort visibility marker: character can never become invisible.
    const H=Math.max(34,p.height||40), W=H*.34;
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.fillStyle='#f4c39b';
    ctx.strokeStyle='#101827';
    ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(0,-H*.34,W*.36,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#2f7fe4';ctx.lineWidth=Math.max(5,W*.4);
    ctx.beginPath();ctx.moveTo(0,-H*.18);ctx.lineTo(0,H*.10);ctx.stroke();
    ctx.strokeStyle='#101827';ctx.lineWidth=Math.max(4,W*.28);
    const phase=Math.sin(t*14);
    ctx.beginPath();ctx.moveTo(0,H*.08);ctx.lineTo(-W*.6+phase*W*.35,H*.42);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,H*.08);ctx.lineTo(W*.6-phase*W*.35,H*.42);ctx.stroke();
    ctx.restore();
  }

  function drawRunnerProcedural(ctx, p, t, crashed) {
    const H = p.height;
    const W = p.width;
    const run = Math.sin(t * 16);
    const run2 = Math.sin(t * 16 + Math.PI);
    const airborne = !p.grounded && !crashed;
    const bounce = p.grounded && !crashed ? Math.abs(Math.sin(t * 16)) * 1.7 : 0;
    const flail = crashed ? Math.sin(t * 27) : 0;
    const damage = state.game?.damage || 0;

    ctx.save();
    ctx.translate(p.x, p.y - bounce);
    ctx.rotate(p.rotation + (damage >= 2 && !crashed ? .09 + Math.sin(t*8)*.025 : damage === 1 && !crashed ? .035 : 0));
    ctx.scale(p.impactScaleX || 1, p.impactScaleY || 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (state.equipped === 'neon') {
      const g = ctx.createLinearGradient(-H*.65,0,0,0);
      g.addColorStop(0,'rgba(94,231,255,0)');
      g.addColorStop(1,'rgba(94,231,255,.9)');
      ctx.strokeStyle = g; ctx.lineWidth = Math.max(5,W*.22);
      ctx.beginPath(); ctx.moveTo(-H*.65,H*.02); ctx.lineTo(-W*.15,H*.02); ctx.stroke();
    }

    const skin = '#efbc91', outline = '#142034', shirt = '#2f7fe4', shorts = '#23344d', shoe = '#f6f8fb';
    const headY = -H*.36, headR = W*.35;
    const neckY = -H*.20, hipY = H*.05;

    // torso with actual human silhouette
    ctx.fillStyle = outline;
    roundedBody(ctx,-W*.28,neckY,W*.56,H*.30,Math.max(5,W*.16)); ctx.fill();
    ctx.fillStyle = shirt;
    roundedBody(ctx,-W*.22,neckY+2,W*.44,H*.26,Math.max(4,W*.12)); ctx.fill();

    // two-segment arms and legs
    const age = p.crashAge || 0;
    const seed = p.ragdollSeed || 0;
    const armFront = crashed ? 1.2 + Math.sin(age*19+seed)*1.15 : damage>=1 ? (-.35 + run*.28) : (airborne ? -1.0 : run*.95);
    const armBack  = crashed ? -1.0 + Math.sin(age*23+seed*1.7)*1.2 : (airborne ? .7 : run2*.95);
    const legFront = crashed ? .8 + Math.sin(age*17+seed*2.1)*1.35 : (airborne ? .55 : run*.82);
    const legBack  = crashed ? -.75 + Math.sin(age*21+seed*.7)*1.3 : damage>=2 ? (.10 + Math.sin(t*8)*.16) : (airborne ? -.65 : run2*.82);

    drawJointLimb(ctx, -W*.18, neckY+H*.045, H*.19, H*.18, armFront, armFront*.55, skin, outline, Math.max(4,W*.14), false);
    drawJointLimb(ctx,  W*.18, neckY+H*.045, H*.19, H*.18, armBack, armBack*.55, skin, outline, Math.max(4,W*.14), false);
    drawJointLimb(ctx, -W*.11, hipY, H*.23, H*.23, legFront, legFront*.46, shorts, outline, Math.max(5,W*.17), true, shoe);
    drawJointLimb(ctx,  W*.11, hipY, H*.23, H*.23, legBack, legBack*.46, shorts, outline, Math.max(5,W*.17), true, shoe);

    // neck
    ctx.strokeStyle=outline;ctx.lineWidth=Math.max(7,W*.25);ctx.beginPath();ctx.moveTo(0,neckY);ctx.lineTo(0,headY+headR*.7);ctx.stroke();
    ctx.strokeStyle=skin;ctx.lineWidth=Math.max(4,W*.13);ctx.beginPath();ctx.moveTo(0,neckY);ctx.lineTo(0,headY+headR*.7);ctx.stroke();

    // head, hair, face
    const headDX = crashed ? Math.sin(age*25+seed)*W*.12 : 0;
    const headDY = crashed ? Math.cos(age*19+seed)*H*.025 : 0;
    if (state.equipped === 'bighead' && state.faceImageSrc) {
      const face=ensureFaceImage(), bigR=headR*1.62;
      ctx.fillStyle=outline;ctx.beginPath();ctx.arc(headDX,headY+headDY,bigR+4,0,Math.PI*2);ctx.fill();
      if(face?.complete){
        ctx.save();ctx.beginPath();ctx.arc(headDX,headY+headDY,bigR,0,Math.PI*2);ctx.clip();
        ctx.drawImage(face,headDX-bigR,headY+headDY-bigR,bigR*2,bigR*2);ctx.restore();
      } else {
        ctx.fillStyle='#efbc91';ctx.beginPath();ctx.arc(headDX,headY+headDY,bigR,0,Math.PI*2);ctx.fill();
      }
    } else {
      ctx.fillStyle=outline;ctx.beginPath();ctx.arc(headDX,headY+headDY,headR+3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=skin;ctx.beginPath();ctx.arc(headDX,headY+headDY,headR,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#263044';ctx.beginPath();ctx.arc(-headR*.08,headY-headR*.2,headR*.88,Math.PI,Math.PI*1.92);ctx.lineTo(headR*.76,headY-headR*.1);ctx.closePath();ctx.fill();
      ctx.fillStyle='#152034';ctx.beginPath();ctx.arc(headR*.34,headY-headR*.03,Math.max(1.4,headR*.10),0,Math.PI*2);ctx.fill();
    }

    if (damage >= 1 && !crashed) {
      ctx.save();
      ctx.translate(-headR*.45,headY-headR*.05);
      ctx.rotate(-.5);
      ctx.fillStyle='#f7f1df';ctx.strokeStyle='#9b8d75';ctx.lineWidth=1;
      ctx.fillRect(-headR*.25,-2,headR*.5,4);ctx.strokeRect(-headR*.25,-2,headR*.5,4);
      ctx.restore();
      for(let i=0;i<2;i++){
        const a=t*4+i*Math.PI;
        ctx.fillStyle='#ffd166';ctx.beginPath();
        ctx.arc(Math.cos(a)*headR*1.25,headY-headR*.9+Math.sin(a)*headR*.3,2.2,0,Math.PI*2);ctx.fill();
      }
    }
    if (damage >= 2 && !crashed) {
      ctx.strokeStyle='#f7f1df';ctx.lineWidth=Math.max(3,W*.11);
      ctx.beginPath();ctx.moveTo(W*.10,hipY+H*.28);ctx.lineTo(W*.22,hipY+H*.34);ctx.stroke();
    }

    if (crashed) {
      ctx.strokeStyle='#152034';ctx.lineWidth=2;ctx.beginPath();ctx.arc(headR*.34,headY+headR*.28,headR*.18,0,Math.PI);ctx.stroke();
    }

    // cosmetics
    if (state.equipped === 'cap') {
      ctx.fillStyle='#ff526b'; ctx.beginPath(); ctx.ellipse(-2,headY-headR*.72,headR*.9,headR*.32,-.12,Math.PI,Math.PI*2); ctx.fill();
      ctx.fillRect(headR*.35,headY-headR*.68,headR*.65,3);
    } else if (state.equipped === 'shades') {
      ctx.strokeStyle='#111827';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-headR*.55,headY-headR*.05);ctx.lineTo(headR*.55,headY-headR*.05);ctx.stroke();
      ctx.fillStyle='#101826';ctx.fillRect(-headR*.55,headY-headR*.12,headR*.42,headR*.28);ctx.fillRect(headR*.12,headY-headR*.12,headR*.42,headR*.28);
    } else if (state.equipped === 'helmet') {
      ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(0,headY-headR*.15,headR*.98,Math.PI,Math.PI*2);ctx.fill();
      ctx.strokeStyle=outline;ctx.lineWidth=2;ctx.stroke();
    }

    ctx.restore();
  }

  function roundedBody(ctx,x,y,w,h,r) {
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }

  function drawJointLimb(ctx, x, y, upper, lower, baseAngle, bend, color, outline, width, leg=false, shoe='#fff') {
    const kx=x+Math.sin(baseAngle)*upper, ky=y+Math.cos(baseAngle)*upper;
    const second=baseAngle+bend;
    const ex=kx+Math.sin(second)*lower, ey=ky+Math.cos(second)*lower;
    ctx.strokeStyle=outline;ctx.lineWidth=width+4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(kx,ky);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(kx,ky);ctx.lineTo(ex,ey);ctx.stroke();
    if (leg) {
      ctx.strokeStyle=outline;ctx.lineWidth=width+5;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+Math.cos(second)*upper*.34,ey-Math.sin(second)*upper*.20);ctx.stroke();
      ctx.strokeStyle=shoe;ctx.lineWidth=width+1;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+Math.cos(second)*upper*.34,ey-Math.sin(second)*upper*.20);ctx.stroke();
    }
  }

  function drawShopPreview() {
    const canvas = els.shopRunnerCanvas;
    if (!canvas || !$('shopScreen').classList.contains('active')) return;
    const rect=canvas.getBoundingClientRect(), ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.max(1,rect.width*ratio);canvas.height=Math.max(1,rect.height*ratio);
    const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);
    const w=rect.width,h=rect.height;ctx.clearRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(0,h*.76,w,h*.24);
    drawRunner(ctx,{x:w*.48,y:h*.58,width:30,height:82,grounded:true,rotation:0},performance.now()/1000,false);
    state.previewFrame=requestAnimationFrame(drawShopPreview);
  }

  function finishRun(success) {
    const game = state.game;
    if (!game) return;
    const elapsed = Math.max(0, game.elapsed);
    const collected = game.collected || 0;
    const newPersonalRecord = recordPublicResult(success, elapsed);
    state.result = { success, elapsed, collected, newPersonalRecord };
    drawReplayFrame();
    stopReplayRecording();
    captureShareCard(success, elapsed, collected).catch(()=>{});
    if (success) { sfx('win'); addXp(20 + collected*5); recordMissionRun(); }
    else addXp(3);
    stopGame();
    $('resultEmoji').textContent = success ? '🏁' : '💥';
    $('resultEyebrow').textContent = success ? (game.hearts===1?'SOBREVIVISTE CON 1 VIDA':'NIVEL COMPLETADO') : 'CASI';
    $('resultTitle').textContent = newPersonalRecord ? '¡Nuevo récord personal!' : (success ? '¡Lo lograste!' : 'Ese golpe dolió.');
    $('resultTime').textContent = `${elapsed.toFixed(1)}s`;
    $('resultAttempts').textContent = String(state.attempts);
    $('resultSpeed').textContent = `${state.speed}×`;
    const reward = success ? 25 + collected * 5 : collected * 5;
    $('rewardLine').textContent = reward ? `+${reward} ◉ · ${collected}/3 orbes` : 'Sin recompensa · inténtalo otra vez';
    if (reward) awardCoins(reward);
    if (els.runCoins) els.runCoins.textContent = `+${reward}`;
    showScreen('resultScreen');
    updateShareVideoState();
  }

  async function captureShareCard(success, elapsed, collected) {
    const source=els.gameCanvas;
    if(!source) return;
    const out=document.createElement('canvas'); out.width=720; out.height=1280;
    const ctx=out.getContext('2d');
    const g=ctx.createLinearGradient(0,0,0,1280);g.addColorStop(0,'#132846');g.addColorStop(1,'#060b14');
    ctx.fillStyle=g;ctx.fillRect(0,0,720,1280);
    ctx.fillStyle='#5ee7ff';ctx.font='900 26px system-ui';ctx.fillText('PLAY YOUR WORLD',48,76);
    ctx.fillStyle='#fff';ctx.font='900 54px system-ui';ctx.fillText(success?'¿SUPERAS MI MUNDO?':'ESTE MUNDO ME DESTRUYÓ',48,150);
    const stageY=230, stageH=620;
    if (state.demoMode) {
      const temp=document.createElement('canvas');temp.width=640;temp.height=360;const tc=temp.getContext('2d');
      drawDemoWorld(tc,640,360,4);
      ctx.drawImage(temp,40,stageY,640,stageH);
    } else {
      try { ctx.drawImage(els.gameVideo,40,stageY,640,stageH); } catch(_){}
    }
    try { ctx.drawImage(source,40,stageY,640,stageH); } catch(_){}
    ctx.fillStyle='rgba(255,255,255,.08)';roundRect(ctx,48,900,624,185,28,'rgba(255,255,255,.08)');
    ctx.fillStyle='#fff';ctx.font='800 28px system-ui';ctx.fillText(`Tiempo  ${elapsed.toFixed(1)}s`,82,960);ctx.fillText(`Orbes  ${collected}/3`,82,1010);
    ctx.fillStyle='#ffd166';ctx.font='900 26px system-ui';ctx.fillText('Graba tu mundo. Conviértelo en juego.',82,1068);
    ctx.fillStyle='#a9b6ca';ctx.font='700 20px system-ui';ctx.fillText('playyourworld · alpha',48,1208);
    state.shareBlob=await new Promise(res=>out.toBlob(res,'image/png',.95));
  }

  async function shareRun() {
    const text='Convertí mi mundo en un videojuego 🏃‍♂️💥 ¿puedes superarlo?';
    try {
      if (state.replayBlob) {
        const ext = state.replayMime.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([state.replayBlob], `play-your-world.${ext}`, { type: state.replayBlob.type || state.replayMime || 'video/webm' });
        if (navigator.canShare?.({ files:[file] })) {
          await navigator.share({ title:'Play Your World', text, files:[file] });
          awardCoins(20,'Video compartido');
          return;
        }

        const url = URL.createObjectURL(state.replayBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `play-your-world.${ext}`;
        a.click();
        setTimeout(()=>URL.revokeObjectURL(url),1500);
        showHomeToast('Video guardado. Ya puedes subirlo a tu red favorita.');
        awardCoins(20,'Video generado');
        return;
      }

      if (state.shareBlob && navigator.canShare?.({files:[new File([state.shareBlob],'play-your-world.png',{type:'image/png'})]})) {
        await navigator.share({title:'Play Your World',text,files:[new File([state.shareBlob],'play-your-world.png',{type:'image/png'})]});
      } else if (navigator.share) {
        await navigator.share({title:'Play Your World',text,url:location.href});
      } else {
        await navigator.clipboard?.writeText(`${text} ${location.href}`);
        showHomeToast('Reto copiado al portapapeles.');
      }
      awardCoins(20,'Reto compartido');
    } catch (_) {}
  }

  function retry() {
    playLevel();
  }

  async function openSavedLevels() {
    els.savedLevelsPanel.hidden = false;
    const levels = await dbGetLevels();
    els.savedLevelsList.innerHTML = '';
    if (!levels.length) {
      els.savedLevelsList.innerHTML = '<div class="empty-state">Todavía no has guardado niveles.<br>Convierte algo de tu mundo en uno.</div>';
      return;
    }
    levels.sort((a, b) => b.createdAt - a.createdAt).forEach((level) => {
      const card = document.createElement('button');
      card.className = 'level-card';
      card.innerHTML = `<strong>${escapeHtml(level.name)}</strong><span>${new Date(level.createdAt).toLocaleString('es-MX')}</span>`;
      card.addEventListener('click', () => loadSavedLevel(level.id));
      els.savedLevelsList.appendChild(card);
    });
  }


  async function loadSavedLevel(id) {
    const level = await dbGetLevel(id);
    if (!level) return;
    stopCamera();
    if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
    state.levelId = level.id;
    state.levelName = level.name;
    state.surfaces = level.surfaces || [];
    state.hazards = level.hazards || [];
    state.start = level.start || null;
    state.finish = level.finish || null;
    state.portalIn = level.portalIn || null;
    state.portalOut = level.portalOut || null;
    state.springs = level.springs || [];
    state.boosts = level.boosts || [];
    state.videoFx = level.videoFx || defaultVideoFx();
    state.speed = level.speed || 1;
    state.remixSource = level.remixSource || null;
    state.syntheticEditorMode = !!level.synthetic;
    state.demoMode = !!level.synthetic;
    state.publicLevelId = null;
    state.returnAfterGame = level.synthetic ? 'editorScreen' : 'homeScreen';
    state.history = [];
    state.attempts = 0;
    els.speedSelect.value = String(state.speed);
    els.savedLevelsPanel.hidden = true;

    if (level.synthetic) {
      state.videoBlob = null;
      state.videoUrl = null;
      showScreen('editorScreen');
      els.editorVideo.pause();
      els.editorVideo.removeAttribute('src');
      els.editorVideo.load();
      els.editorVideo.style.display = 'none';
      els.editorVideoToggle.style.display = 'none';
      const timeline = document.querySelector('.timeline');
      if (timeline) timeline.style.display = 'none';
      fitCanvas(els.editorCanvas, els.editorStage);
      setTool('surface');
      drawEditor();
    } else {
      state.videoBlob = level.videoBlob;
      state.videoUrl = URL.createObjectURL(level.videoBlob);
      els.editorVideo.style.display = '';
      els.editorVideoToggle.style.display = '';
      const timeline = document.querySelector('.timeline');
      if (timeline) timeline.style.display = '';
      await openEditor();
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
  }

  const DB_NAME = 'play-your-world-db';
  const STORE = 'levels';
  let dbPromise;
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  async function dbPutLevel(level) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(level);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function dbGetLevels() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbGetLevel(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  $('toolRailToggle')?.addEventListener('click',()=>{ els.editorRail?.classList.toggle('collapsed'); });
  $('quickZoomBtn')?.addEventListener('click',()=>{
    els.advancedPanel.hidden=false;
    document.querySelectorAll('.advanced-tab').forEach(b=>b.classList.toggle('active',b.dataset.advancedTab==='video'));
    $('advancedMechanics').classList.remove('active');
    $('advancedVideo').classList.add('active');
  });
  $('zoomOutBtn')?.addEventListener('click',()=>{
    state.videoFx.zoom=Math.max(.75,Math.round((state.videoFx.zoom-.1)*100)/100);syncVideoFxControls();
  });
  $('zoomFitBtn')?.addEventListener('click',()=>{state.videoFx.zoom=1;state.videoFx.panX=0;state.videoFx.panY=0;syncVideoFxControls();});
  $('zoomInBtn')?.addEventListener('click',()=>{
    state.videoFx.zoom=Math.min(2.5,Math.round((state.videoFx.zoom+.1)*100)/100);syncVideoFxControls();
  });
  els.advancedBtn?.addEventListener('click', () => { els.advancedPanel.hidden = !els.advancedPanel.hidden; });
  els.advancedCloseBtn?.addEventListener('click', () => { els.advancedPanel.hidden = true; });
  document.querySelectorAll('.advanced-tab').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.advanced-tab').forEach(b=>b.classList.toggle('active',b===btn));
    $('advancedMechanics').classList.toggle('active',btn.dataset.advancedTab==='mechanics');
    $('advancedVideo').classList.toggle('active',btn.dataset.advancedTab==='video');
  }));
  document.querySelectorAll('.advanced-tool[data-tool]').forEach(btn=>btn.addEventListener('click',()=>{
    setTool(btn.dataset.tool); els.advancedPanel.hidden=true;
  }));

  const readVideoFx=()=>{
    state.videoFx={
      zoom:Number(els.videoZoom.value), panX:Number(els.videoPanX.value), panY:Number(els.videoPanY.value),
      brightness:Number(els.videoBrightness.value), contrast:Number(els.videoContrast.value), saturation:Number(els.videoSaturation.value)
    };
    if(els.zoomValue) els.zoomValue.textContent=`${state.videoFx.zoom.toFixed(2)}×`;
    applyEditorVideoFx();
  };
  [els.videoZoom,els.videoPanX,els.videoPanY,els.videoBrightness,els.videoContrast,els.videoSaturation].forEach(el=>el?.addEventListener('input',readVideoFx));
  document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>setVideoPreset(b.dataset.preset)));
  $('resetVideoFx')?.addEventListener('click',()=>{state.videoFx=defaultVideoFx();syncVideoFxControls();});

  els.bigHeadBtn?.addEventListener('click',()=>els.facePhotoInput?.click());
  els.facePhotoInput?.addEventListener('change',()=>processFacePhoto(els.facePhotoInput.files?.[0]).catch(()=>showHomeToast('No pude procesar esa foto.')));


  $('exploreBtn')?.addEventListener('click', function(){ showScreen('exploreScreen'); });
  $('exploreBackBtn')?.addEventListener('click', function(){ els.levelDetailPanel.hidden = true; showScreen('homeScreen'); });
  $('closeLevelDetail')?.addEventListener('click', function(){ els.levelDetailPanel.hidden = true; });
  document.querySelectorAll('.explore-tab').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.explore-tab').forEach(function(b){ b.classList.toggle('active', b === btn); });
      renderPublicFeed(btn.dataset.feed);
    });
  });
  $('levelCodeBtn')?.addEventListener('click', function(){
    const level = getPublicLevel(els.levelCodeInput.value);
    if (level) openLevelDetail(level.id);
    else { els.levelCodeInput.value=''; els.levelCodeInput.placeholder='Código no encontrado'; }
  });
  els.levelCodeInput?.addEventListener('keydown', function(e){ if (e.key === 'Enter') $('levelCodeBtn').click(); });
  $('playPublicLevelBtn')?.addEventListener('click', function(){ playPublicLevel(state.selectedPublicLevelId); });
  $('remixPublicLevelBtn')?.addEventListener('click', function(){
    const level = getPublicLevel(state.selectedPublicLevelId);
    if (level) { els.levelDetailPanel.hidden = true; openSyntheticEditor(level); }
  });
  $('sharePublicLevelBtn')?.addEventListener('click', function(){ sharePublicLevel(state.selectedPublicLevelId); });

  $('characterBtn')?.addEventListener('click',()=>{els.characterPanel.hidden=false;});
  $('closeCharacterBtn')?.addEventListener('click',()=>{els.characterPanel.hidden=true;});
  document.querySelectorAll('.character-card[data-character]').forEach(card=>card.addEventListener('click',()=>{
    selectCharacter(card.dataset.character); els.characterPanel.hidden=true; showHomeToast(CHARACTER_CONFIG[card.dataset.character].name+' equipado');
  }));

  $('shopBtn').addEventListener('click', () => showScreen('shopScreen'));
  $('shopBackBtn').addEventListener('click', () => { if(state.previewFrame) cancelAnimationFrame(state.previewFrame); showScreen('homeScreen'); });
  document.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => buyOrEquip(b.dataset.buy)));
  $('dailyBtn').addEventListener('click', () => {
    const key = new Date().toISOString().slice(0,10);
    if (localStorage.getItem('pyw.daily') === key) { showHomeToast('Ya recogiste el regalo de hoy.'); return; }
    localStorage.setItem('pyw.daily', key); awardCoins(100,'Regalo diario');
  });
  $('demoBtn').addEventListener('click', launchDemo);
  $('createLevelBtn').addEventListener('click', openCapture);
  $('openLevelsBtn').addEventListener('click', openSavedLevels);
  $('closeLevelsBtn').addEventListener('click', () => { els.savedLevelsPanel.hidden = true; });
  document.querySelectorAll('.back-home').forEach((b) => b.addEventListener('click', () => { stopCamera(); showScreen('homeScreen'); }));

  els.recordBtn.addEventListener('click', () => {
    if (state.recorder?.state === 'recording') stopRecording(); else startRecording();
  });
  els.useRecordingBtn.addEventListener('click', openEditor);
  els.retakeBtn.addEventListener('click', openCapture);
  els.nativeCaptureInput?.addEventListener('change', () => {
    const file = els.nativeCaptureInput.files?.[0];
    if (file) setVideoBlob(file);
  });
  els.videoFileInput.addEventListener('change', () => {
    const file = els.videoFileInput.files?.[0];
    if (file) setVideoBlob(file);
  });

  $('editorBackBtn').addEventListener('click', () => { showScreen('homeScreen'); });
  els.videoScrubber.addEventListener('input', () => {
    const d = Number.isFinite(els.editorVideo.duration) ? els.editorVideo.duration : 0;
    els.editorVideo.pause();
    els.editorVideoToggle.textContent = '▶ Video';
    els.editorVideo.currentTime = d * (Number(els.videoScrubber.value) / 1000);
    els.timelineCurrent.textContent = `${els.editorVideo.currentTime.toFixed(1)}s`;
    updateFrameLayerBadge();
    drawEditor();
  });
  els.editorVideo.addEventListener('timeupdate', () => {
    const d = Number.isFinite(els.editorVideo.duration) ? els.editorVideo.duration : 0;
    if (d > 0) els.videoScrubber.value = String(Math.round((els.editorVideo.currentTime / d) * 1000));
    els.timelineCurrent.textContent = `${els.editorVideo.currentTime.toFixed(1)}s`;
    updateFrameLayerBadge();
    drawEditor();
  });
  els.editorVideoToggle.addEventListener('click', async () => {
    if (els.editorVideo.paused) {
      try { await els.editorVideo.play(); els.editorVideoToggle.textContent = '❚❚ Video'; } catch (_) {}
    } else {
      els.editorVideo.pause(); els.editorVideoToggle.textContent = '▶ Video';
    }
  });
  document.querySelectorAll('.tool[data-tool]').forEach((button) => button.addEventListener('click', () => setTool(button.dataset.tool)));
  $('undoBtn').addEventListener('click', restoreHistory);
  els.speedSelect.addEventListener('change', () => { state.speed = parseFloat(els.speedSelect.value) || 1; });
  $('saveLevelBtn').addEventListener('click', saveCurrentLevel);
  $('playBtn').addEventListener('click', playLevel);

  els.editorCanvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    els.editorCanvas.setPointerCapture?.(event.pointerId);
    const p = pointFromEvent(event, els.editorCanvas);
    if (state.tool === 'erase') { eraseAt(p); return; }
    if (['start','finish','portalIn','portalOut'].includes(state.tool)) {
      pushHistory();
      state[state.tool] = p;
      drawEditor();
      return;
    }
    if (state.tool === 'spring' || state.tool === 'boost') {
      pushHistory();
      (state.tool === 'spring' ? state.springs : state.boosts).push(p);
      drawEditor();
      return;
    }
    if (!state.syntheticEditorMode) {
      els.editorVideo.pause();
      els.editorVideoToggle.textContent = '▶ Video';
      state.drawTime = quantizeFrameTime(currentEditorTime());
    } else {
      state.drawTime = 0;
    }
    state.drawing = true;
    state.currentPath = [p];
  });

  els.editorCanvas.addEventListener('pointermove', (event) => {
    if (!state.drawing) return;
    const p = pointFromEvent(event, els.editorCanvas);
    const last = state.currentPath[state.currentPath.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 0.002) state.currentPath.push(p);
    drawEditor();
  });

  const endDraw = () => {
    if (!state.drawing) return;
    state.drawing = false;
    if (state.currentPath.length >= 2) {
      pushHistory();
      const path = simplifyPath(state.currentPath);
      const entry = { points: path, time: Number.isFinite(state.drawTime) ? state.drawTime : quantizeFrameTime(currentEditorTime()), keyframe:true };
      if (state.tool === 'surface') state.surfaces.push(entry);
      if (state.tool === 'hazard') state.hazards.push(entry);
    }
    state.currentPath = [];
    drawEditor();
  };

  els.editorCanvas.addEventListener('pointerup', endDraw);
  els.editorCanvas.addEventListener('pointercancel', endDraw);
  els.gameCanvas.addEventListener('pointerdown', (event) => { event.preventDefault(); jump(); });
  $('exitGameBtn').addEventListener('click', () => { stopReplayRecording(); stopGame(); showScreen(state.returnAfterGame || (state.demoMode ? 'homeScreen' : 'editorScreen')); });
  $('retryBtn').addEventListener('click', () => { stopReplayRecording(); state.demoMode ? playDemo() : retry(); });
  $('shareRunBtn').addEventListener('click', shareRun);
  $('editAgainBtn').addEventListener('click', async () => {
    if (state.syntheticEditorMode) { showScreen('editorScreen'); fitCanvas(els.editorCanvas, els.editorStage); drawEditor(); return; }
    if (state.publicLevelId) { showScreen('exploreScreen'); openLevelDetail(state.publicLevelId); return; }
    if (state.demoMode) { showScreen('homeScreen'); return; }
    showScreen('editorScreen'); fitCanvas(els.editorCanvas, els.editorStage); drawEditor();
  });
  $('newLevelBtn').addEventListener('click', () => { stopReplayRecording(); openCapture(); });

  window.addEventListener('resize', () => {
    updateOrientationHint();
    if ($('editorScreen').classList.contains('active')) { fitCanvas(els.editorCanvas, els.editorStage); drawEditor(); }
    if ($('gameScreen').classList.contains('active')) fitCanvas(els.gameCanvas, els.gameStage);
  });

  window.addEventListener('orientationchange', () => setTimeout(() => window.dispatchEvent(new Event('resize')), 250));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.recorder?.state === 'recording') stopRecording();
  });

  initCharacterSprite();
  updateCharacterUI();
  if (state.faceImageSrc && els.bigHeadThumb) {
    els.bigHeadThumb.textContent='';
    els.bigHeadThumb.style.backgroundImage=`url("${state.faceImageSrc}")`;
    els.bigHeadThumb.style.backgroundSize='cover';
    els.bigHeadThumb.style.backgroundPosition='center';
    els.bigHeadThumb.style.width='54px';els.bigHeadThumb.style.height='54px';els.bigHeadThumb.style.borderRadius='50%';els.bigHeadThumb.style.display='block';
    ensureFaceImage();
  }
  refreshEconomyUI();
  refreshProgressionUI();
  updateShareVideoState();
  updateOrientationHint();
  const deepLevel = new URLSearchParams(location.search).get('level');
  if (deepLevel) {
    const level = getPublicLevel(deepLevel);
    if (level) { showScreen('exploreScreen'); openLevelDetail(level.id); }
  }
})();