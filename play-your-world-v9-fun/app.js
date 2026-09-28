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
    ctx.save();
    ctx.filter = `brightness(${fx.brightness}%) contrast(${fx.contrast}%) saturate(${fx.saturation}%)`;
    const dw=w*fx.zoom, dh=h*fx.zoom;
    const dx=(w-dw)/2 + (fx.panX/100)*w;
    const dy=(h-dh)/2 + (fx.panY/100)*h;
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


  function pathPoints(entry) { return Array.isArray(entry) ? entry : (entry?.points || []); }
  function pathTime(entry) { return Array.isArray(entry) ? 0 : Number(entry?.time || 0); }
  function currentEditorTime() { return Number.isFinite(els.editorVideo.currentTime) ? els.editorVideo.currentTime : 0; }

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
    syncVideoFxControls();
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
      entries.forEach((entry) => {
        const points = pathPoints(entry);
        const age = Math.abs(pathTime(entry) - now);
        ctx.save();
        ctx.globalAlpha = age <= 0.8 ? 1 : age <= 2 ? 0.35 : 0.12;
        drawPath(ctx, points, color, width, w, h, dashed);
        ctx.restore();
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

    const surfaces = pixelPaths(state.surfaces, w, h);
    const hazards = pixelPaths(state.hazards, w, h);
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

  function drawRunner(ctx, p, t, crashed) {
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
    drawEditor();
  });
  els.editorVideo.addEventListener('timeupdate', () => {
    const d = Number.isFinite(els.editorVideo.duration) ? els.editorVideo.duration : 0;
    if (d > 0) els.videoScrubber.value = String(Math.round((els.editorVideo.currentTime / d) * 1000));
    els.timelineCurrent.textContent = `${els.editorVideo.currentTime.toFixed(1)}s`;
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
      const entry = { points: path, time: currentEditorTime() };
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