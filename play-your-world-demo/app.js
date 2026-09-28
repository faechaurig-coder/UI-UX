(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const screens = ['homeScreen', 'captureScreen', 'editorScreen', 'gameScreen', 'resultScreen'];

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
    history: [],
    tool: 'surface',
    drawing: false,
    currentPath: [],
    speed: 1,
    attempts: 0,
    game: null,
    gameFrame: null,
    result: null,
  };

  const els = {
    rotateHint: $('rotateHint'),
    cameraPreview: $('cameraPreview'),
    cameraFallback: $('cameraFallback'),
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
  };

  const COLORS = {
    surface: '#5ee7ff',
    hazard: '#ff667a',
    start: '#77f2a1',
    finish: '#ffd166',
  };

  function showScreen(id) {
    screens.forEach((name) => $(name).classList.toggle('active', name === id));
    updateOrientationHint();
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
    playDemo();
  }

  async function playDemo() {
    state.attempts += 1;
    showScreen('gameScreen');
    els.attemptLabel.textContent = String(state.attempts);
    els.gameTimeLabel.textContent = '0.0';
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

  async function openCapture() {
    stopGame();
    stopCamera();
    resetWorkingVideo();
    showScreen('captureScreen');
    els.cameraFallback.hidden = true;
    els.useRecordingBtn.disabled = true;
    els.captureTimer.textContent = '00:00';

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
      await els.cameraPreview.play();
    } catch (error) {
      console.warn('Camera unavailable', error);
      els.cameraFallback.hidden = false;
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
    state.history = [];
    state.attempts = 0;
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
      els.videoFileInput.click();
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

  function setVideoBlob(blob) {
    if (!blob || !blob.size) return;
    if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
    state.videoBlob = blob;
    state.videoUrl = URL.createObjectURL(blob);
    els.cameraPreview.srcObject = null;
    els.cameraPreview.src = state.videoUrl;
    els.cameraPreview.loop = true;
    els.cameraPreview.muted = true;
    els.cameraPreview.play().catch(() => {});
    els.useRecordingBtn.disabled = false;
  }

  async function openEditor() {
    if (!state.videoBlob || !state.videoUrl) return;
    stopCamera();
    showScreen('editorScreen');
    els.editorVideo.src = state.videoUrl;
    els.editorVideo.currentTime = 0;
    els.editorVideo.pause();
    await waitForMetadata(els.editorVideo);
    fitCanvas(els.editorCanvas, els.editorStage);
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
    document.querySelectorAll('.tool[data-tool]').forEach((button) => {
      button.classList.toggle('active', button.dataset.tool === tool);
    });
    const copy = {
      surface: 'Dibuja por dónde puede correr.',
      hazard: 'Marca lo que debe evitar.',
      start: 'Toca una superficie para colocar el inicio.',
      finish: 'Toca dónde termina el nivel.',
      erase: 'Toca una línea o marcador para borrarlo.',
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
      const d = nearestDistanceToPath(p, path);
      if (d < targetDist) { target = ['surface', i]; targetDist = d; }
    });
    state.hazards.forEach((path, i) => {
      const d = nearestDistanceToPath(p, path);
      if (d < targetDist) { target = ['hazard', i]; targetDist = d; }
    });
    if (state.start && Math.hypot(p.x - state.start.x, p.y - state.start.y) < targetDist) target = ['start'];
    if (state.finish && Math.hypot(p.x - state.finish.x, p.y - state.finish.y) < targetDist) target = ['finish'];

    if (!target) { state.history.pop(); return; }
    if (target[0] === 'surface') state.surfaces.splice(target[1], 1);
    if (target[0] === 'hazard') state.hazards.splice(target[1], 1);
    if (target[0] === 'start') state.start = null;
    if (target[0] === 'finish') state.finish = null;
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
    state.surfaces.forEach((p) => drawPath(ctx, p, COLORS.surface, 5, w, h));
    state.hazards.forEach((p) => drawPath(ctx, p, COLORS.hazard, 7, w, h, true));
    if (state.currentPath.length > 1) {
      drawPath(ctx, state.currentPath, state.tool === 'hazard' ? COLORS.hazard : COLORS.surface, state.tool === 'hazard' ? 7 : 5, w, h, state.tool === 'hazard');
    }
    drawMarker(ctx, state.start, 'start', w, h);
    drawMarker(ctx, state.finish, 'finish', w, h);
  }

  function validateLevel() {
    const missing = [];
    if (!state.videoBlob) missing.push('video');
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
      surfaces: state.surfaces,
      hazards: state.hazards,
      start: state.start,
      finish: state.finish,
      speed: state.speed,
    };
  }

  async function saveCurrentLevel() {
    if (!validateLevel()) return;
    const data = normalizeLevelForSave();
    data.videoBlob = state.videoBlob;
    await dbPutLevel(data);
    state.levelId = data.id;
    state.levelName = data.name;
    toast('Nivel guardado en este dispositivo.');
  }

  async function playLevel() {
    if (!validateLevel()) return;
    state.speed = parseFloat(els.speedSelect.value) || 1;
    state.attempts += 1;
    showScreen('gameScreen');
    els.attemptLabel.textContent = String(state.attempts);
    els.gameTimeLabel.textContent = '0.0';
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
      },
    };

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
    return paths.map((path) => path.map((p) => ({ x: p.x * w, y: p.y * h })));
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

    if (game.failed) {
      player.x += player.crashVX * dt;
      player.y += player.crashVY * dt;
      player.crashVY += game.gravity * 0.8 * dt;
      player.rotation += player.crashSpin * dt;
      if (game.elapsed - game.failAt > 0.95) finishRun(false);
      return;
    }
    if (!game.running) return;

    const surfaces = pixelPaths(state.surfaces, w, h);
    const hazards = pixelPaths(state.hazards, w, h);
    const previousFootY = player.y + player.height * 0.48;

    player.x += game.speed * dt;
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
      }
    }

    const bodyPoint = { x: player.x, y: player.y };
    const feetPoint = { x: player.x, y: player.y + player.height * 0.25 };
    if (collidesWithPaths(bodyPoint, hazards, player.width * 0.7) || collidesWithPaths(feetPoint, hazards, player.width * 0.55)) {
      crash('hazard');
      return;
    }

    const finish = { x: state.finish.x * w, y: state.finish.y * h };
    if (Math.hypot(player.x - finish.x, player.y - finish.y) < Math.max(30, player.height * 0.8) || player.x >= finish.x + player.width * 0.3) {
      finishRun(true);
      return;
    }

    if (player.y > h + player.height * 0.7 || player.x > w + player.width) crash('fall');
  }

  function jump() {
    const game = state.game;
    if (!game || !game.running || game.failed) return;
    const p = game.player;
    if (p.grounded) {
      p.grounded = false;
      p.vy = game.jumpVelocity;
      els.tapHint.style.opacity = '0';
      if (navigator.vibrate) navigator.vibrate(10);
    }
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
    p.crashSpin = kind === 'hazard' ? 8.5 : 5.5;
    if (navigator.vibrate) navigator.vibrate([45, 25, 70]);
  }

  function drawGame(t) {
    const canvas = els.gameCanvas;
    const { w, h } = cssSize(canvas);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (!state.game) return;
    const p = state.game.player;
    drawMarker(ctx, state.finish, 'finish', w, h);
    drawRunner(ctx, p, t, state.game.failed);
  }

  function drawRunner(ctx, p, t, crashed) {
    const H = p.height;
    const W = p.width;
    const run = Math.sin(t * 15);
    const bounce = p.grounded && !crashed ? Math.abs(Math.sin(t * 15)) * 2 : 0;

    ctx.save();
    ctx.translate(p.x, p.y - bounce);
    ctx.rotate(p.rotation);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;

    const headR = W * 0.34;
    const shoulderY = -H * 0.23;
    const hipY = H * 0.06;
    const limb = H * 0.34;
    const arm = H * 0.29;
    const white = '#f8fafc';
    const outline = '#07101f';

    ctx.strokeStyle = outline; ctx.lineWidth = Math.max(7, W * .34);
    ctx.beginPath(); ctx.moveTo(0, shoulderY); ctx.lineTo(0, hipY); ctx.stroke();
    ctx.strokeStyle = white; ctx.lineWidth = Math.max(4, W * .18);
    ctx.beginPath(); ctx.moveTo(0, shoulderY); ctx.lineTo(0, hipY); ctx.stroke();

    const legA = crashed ? 1.2 : run * .78;
    const legB = crashed ? -1.0 : -run * .78;
    drawLimb(ctx, 0, hipY, limb, legA, white, outline, Math.max(4, W * .16));
    drawLimb(ctx, 0, hipY, limb, legB, white, outline, Math.max(4, W * .16));

    const armA = crashed ? -1.4 : -run * .9;
    const armB = crashed ? 1.1 : run * .9;
    drawLimb(ctx, 0, shoulderY + 2, arm, armA, '#dff9ff', outline, Math.max(3, W * .13));
    drawLimb(ctx, 0, shoulderY + 2, arm, armB, '#dff9ff', outline, Math.max(3, W * .13));

    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.arc(0, -H * .39, headR + 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fefefe';
    ctx.beginPath(); ctx.arc(0, -H * .39, headR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b1320';
    ctx.beginPath(); ctx.arc(headR * .28, -H * .40, Math.max(1.5, headR * .13), 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#5ee7ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -H * .39, headR + 1, -1.8, .4); ctx.stroke();

    ctx.restore();
  }

  function drawLimb(ctx, x, y, len, angle, color, outline, width) {
    const endX = x + Math.sin(angle) * len;
    const endY = y + Math.cos(angle) * len;
    ctx.strokeStyle = outline; ctx.lineWidth = width + 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
  }

  function finishRun(success) {
    const game = state.game;
    if (!game) return;
    const elapsed = Math.max(0, game.elapsed);
    state.result = { success, elapsed };
    stopGame();
    $('resultEmoji').textContent = success ? '🏁' : '💥';
    $('resultEyebrow').textContent = success ? 'NIVEL COMPLETADO' : 'CASI';
    $('resultTitle').textContent = success ? '¡Lo lograste!' : 'Ese golpe dolió.';
    $('resultTime').textContent = `${elapsed.toFixed(1)}s`;
    $('resultAttempts').textContent = String(state.attempts);
    $('resultSpeed').textContent = `${state.speed}×`;
    showScreen('resultScreen');
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
    state.videoBlob = level.videoBlob;
    state.videoUrl = URL.createObjectURL(level.videoBlob);
    state.levelId = level.id;
    state.levelName = level.name;
    state.surfaces = level.surfaces || [];
    state.hazards = level.hazards || [];
    state.start = level.start || null;
    state.finish = level.finish || null;
    state.speed = level.speed || 1;
    state.history = [];
    state.attempts = 0;
    els.speedSelect.value = String(state.speed);
    els.savedLevelsPanel.hidden = true;
    await openEditor();
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

  $('demoBtn').addEventListener('click', launchDemo);\n  $('createLevelBtn').addEventListener('click', openCapture);
  $('openLevelsBtn').addEventListener('click', openSavedLevels);
  $('closeLevelsBtn').addEventListener('click', () => { els.savedLevelsPanel.hidden = true; });
  document.querySelectorAll('.back-home').forEach((b) => b.addEventListener('click', () => { stopCamera(); showScreen('homeScreen'); }));

  els.recordBtn.addEventListener('click', () => {
    if (state.recorder?.state === 'recording') stopRecording(); else startRecording();
  });
  els.useRecordingBtn.addEventListener('click', openEditor);
  els.videoFileInput.addEventListener('change', () => {
    const file = els.videoFileInput.files?.[0];
    if (file) setVideoBlob(file);
  });

  $('editorBackBtn').addEventListener('click', () => { showScreen('homeScreen'); });
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
    if (state.tool === 'start' || state.tool === 'finish') {
      pushHistory();
      state[state.tool] = p;
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
      if (state.tool === 'surface') state.surfaces.push(path);
      if (state.tool === 'hazard') state.hazards.push(path);
    }
    state.currentPath = [];
    drawEditor();
  };

  els.editorCanvas.addEventListener('pointerup', endDraw);
  els.editorCanvas.addEventListener('pointercancel', endDraw);
  els.gameCanvas.addEventListener('pointerdown', (event) => { event.preventDefault(); jump(); });
  $('exitGameBtn').addEventListener('click', () => { stopGame(); showScreen('editorScreen'); });
  $('retryBtn').addEventListener('click', () => state.demoMode ? playDemo() : retry());
  $('editAgainBtn').addEventListener('click', async () => { if (state.demoMode) { showScreen('homeScreen'); return; } showScreen('editorScreen'); fitCanvas(els.editorCanvas, els.editorStage); drawEditor(); });
  $('newLevelBtn').addEventListener('click', openCapture);

  window.addEventListener('resize', () => {
    updateOrientationHint();
    if ($('editorScreen').classList.contains('active')) { fitCanvas(els.editorCanvas, els.editorStage); drawEditor(); }
    if ($('gameScreen').classList.contains('active')) fitCanvas(els.gameCanvas, els.gameStage);
  });

  window.addEventListener('orientationchange', () => setTimeout(() => window.dispatchEvent(new Event('resize')), 250));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.recorder?.state === 'recording') stopRecording();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
  }

  updateOrientationHint();
})();