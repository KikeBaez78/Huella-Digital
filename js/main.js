/* ═══════════════════════════════════════════════════════════
   HUELLA DIGITAL — main.js
   Three.js particle hero · GSAP ScrollTrigger · Custom cursor
   Magnetic buttons · Tilt cards · Counters · Nav · Mobile menu
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── UTILITIES ──────────────────────────────────────────── */
const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const lerp  = (a, b, t) => a + (b - a) * t;
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

/* ─── THREE.JS PARTICLE HERO ─────────────────────────────── */
function initHeroScene() {
  const canvas = qs('#heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 28;

  /* ── Particle geometry ── */
  const PARTICLE_COUNT = isMobile() ? 400 : 900;
  const positions   = new Float32Array(PARTICLE_COUNT * 3);
  const velocities  = new Float32Array(PARTICLE_COUNT * 3);
  const sizes       = new Float32Array(PARTICLE_COUNT);

  const SPREAD = 30;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * SPREAD * 2;
    positions[i3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i3 + 2] = (Math.random() - 0.5) * SPREAD * 0.8;

    velocities[i3]     = (Math.random() - 0.5) * 0.003;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.003;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

    sizes[i] = Math.random() * 1.5 + 0.5;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:      { value: 0 },
      uColor:     { value: new THREE.Color(0xc8ff00) },
      uColorMid:  { value: new THREE.Color(0x88aaff) },
    },
    vertexShader: `
      attribute float size;
      uniform float uTime;
      varying float vAlpha;

      void main() {
        vec3 pos = position;
        pos.x += sin(uTime * 0.4 + position.y * 0.3) * 0.18;
        pos.y += cos(uTime * 0.35 + position.x * 0.3) * 0.12;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (280.0 / -mvPosition.z);
        gl_Position  = projectionMatrix * mvPosition;

        vAlpha = clamp(1.0 - length(pos.xy) / 28.0, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uColorMid;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;

        float alpha = (1.0 - d * 2.0) * vAlpha * 0.75;
        vec3 col    = mix(uColorMid, uColor, vAlpha);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ── Line connections ── */
  const MAX_LINES    = isMobile() ? 120 : 280;
  const MAX_DIST     = 7;
  const linePositions = new Float32Array(MAX_LINES * 2 * 3);
  const lineGeo       = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x88aaff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  /* ── Mouse parallax ── */
  const mouse  = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ── Resize ── */
  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  /* ── Animate ── */
  let frame = 0;
  let raf;

  function animate(t = 0) {
    raf = requestAnimationFrame(animate);
    frame++;

    const time = t * 0.001;
    particleMat.uniforms.uTime.value = time;

    /* Smooth camera parallax */
    target.x = lerp(target.x, mouse.x * 1.2, 0.04);
    target.y = lerp(target.y, mouse.y * 0.8, 0.04);
    particles.rotation.y = target.x * 0.04;
    particles.rotation.x = -target.y * 0.03;

    /* Update line connections every 3 frames */
    if (frame % 3 === 0) {
      let lineIdx = 0;
      const pos = particleGeo.attributes.position.array;

      for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_LINES; i++) {
        const ix = pos[i * 3], iy = pos[i * 3 + 1], iz = pos[i * 3 + 2];
        for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_LINES; j++) {
          const dx = ix - pos[j * 3];
          const dy = iy - pos[j * 3 + 1];
          const dz = iz - pos[j * 3 + 2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < MAX_DIST) {
            const base = lineIdx * 6;
            linePositions[base]     = ix;
            linePositions[base + 1] = iy;
            linePositions[base + 2] = iz;
            linePositions[base + 3] = pos[j * 3];
            linePositions[base + 4] = pos[j * 3 + 1];
            linePositions[base + 5] = pos[j * 3 + 2];
            lineIdx++;
          }
        }
      }
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, lineIdx * 2);
    }

    /* Drift particles */
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      if (Math.abs(pos[i3])     > SPREAD)     velocities[i3]     *= -1;
      if (Math.abs(pos[i3 + 1]) > SPREAD / 2) velocities[i3 + 1] *= -1;
      if (Math.abs(pos[i3 + 2]) > SPREAD / 2) velocities[i3 + 2] *= -1;
    }
    particleGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  /* Pause when hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else animate();
  });
}

/* ─── CUSTOM CURSOR ──────────────────────────────────────── */
function initCursor() {
  if (isMobile()) return;

  const dot  = qs('#cursorDot');
  const ring = qs('#cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  let isHovering = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  document.addEventListener('mousedown', () => ring.classList.add('is-clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('is-clicking'));

  const hoverEls = 'a, button, [data-magnetic], .service-card, .work-item, .tilt-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverEls)) {
      isHovering = true;
      ring.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (!e.target.closest(hoverEls)) {
      isHovering = false;
      ring.classList.remove('is-hovering');
    }
  });

  function tickCursor() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(tickCursor);
  }
  tickCursor();
}

/* ─── MAGNETIC BUTTONS ───────────────────────────────────── */
function initMagnetic() {
  if (isMobile()) return;

  qsa('[data-magnetic]').forEach((el) => {
    const strength = 0.35;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * strength;
      const dy   = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ─── 3D TILT CARDS ──────────────────────────────────────── */
function initTiltCards() {
  if (isMobile()) return;

  qsa('.tilt-card').forEach((card) => {
    const INTENSITY = 8;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform = `
        perspective(800px)
        rotateX(${-y * INTENSITY}deg)
        rotateY(${x  * INTENSITY}deg)
        translateZ(8px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
}

/* ─── COUNTER ANIMATION ──────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;

  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const p = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }

  requestAnimationFrame(tick);
}

/* ─── SCROLL REVEALS ─────────────────────────────────────── */
function initScrollReveals() {
  const countersStarted = new WeakSet();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add('is-visible');

        /* Hero title lines */
        if (el.classList.contains('split-line')) {
          el.style.transitionDelay = el.dataset.lineDelay || '0s';
        }

        /* Counters */
        if (el.classList.contains('counter') && !countersStarted.has(el)) {
          countersStarted.add(el);
          animateCounter(el);
        }

        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  qsa('.reveal-up, .reveal-fade, .split-line, .counter').forEach((el) => observer.observe(el));
}

/* ─── HERO ENTRANCE ANIMATION ────────────────────────────── */
function initHeroEntrance() {
  /* Stagger the hero title lines */
  const lines = qsa('.hero__title-line');
  lines.forEach((line, i) => {
    line.dataset.lineDelay = `${i * 0.15}s`;
  });

  /* Trigger after a short wait */
  setTimeout(() => {
    lines.forEach((line) => line.classList.add('is-visible'));

    const delayedEls = qsa('.hero__badge, .hero__sub, .hero__actions, .hero__stats, .hero__scroll');
    delayedEls.forEach((el, i) => {
      el.style.transitionDelay = `${0.5 + i * 0.12}s`;
      el.classList.add('is-visible');
    });
  }, 100);
}

/* ─── NAVIGATION ─────────────────────────────────────────── */
function initNav() {
  const nav    = qs('#nav');
  const burger = qs('#navBurger');
  const menu   = qs('#mobileMenu');
  if (!nav) return;

  /* Scroll state */
  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive: true });

  /* Mobile menu */
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    qsa('.mobile-link', menu).forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* Active link highlight */
  const sections = qsa('section[id]');
  const navLinks  = qsa('.nav__link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => sectionObserver.observe(s));
}

/* ─── SMOOTH SCROLL ──────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── GSAP SCROLL ANIMATIONS ─────────────────────────────── */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* About section: slide in from sides */
  gsap.from('.about__left', {
    scrollTrigger: { trigger: '.about', start: 'top 75%' },
    x: -40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  });

  gsap.from('.about__right', {
    scrollTrigger: { trigger: '.about', start: 'top 75%' },
    x: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.15,
  });

  /* Work items: stagger slide up */
  gsap.from('.work-item', {
    scrollTrigger: { trigger: '.work__list', start: 'top 80%' },
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
  });

  /* CTA title scale */
  gsap.from('.cta-title', {
    scrollTrigger: { trigger: '.cta-section', start: 'top 80%' },
    scale: 0.95,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
  });

  /* Ticker speed up on scroll */
  ScrollTrigger.create({
    trigger: '.ticker-wrap',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const speed = 1 + Math.abs(self.getVelocity()) * 0.00004;
      document.querySelector('.ticker').style.animationDuration = `${30 / speed}s`;
    },
  });
}

/* ─── WORK ITEM HOVER CURSOR EFFECT ─────────────────────── */
function initWorkItems() {
  qsa('.work-item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const ring = qs('#cursorRing');
      if (ring) ring.style.borderColor = 'var(--accent)';
    });
    item.addEventListener('mouseleave', () => {
      const ring = qs('#cursorRing');
      if (ring) ring.style.borderColor = '';
    });
  });
}

/* ─── SERVICE CARD GRADIENT GLOW ────────────────────────── */
function initCardGlow() {
  if (isMobile()) return;

  qsa('.service-card, .testimonial-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width)  * 100;
      const y    = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.background = `
        radial-gradient(circle at ${x}% ${y}%, rgba(200,255,0,0.04) 0%, var(--bg-3) 60%)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

/* ─── FOOTER YEAR ───────────────────────────────────────── */
function initFooter() {
  const yearEls = qsa('[data-year]');
  yearEls.forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ─── SCROLL PROGRESS BAR ───────────────────────────────── */
function initProgressBar() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px; width: 0%;
    background: var(--accent); z-index: 10000;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = progress + '%';
  }, { passive: true });
}

/* ─── TEXT SCRAMBLE (nav logo) ───────────────────────────── */
function initTextScramble() {
  const logo = qs('.nav__logo');
  if (!logo) return;

  const chars   = 'HD01!?#$%&*+-:;<>';
  const original = logo.textContent.replace('.', '');
  let   interval = null;

  logo.addEventListener('mouseenter', () => {
    let iter = 0;
    clearInterval(interval);
    interval = setInterval(() => {
      logo.childNodes[0].nodeValue = original
        .split('')
        .map((_, i) => {
          if (i < iter) return original[i];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      if (iter >= original.length) clearInterval(interval);
      iter += 0.5;
    }, 60);
  });

  logo.addEventListener('mouseleave', () => {
    clearInterval(interval);
    logo.childNodes[0].nodeValue = original;
  });
}

/* ─── INIT ───────────────────────────────────────────────── */
function init() {
  initHeroScene();
  initCursor();
  initNav();
  initSmoothScroll();
  initHeroEntrance();
  initScrollReveals();
  initMagnetic();
  initTiltCards();
  initWorkItems();
  initCardGlow();
  initProgressBar();
  initTextScramble();
  initGSAP();
  initFooter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
