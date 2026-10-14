/* Élite Car Studio — interactions
   Vanilla, no dependencies. Every scroll-linked effect degrades to a static
   layout when JS is off or prefers-reduced-motion is set. */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* ── nav ─────────────────────────────────────────────────── */

const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const dropBtn = document.querySelector('.nav__link--drop');
const dropPanel = document.getElementById('servizi-drop');
const setDrop = (open) => {
  dropBtn.setAttribute('aria-expanded', String(open));
  dropPanel.hidden = !open;
};
dropBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  setDrop(dropBtn.getAttribute('aria-expanded') !== 'true');
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav__drop')) setDrop(false);
});
document.addEventListener('keydown', (e) => e.key === 'Escape' && setDrop(false));

const burger = document.getElementById('burger');
const navmenu = document.getElementById('navmenu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  navmenu.classList.toggle('is-open', open);
});
navmenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', 'false');
  navmenu.classList.remove('is-open');
}));

document.querySelectorAll('.lang__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang__btn').forEach((b) => {
      b.classList.remove('is-active');
      b.removeAttribute('aria-current');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-current', 'true');
  });
});

/* ── booking form → WhatsApp ─────────────────────────────── */

// TODO: replace with the studio's real WhatsApp number, digits only, country code
// first and no "+" (an Italian mobile looks like '393201234567').
const WHATSAPP_NUMBER = '393000000000';

const form = document.getElementById('richiesta');
const formStatus = document.getElementById('form-status');

const FIELDS = [
  { id: 'f-nome', err: 'e-nome', label: 'Nome completo', msg: 'Inserisci il tuo nome completo.' },
  { id: 'f-tel',  err: 'e-tel',  label: 'Telefono',      msg: 'Inserisci un numero di telefono valido.',
    test: (v) => /^[+\d][\d\s().-]{5,}$/.test(v) },
  { id: 'f-mail', err: 'e-mail', label: 'Email',         msg: 'Inserisci un indirizzo email valido.',
    test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) },
  { id: 'f-via',  err: 'e-via',  label: 'Residenza',     msg: 'Inserisci il tuo indirizzo di residenza.' },
  { id: 'f-serv', err: 'e-serv', label: 'Servizio',      msg: 'Seleziona il servizio che ti interessa.' },
];

// `on` must be a real boolean: classList.toggle(name, undefined) toggles rather
// than forcing, which would flip a corrected field's error back on
const setError = (field, on) => {
  const bad = Boolean(on);
  const el = document.getElementById(field.id);
  const err = document.getElementById(field.err);
  el.setAttribute('aria-invalid', String(bad));
  err.textContent = bad ? field.msg : '';
  err.classList.toggle('is-on', bad);
};

const isBad = (field, value) => !value || (Boolean(field.test) && !field.test(value));

// clear a field's error as soon as the visitor starts fixing it
FIELDS.forEach((field) => {
  const el = document.getElementById(field.id);
  const revalidate = () => {
    if (!isBad(field, el.value.trim())) setError(field, false);
  };
  el.addEventListener('input', revalidate);
  el.addEventListener('change', revalidate);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  let firstBad = null;
  for (const field of FIELDS) {
    const bad = isBad(field, document.getElementById(field.id).value.trim());
    setError(field, bad);
    if (bad && !firstBad) firstBad = field;
  }

  if (firstBad) {
    formStatus.textContent = 'Controlla i campi evidenziati.';
    formStatus.classList.add('is-err');
    document.getElementById(firstBad.id).focus();
    return;
  }

  const val = (id) => document.getElementById(id).value.trim();
  const lines = [
    'Nuova richiesta dal sito Élite Car Studio',
    '',
    `Nome completo: ${val('f-nome')}`,
    `Telefono: ${val('f-tel')}`,
    `Email: ${val('f-mail')}`,
    `Residenza: ${val('f-via')}`,
    `Servizio: ${val('f-serv')}`,
  ];
  const note = val('f-note');
  if (note) lines.push(`Dettagli: ${note}`);

  formStatus.classList.remove('is-err');
  formStatus.textContent = 'Apertura di WhatsApp con la tua richiesta…';
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`,
    '_blank', 'noopener');
});

/* ── stat counters ───────────────────────────────────────── */

// The markup carries the final figure so the numbers are right with JS off;
// they are only zeroed once we know we can animate them back up.
const statVals = document.querySelectorAll('.stat__v');

if (!reduced && statVals.length) {
  const COUNT_MS = 1100;

  statVals.forEach((el) => { el.textContent = '0'; });

  const countUp = (el) => {
    const to = Number(el.dataset.to);
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / COUNT_MS, 1);
      // ease-out cubic: quick off the mark, settling onto the final figure
      el.textContent = String(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(to);
    };
    requestAnimationFrame(tick);
  };

  const statIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      statIo.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  statVals.forEach((el) => statIo.observe(el));
}

/* ── scroll reveals ──────────────────────────────────────── */

const revealTargets = document.querySelectorAll('.reveal');
if (reduced) {
  revealTargets.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
  revealTargets.forEach((el) => io.observe(el));
}

/* ── projects rail: drag to scroll ───────────────────────── */

const rail = document.getElementById('rail');
let railDown = false, railX = 0, railLeft = 0, moved = 0;

rail.addEventListener('dragstart', (e) => e.preventDefault());
rail.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') return; // let native touch scrolling handle it
  e.preventDefault();
  railDown = true;
  moved = 0;
  railX = e.clientX;
  railLeft = rail.scrollLeft;
  rail.classList.add('is-dragging');
});
rail.addEventListener('pointermove', (e) => {
  if (!railDown) return;
  const dx = e.clientX - railX;
  moved = Math.max(moved, Math.abs(dx));
  rail.scrollLeft = railLeft - dx;
});
const endDrag = () => {
  railDown = false;
  rail.classList.remove('is-dragging');
};
rail.addEventListener('pointerup', endDrag);
rail.addEventListener('pointerleave', endDrag);
rail.addEventListener('pointercancel', endDrag);
// suppress the click that ends a drag, so cards don't navigate on release
rail.addEventListener('click', (e) => { if (moved > 6) e.preventDefault(); }, true);
