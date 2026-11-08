/* Intro loader: a wireframe 3x3 cube that forms, twists, breaks apart in a beam of light and rebuilds.
   Self-contained: injects its own overlay, plays once, then fades into the page. */
(function () {
  var d = document, root = d.documentElement;
  /* honour a theme the visitor picked earlier with the site's toggle, so the intro matches the page */
  try { var saved = localStorage.getItem('theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MIN = reduce ? 700 : 3900, MAX = 8000;

  var css = '' +
    'html.is-loading{overflow:hidden}' +
    'html.is-loading .hero *{animation-play-state:paused!important}' +
    '#intro{position:fixed;inset:0;z-index:9999;background:var(--bg,#0a0a0b);color:var(--fg,#f4f4f5);' +
    'font-family:var(--body,system-ui,sans-serif);clip-path:inset(0 0 0 0);transition:clip-path 1s cubic-bezier(.76,0,.24,1)}' +
    '#intro.out{clip-path:inset(0 0 100% 0);pointer-events:none}' +
    '#intro canvas,#intro .i-top,#intro .i-bot,#intro .i-bar{transition:opacity .45s,transform 1s cubic-bezier(.76,0,.24,1)}' +
    '#intro.out canvas{transform:translateY(-12vh) scale(.92);opacity:.25}' +
    '#intro.out .i-top,#intro.out .i-bot,#intro.out .i-bar{opacity:0}' +
    /* page reveal after the intro: soft rise + un-blur, staggered */
    '@keyframes iRise{from{opacity:0;translate:0 34px;filter:blur(8px)}to{opacity:1;translate:0 0;filter:none}}' +
    '@keyframes iDrop{from{opacity:0;translate:0 -22px}to{opacity:1;translate:0 0}}' +
    'html.is-revealing .nav{animation:iDrop .9s cubic-bezier(.22,1,.36,1) .35s both}' +
    'html.is-revealing .hero-left{animation:iRise 1.1s cubic-bezier(.22,1,.36,1) .3s both}' +
    'html.is-revealing .portrait{animation:iRise 1.2s cubic-bezier(.22,1,.36,1) .42s both}' +
    'html.is-revealing .hero-right{animation:iRise 1.1s cubic-bezier(.22,1,.36,1) .54s both}' +
    'html.is-revealing .strip{animation:iRise 1s cubic-bezier(.22,1,.36,1) .7s both}' +
    'html.is-revealing .fab{animation:iRise .8s cubic-bezier(.22,1,.36,1) .9s both}' +
    '#intro canvas{position:absolute;inset:0;width:100%;height:100%}' +
    '#intro .i-top,#intro .i-bot{position:absolute;left:0;right:0;display:flex;justify-content:space-between;align-items:center;' +
    'padding:calc(20px + env(safe-area-inset-top,0px)) max(20px,env(safe-area-inset-right,0px)) 0 max(20px,env(safe-area-inset-left,0px));' +
    'font-family:var(--mono,ui-monospace,monospace);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-3,#6b6b73)}' +
    '#intro .i-top{top:0}' +
    '#intro .i-bot{bottom:0;padding-top:0;padding-bottom:calc(22px + env(safe-area-inset-bottom,0px))}' +
    '#intro .i-name{color:var(--fg-2,#a6a6ad)}' +
    '#intro .i-count{font-variant-numeric:tabular-nums;color:var(--fg,#f4f4f5)}' +
    '#intro .i-skip{font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;background:none;' +
    'border:1px solid var(--line-2,rgba(255,255,255,.16));border-radius:999px;padding:7px 13px;cursor:pointer}' +
    '#intro .i-skip:hover{color:var(--fg,#fff);border-color:var(--fg-3,#6b6b73)}' +
    '#intro .i-bar{position:absolute;left:0;bottom:0;height:2px;background:var(--fg,#fff);opacity:.5;width:0}';

  var st = d.createElement('style'); st.textContent = css; (d.head || root).appendChild(st);
  root.classList.add('is-loading');

  var el = d.createElement('div'); el.id = 'intro'; el.setAttribute('role', 'status'); el.setAttribute('aria-label', 'Loading');
  el.innerHTML = '<canvas aria-hidden="true"></canvas>' +
    '<div class="i-top"><span class="i-name">Tahmid Sikder Rifat</span><span>Portfolio · 2026</span></div>' +
    '<div class="i-bot"><span>Loading <span class="i-count">000</span></span><button class="i-skip" type="button">Skip</button></div>' +
    '<div class="i-bar"></div>';
  (d.body || root).appendChild(el);

  var cv = el.querySelector('canvas'), ctx = cv.getContext('2d');
  var count = el.querySelector('.i-count'), bar = el.querySelector('.i-bar');
  var W, H, DPR;
  function size() { DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  size(); addEventListener('resize', size);

  /* pick a palette that reads on the current theme */
  function isLight() {
    var m = getComputedStyle(el || d.body || root).backgroundColor.match(/\d+(\.\d+)?/g);
    if (!m) return !matchMedia('(prefers-color-scheme: dark)').matches;
    return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 > .5;
  }
  /* re-checked while the intro plays, so it always matches the page even if the theme
     is applied a moment after load (saved choice, browser or app setting) */
  var LIGHT, INK, BEAM, DUST, GLOW, DUSTA, LINEA, FLOOR, LW;
  function palette() {
    LIGHT = isLight();
    INK = LIGHT ? '17,17,19' : '255,255,255';            /* cube lines + lit square */
    BEAM = LIGHT ? '47,95,153' : '255,255,255';          /* glow behind the broken cube */
    DUST = LIGHT ? '30,52,84' : '255,255,255';           /* light streaks */
    GLOW = LIGHT ? .16 : .22; DUSTA = LIGHT ? .75 : .9; LINEA = LIGHT ? 1 : .9; FLOOR = LIGHT ? .32 : .18; LW = LIGHT ? 1.3 : 1.1;
  }
  palette();
  var tick = 0;

  /* 27 cubies of a 3x3x3 cube, plus a random scatter direction for the "break" phase */
  var cubies = [];
  for (var x = -1; x <= 1; x++) for (var y = -1; y <= 1; y++) for (var z = -1; z <= 1; z++) {
    var len = Math.hypot(x, y, z) || 1;
    cubies.push({ p: [x, y, z], dir: [x / len + (Math.random() - .5) * .9, y / len + (Math.random() - .5) * .9, z / len + (Math.random() - .5) * .9],
      dist: 3 + Math.random() * 5, spin: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3] });
  }
  var V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  var E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  var dust = Array.from({ length: 140 }, function () { return { a: Math.random() * 6.283, r: Math.random(), s: Math.random() * 1.6 + .4, v: Math.random() * .6 + .4 }; });

  function rot(v, rx, ry, rz) {
    var x = v[0], y = v[1], z = v[2], c, s, t;
    c = Math.cos(rx); s = Math.sin(rx); t = y * c - z * s; z = y * s + z * c; y = t;
    c = Math.cos(ry); s = Math.sin(ry); t = x * c + z * s; z = -x * s + z * c; x = t;
    c = Math.cos(rz); s = Math.sin(rz); t = x * c - y * s; y = x * s + y * c; x = t;
    return [x, y, z];
  }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  var t0 = performance.now(), loaded = d.readyState === 'complete', done = false, shown = 0;
  addEventListener('load', function () { loaded = true; });

  function frame(now) {
    if (done) return;
    if (++tick % 8 === 0) palette();
    var t = now - t0, cx = W / 2, cy = H / 2 - Math.min(30, H * .04), S = Math.min(W, H) * .085;
    ctx.clearRect(0, 0, W, H);

    /* phase timings (ms) */
    var pForm = clamp(t / 900), pTwist = ease((t - 1000) / 800), pBreak = ease((t - 1850) / 1000), pBack = ease((t - 2950) / 800);
    var spread = pBreak * (1 - pBack);                   /* 0 = assembled, 1 = scattered */
    var ry = ease((t - 700) / 1500) * 2.4 + Math.max(0, t - 700) / 2600, rx = ease((t - 700) / 1500) * -.6 + Math.sin(t / 900) * .08 * ease((t - 700) / 900);
    var camZ = 9 - spread * 4.5;                        /* fly into the cloud while it is broken */
    var persp = .02 + .98 * ease((t - 650) / 900);     /* starts flat (a clean 3x3 grid), then gains depth */

    /* light beam + dust while broken (echoes the hero's spotlight) */
    var glow = spread;
    if (glow > .01) {
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .7);
      g.addColorStop(0, 'rgba(' + BEAM + ',' + (GLOW * glow) + ')'); g.addColorStop(.45, 'rgba(' + BEAM + ',' + (GLOW * .3 * glow) + ')'); g.addColorStop(1, 'rgba(' + BEAM + ',0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < dust.length; i++) {
        var q = dust[i], rr = ((q.r + t * q.v / 2600) % 1), R = rr * rr * Math.max(W, H) * .75, a = glow * (1 - rr) * DUSTA;
        var x1 = cx + Math.cos(q.a) * R, y1 = cy + Math.sin(q.a) * R, tail = 6 + rr * 26 * glow;
        ctx.strokeStyle = 'rgba(' + DUST + ',' + a.toFixed(3) + ')'; ctx.lineWidth = q.s * (LIGHT ? 1.2 : 1);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(q.a) * tail, y1 - Math.sin(q.a) * tail); ctx.stroke();
      }
    }

    /* cubies */
    var list = [];
    for (var n = 0; n < cubies.length; n++) {
      var c = cubies[n], P = c.p.slice(), sx = 0, sy = 0, sz = 0;
      /* twist: rotate the top layer a quarter turn */
      if (P[1] === -1 && pTwist > 0) { var a2 = pTwist * Math.PI / 2, ca = Math.cos(a2), sa = Math.sin(a2); var nx = P[0] * ca - P[2] * sa, nz = P[0] * sa + P[2] * ca; P[0] = nx; P[2] = nz; sy = a2; }
      var off = [c.dir[0] * c.dist * spread, c.dir[1] * c.dist * spread, c.dir[2] * c.dist * spread];
      var center = [P[0] * 1.02 + off[0], P[1] * 1.02 + off[1], P[2] * 1.02 + off[2]];
      var spin = [c.spin[0] * spread, c.spin[1] * spread + sy, c.spin[2] * spread];
      var pts = V.map(function (v) {
        var w = rot([v[0] * .5, v[1] * .5, v[2] * .5], spin[0], spin[1], spin[2]);
        w = [w[0] + center[0], w[1] + center[1], w[2] + center[2]];
        w = rot(w, rx, ry, 0);
        var z = camZ + w[2] * persp; if (z < .3) z = .3;
        var f = 9 / z; return [cx + w[0] * S * f, cy + w[1] * S * f, camZ + w[2]];
      });
      var depth = 0; for (var k2 = 0; k2 < 8; k2++) depth += pts[k2][2];
      list.push({ pts: pts, d: depth / 8, center: n === 13 && P[0] === 0 });
    }
    list.sort(function (a, b) { return b.d - a.d; });

    /* edge draw-in during "form": lines grow from 0 to full length */
    var grow = ease(pForm);
    for (var m = 0; m < list.length; m++) {
      var L = list[m], fade = Math.max(FLOOR, Math.min(1, 1.6 - (L.d - camZ + 2) * .25));
      ctx.strokeStyle = 'rgba(' + INK + ',' + (fade * LINEA).toFixed(3) + ')';
      ctx.lineWidth = LW;
      ctx.beginPath();
      for (var e = 0; e < E.length; e++) {
        var A = L.pts[E[e][0]], B = L.pts[E[e][1]];
        ctx.moveTo(A[0], A[1]); ctx.lineTo(A[0] + (B[0] - A[0]) * grow, A[1] + (B[1] - A[1]) * grow);
      }
      ctx.stroke();
    }
    /* the lit square from the first frame: centre of the front face fills white, then fades as the cube turns */
    var lit = clamp((t - 500) / 300) * (1 - clamp((t - 1200) / 500)) + clamp((t - 3500) / 250);
    if (lit > 0.01) {
      var fc = cubies[12]; /* (0,0,-1): centre of the face nearest the camera */
      var pts2 = V.slice(0, 4).map(function (v) {
        var w = [v[0] * .5 + fc.p[0] * 1.02, v[1] * .5 + fc.p[1] * 1.02, v[2] * .5 + fc.p[2] * 1.02];
        w = rot(w, rx, ry, 0); var z = camZ + w[2] * persp, f = 9 / z; return [cx + w[0] * S * f, cy + w[1] * S * f];
      });
      ctx.fillStyle = 'rgba(' + INK + ',' + (Math.min(1, lit) * .95).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(pts2[0][0], pts2[0][1]); for (var j = 1; j < 4; j++) ctx.lineTo(pts2[j][0], pts2[j][1]); ctx.closePath(); ctx.fill();
    }

    var target = Math.min(1, t / MIN) * (loaded ? 1 : .9);
    shown += (target - shown) * .12;
    count.textContent = String(Math.round(shown * 100)).padStart(3, '0');
    bar.style.width = (shown * 100).toFixed(1) + '%';

    if ((t >= MIN && loaded) || t >= MAX) return finish();
    requestAnimationFrame(frame);
  }

  function finish() {
    if (done) return; done = true;
    count.textContent = '100'; bar.style.width = '100%';
    root.classList.add('is-revealing'); root.classList.remove('is-loading');
    el.classList.add('out');
    setTimeout(function () { el.remove(); }, 1100);
    setTimeout(function () { root.classList.remove('is-revealing'); st.remove(); }, 2300);
  }
  el.querySelector('.i-skip').addEventListener('click', finish);
  addEventListener('keydown', function k(e) { if (e.key === 'Escape' || e.key === 'Enter') { finish(); removeEventListener('keydown', k); } });

  requestAnimationFrame(frame);
})();
