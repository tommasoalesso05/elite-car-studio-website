/* Élite Car Studio — wave field behind the closing section
   Port of the 21st.dev `Waves` React component to vanilla JS. Same idea: a grid
   of vertical polylines pushed around by 2D simplex noise, with the pointer
   shoving nearby points aside.

   Four things differ from the original, all deliberate:
   - it never takes pointer events, so the contact links and buttons underneath
     stay clickable;
   - the touchmove handler is gone. The original calls preventDefault() on it,
     which would stop the page scrolling on a phone — fatal for something sitting
     behind content;
   - the animation only runs while the section is on screen;
   - the cursor dot is dropped; it belongs in a full-screen demo, not behind a
     paragraph of copy. */

import { createNoise2D } from './vendor/simplex-noise.js';

const host = document.querySelector('.waves');

if (host) {
  const svg = host.querySelector('svg');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noise2D = createNoise2D();

  // Far coarser than the original's 8px grid: that is ~20k points redrawn every
  // frame across a section this size. These gaps keep it near 2k.
  const X_GAP = 22;
  const Y_GAP = 26;

  let lines = [];
  let paths = [];
  let box = null;
  let raf = null;

  const mouse = { x: -400, y: 0, lx: 0, ly: 0, sx: -400, sy: 0, vs: 0, a: 0, set: false };

  // The field spans from the top of its section to the bottom of the footer, so
  // the lines carry on to the end of the page. .consulto does not clip, and the
  // footer paints after it, so footer content sits on top of the overflow.
  const footer = document.querySelector('.footer');
  const section = host.parentElement;

  const resize = () => {
    const top = section.getBoundingClientRect().top;
    const bottom = footer ? footer.getBoundingClientRect().bottom : section.getBoundingClientRect().bottom;
    host.style.height = `${Math.round(bottom - top)}px`;
  };

  const measure = () => { box = host.getBoundingClientRect(); };

  const build = () => {
    resize();
    measure();
    const { width, height } = box;
    if (!width || !height) return;

    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));

    paths.forEach((p) => p.remove());
    paths = [];
    lines = [];

    // overshoot the box so the field has no visible edge where lines start
    const oWidth = width + 160;
    const oHeight = height + 60;
    const totalLines = Math.ceil(oWidth / X_GAP);
    const totalPoints = Math.ceil(oHeight / Y_GAP);
    const xStart = (width - X_GAP * totalLines) / 2;
    const yStart = (height - Y_GAP * totalPoints) / 2;

    const frag = document.createDocumentFragment();

    for (let i = 0; i < totalLines; i++) {
      const points = [];
      for (let j = 0; j < totalPoints; j++) {
        points.push({
          x: xStart + X_GAP * i,
          y: yStart + Y_GAP * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        });
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '1');
      frag.appendChild(path);
      paths.push(path);
      lines.push(points);
    }

    svg.appendChild(frag);
  };

  const movePoints = (time) => {
    for (const points of lines) {
      for (const p of points) {
        const move = noise2D(
          (p.x + time * 0.008) * 0.003,
          (p.y + time * 0.003) * 0.002,
        ) * 8;

        p.wave.x = Math.cos(move) * 12;
        p.wave.y = Math.sin(move) * 6;

        const dx = p.x - mouse.sx;
        const dy = p.y - mouse.sy;
        const d = Math.hypot(dx, dy);
        const l = Math.max(175, mouse.vs);

        if (d < l) {
          const s = 1 - d / l;
          const f = Math.cos(d * 0.001) * s;
          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035;
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035;
        }

        p.cursor.vx += (0 - p.cursor.x) * 0.01;
        p.cursor.vy += (0 - p.cursor.y) * 0.01;
        p.cursor.vx *= 0.95;
        p.cursor.vy *= 0.95;
        p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x + p.cursor.vx));
        p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y + p.cursor.vy));
      }
    }
  };

  // The original joins the points with straight `L` segments, which leaves a
  // visible corner at every point. Instead each point becomes the control handle
  // of a quadratic whose end sits at the midpoint of the next span — the classic
  // smoothing trick. The result is C1-continuous: no corners anywhere.
  const draw = () => {
    for (let i = 0; i < lines.length; i++) {
      const points = lines[i];
      const n = points.length;
      if (n < 3) continue;

      const px = (p, cursor) => p.x + p.wave.x + (cursor ? p.cursor.x : 0);
      const py = (p, cursor) => p.y + p.wave.y + (cursor ? p.cursor.y : 0);

      let d = `M${px(points[0], false).toFixed(1)} ${py(points[0], false).toFixed(1)}`;

      for (let j = 1; j < n - 1; j++) {
        const c = points[j];
        const nx = points[j + 1];
        const mx = (px(c, true) + px(nx, true)) / 2;
        const my = (py(c, true) + py(nx, true)) / 2;
        d += `Q${px(c, true).toFixed(1)} ${py(c, true).toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }

      const last = points[n - 1];
      d += `L${px(last, true).toFixed(1)} ${py(last, true).toFixed(1)}`;
      paths[i].setAttribute('d', d);
    }
  };

  const tick = (time) => {
    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;

    const dx = mouse.x - mouse.lx;
    const dy = mouse.y - mouse.ly;
    mouse.vs += (Math.hypot(dx, dy) - mouse.vs) * 0.1;
    mouse.vs = Math.min(100, mouse.vs);
    mouse.lx = mouse.x;
    mouse.ly = mouse.y;
    mouse.a = Math.atan2(dy, dx);

    movePoints(time);
    draw();
    raf = requestAnimationFrame(tick);
  };

  const start = () => { if (raf === null) raf = requestAnimationFrame(tick); };
  const stop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };

  build();
  // the footer's height settles once the webfonts land, and that height is what
  // the field is sized against
  if (document.fonts) document.fonts.ready.then(build);

  if (reduced) {
    // one still frame: the texture is there, nothing moves
    movePoints(0);
    draw();
  } else {
    addEventListener('mousemove', (e) => {
      if (!box) return;
      mouse.x = e.clientX - box.left;
      mouse.y = e.clientY - box.top;
      if (!mouse.set) { mouse.sx = mouse.x; mouse.sy = mouse.y; mouse.lx = mouse.x; mouse.ly = mouse.y; mouse.set = true; }
    }, { passive: true });

    // the cached rect is what maps the pointer into the field, so it has to
    // follow the section as the page scrolls
    addEventListener('scroll', measure, { passive: true });

    let resizeTimer;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    });

    // don't burn a frame budget on a section nobody is looking at
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { rootMargin: '120px' }).observe(host);
  }
}
