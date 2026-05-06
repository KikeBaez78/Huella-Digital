/* ═══════════════════════════════════════════════════════════
   CASA VIÑA — Landing JS
   Nav · Hero entrance · Scroll reveals · Form · GSAP
═══════════════════════════════════════════════════════════ */

'use strict';

const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

/* ─── NAV ────────────────────────────────────────────────── */
function initNav() {
  const nav    = qs('#nav');
  const burger = qs('#navBurger');
  const menu   = qs('#mobileMenu');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }, { passive: true });

  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    qsa('.mob-link', menu).forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ─── SMOOTH SCROLL ──────────────────────────────────────── */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

/* ─── HERO ENTRANCE ──────────────────────────────────────── */
function initHeroEntrance() {
  const lines = qsa('.tl');

  setTimeout(() => {
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('is-visible'), i * 160);
    });

    const fadeEls = qsa('.hero__eyebrow, .hero__sub, .hero__actions, .hero__pills, .hero__scroll');
    fadeEls.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.opacity = '1';
      }, 600 + i * 130);
    });
  }, 80);
}

/* ─── INTERSECTION REVEALS ───────────────────────────────── */
function initReveals() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  qsa('.reveal-up, .reveal-fade').forEach((el) => observer.observe(el));
}

/* ─── SCROLL PROGRESS ────────────────────────────────────── */
function initProgress() {
  const bar = Object.assign(document.createElement('div'), {
    style: `position:fixed;top:0;left:0;height:2px;width:0%;
            background:var(--gold);z-index:10000;
            transition:width 0.1s linear;pointer-events:none;`,
  });
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });
}

/* ─── BOOKING FORM ───────────────────────────────────────── */
function initForm() {
  const form = qs('#bookingForm');
  if (!form) return;

  /* Set min dates to today */
  const today = new Date().toISOString().split('T')[0];
  const checkin  = qs('#checkin',  form);
  const checkout = qs('#checkout', form);
  if (checkin)  checkin.min  = today;
  if (checkout) checkout.min = today;

  /* Keep checkout after checkin */
  checkin?.addEventListener('change', () => {
    if (checkout && checkin.value) checkout.min = checkin.value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data   = Object.fromEntries(new FormData(form));
    const nombre = data.nombre?.trim();
    const email  = data.email?.trim();

    if (!nombre || !email) {
      showFormMsg(form, 'Por favor completa los campos requeridos.', 'error');
      return;
    }

    /* Build WhatsApp message */
    const msg = [
      `Hola, me interesa rentar *Casa Viña*:`,
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      data.telefono ? `Teléfono: ${data.telefono}` : null,
      data.checkin  ? `Check-in: ${data.checkin}`  : null,
      data.checkout ? `Check-out: ${data.checkout}` : null,
      data.huespedes ? `Huéspedes: ${data.huespedes}` : null,
      data.mensaje?.trim() ? `Mensaje: ${data.mensaje.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const waUrl = `https://wa.me/526641234567?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener');

    showFormMsg(form, '¡Gracias! Te redirigimos a WhatsApp para confirmar tu solicitud.', 'success');
    form.classList.add('is-sent');

    setTimeout(() => {
      form.reset();
      form.classList.remove('is-sent');
      removeFormMsg(form);
    }, 6000);
  });
}

function showFormMsg(form, text, type) {
  removeFormMsg(form);
  const msg = document.createElement('p');
  msg.className = 'form-msg';
  msg.textContent = text;
  msg.style.cssText = `
    text-align:center; font-size:0.83rem; margin-top:12px;
    color: ${type === 'error' ? '#ff6b6b' : 'var(--gold)'};
  `;
  form.appendChild(msg);
}

function removeFormMsg(form) {
  qs('.form-msg', form)?.remove();
}

/* ─── GALLERY LIGHTBOX (minimal) ────────────────────────── */
function initGallery() {
  qsa('.g-cell').forEach((cell) => {
    cell.style.cursor = 'zoom-in';
    cell.addEventListener('click', () => {
      const label = cell.querySelector('.g-label')?.textContent || '';
      const bg    = getComputedStyle(cell.querySelector('.g-img')).background;

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:9998;
        background:rgba(0,0,0,0.92);
        display:flex;align-items:center;justify-content:center;
        cursor:zoom-out;animation:fadeIn 0.3s ease;
      `;

      const box = document.createElement('div');
      box.style.cssText = `
        width:min(90vw,880px);height:min(60vh,560px);
        border-radius:20px;background:${bg};
        display:flex;align-items:flex-end;padding:24px;
        box-shadow:0 32px 80px rgba(0,0,0,0.7);
      `;

      const lbl = document.createElement('span');
      lbl.textContent = label;
      lbl.style.cssText = `
        font-family:var(--mono);font-size:0.8rem;
        color:rgba(255,255,255,0.7);
        background:rgba(0,0,0,0.4);backdrop-filter:blur(8px);
        border:1px solid rgba(255,255,255,0.1);
        border-radius:100px;padding:6px 16px;
      `;

      box.appendChild(lbl);
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      const close = () => overlay.remove();
      overlay.addEventListener('click', close);
      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
      });
    });
  });

  /* Inject fadeIn keyframe */
  if (!qs('#galleryStyle')) {
    const style = document.createElement('style');
    style.id = 'galleryStyle';
    style.textContent = '@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }';
    document.head.appendChild(style);
  }
}

/* ─── GSAP ENHANCEMENTS ──────────────────────────────────── */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* Parallax hero gradient */
  gsap.to('.hero__gradient', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    y: 60,
    scale: 1.05,
    ease: 'none',
  });

  /* Strip numbers pop */
  gsap.from('.strip__num', {
    scrollTrigger: { trigger: '.strip', start: 'top 85%' },
    y: 20,
    opacity: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
  });

  /* Gallery cells stagger */
  gsap.from('.g-cell', {
    scrollTrigger: { trigger: '.gallery-grid', start: 'top 80%' },
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power3.out',
  });

  /* Amenidades cards */
  gsap.from('.amen-card', {
    scrollTrigger: { trigger: '.amenidades__grid', start: 'top 80%' },
    opacity: 0,
    y: 28,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
  });

  /* Reseñas */
  gsap.from('.resena-card', {
    scrollTrigger: { trigger: '.resenas__grid', start: 'top 82%' },
    opacity: 0,
    y: 24,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
  });

  /* CTA section glow pulse */
  gsap.to('.wa-float', {
    boxShadow: '0 12px 48px rgba(37, 211, 102, 0.7)',
    duration: 1.5,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });
}

/* ─── CURRENT YEAR ───────────────────────────────────────── */
function initYear() {
  qsa('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}

/* ─── INIT ───────────────────────────────────────────────── */
function init() {
  initNav();
  initSmoothScroll();
  initHeroEntrance();
  initReveals();
  initProgress();
  initForm();
  initGallery();
  initGSAP();
  initYear();
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
