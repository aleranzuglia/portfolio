// =============================================================================
// main.js — comportamiento mínimo del portfolio
// Vanilla JS, sin dependencias. Defer en el HTML.
// =============================================================================

// Nav: active state según sección visible
// -----------------------------------------------------------------------------
(function initNavActive() {
  const links = document.querySelectorAll('.site-nav__link');
  const sections = document.querySelectorAll('main section[id]');

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        links.forEach((link) => {
          link.classList.toggle(
            'is-active',
            link.getAttribute('href') === `#${id}`
          );
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
})();


// Custom cursor — dot fijo + anillo con lerp + hover states + efecto magnético
// -----------------------------------------------------------------------------
(function initCursor() {
  // No activar en touch
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.documentElement.style.cursor = 'none';

  // Inyectar estilos
  const style = document.createElement('style');
  style.textContent = `
    *,
    *:hover { cursor: none !important; }

    .cursor-dot,
    .cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      will-change: transform;
    }

    .cursor-dot {
      width: 12px;
      height: 12px;
      background: #FFFFFF;
      mix-blend-mode: difference;
    }

    .cursor-ring {
      width: 36px;
      height: 36px;
      border: 1.5px solid #FFFFFF;
      background: transparent;
      transition:
        width 0.2s cubic-bezier(0.16,1,0.3,1),
        height 0.2s cubic-bezier(0.16,1,0.3,1),
        background 0.2s cubic-bezier(0.16,1,0.3,1),
        opacity 0.2s;
      mix-blend-mode: difference;
    }

    .cursor-ring.is-hovering {
      width: 64px;
      height: 64px;
      background: #C8FA64;
      border-color: transparent;
      mix-blend-mode: difference;
    }
  `;
  document.head.appendChild(style);

  // Crear elementos
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  // Estado
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Selectores de hover
  const hoverSel = 'a, button, .project-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSel)) ring.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSel)) ring.classList.remove('is-hovering');
  });

  // Ocultar al salir de la ventana
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Efecto magnético
  const MAGNET_SEL    = '.hero__cta, .site-nav__logo';
  const MAGNET_RADIUS = 80;
  const MAGNET_PULL   = 8;
  const magnetEls     = [];

  function initMagnets() {
    document.querySelectorAll(MAGNET_SEL).forEach((el) => {
      el.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
      magnetEls.push(el);
    });
  }
  // Esperar al DOM completo (el script tiene defer)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagnets);
  } else {
    initMagnets();
  }

  function applyMagnet() {
    magnetEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = mouseX - cx;
      const dy   = mouseY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < MAGNET_RADIUS) {
        const force = (MAGNET_RADIUS - dist) / MAGNET_RADIUS;
        el.style.transform = `translate(${dx * force * MAGNET_PULL / MAGNET_RADIUS}px, ${dy * force * MAGNET_PULL / MAGNET_RADIUS}px)`;
      } else {
        el.style.transform = '';
      }
    });
  }

  // Loop de animación
  function tick() {
    // Dot: posición exacta
    dot.style.transform  = `translate(calc(-50% + ${mouseX}px), calc(-50% + ${mouseY}px))`;

    // Ring: lerp
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.transform = `translate(calc(-50% + ${ringX}px), calc(-50% + ${ringY}px))`;

    applyMagnet();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();


// Scroll reveal — fade + translate para elementos con [data-reveal]
// Uso en HTML: <div data-reveal> ... </div>
// -----------------------------------------------------------------------------
(function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  // Respetar prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const style = document.createElement('style');
  style.textContent = `
    [data-reveal] {
      opacity: 0;
      transform: translateY(16px);
      transition:
        opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-reveal].is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  els.forEach((el) => observer.observe(el));
})();


(function initRotatingText() {
  const el = document.querySelector('.hero__rotating');
  if (!el) return;
  const words = ['Branding','Packaging','Web design','UX/UI','Frontend'];
  let i = 0;
  function next() {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 300);
  }
  el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  el.style.display = 'inline-block';
  el.style.color = 'var(--color-charge)';
  setInterval(next, 2000);
})();
