// =============================================================================
// main.js — comportamiento mínimo del portfolio
// Vanilla JS, sin dependencias. Defer en el HTML.
// =============================================================================

// Nav: menú hamburguesa para mobile
// -----------------------------------------------------------------------------
(function initBurger() {
  const burger = document.querySelector('.site-nav__burger');
  const links  = document.getElementById('nav-links');
  if (!burger || !links) return;

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    links.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('.site-nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      burger.classList.remove('is-open');
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();


// Nav: active state según sección visible + smooth scroll
// -----------------------------------------------------------------------------
(function initNavActive() {
  const links = document.querySelectorAll('.site-nav__link');
  const sections = document.querySelectorAll('main section[id]');

  if (!sections.length || !links.length) return;

  const header = document.querySelector('.site-nav');
  const offset = header ? header.getBoundingClientRect().height + 16 : 72;

  const setActiveLink = (id) => {
    links.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('is-active', href === `#${id}`);
    });
  };

  const getActiveSection = () => {
    const scrollTop = window.scrollY + offset + 8;
    let current = sections[0];

    sections.forEach((section) => {
      if (section.offsetTop <= scrollTop) current = section;
    });

    return current;
  };

  const updateActiveSection = () => {
    setActiveLink(getActiveSection().id);
  };

  const scrollToSection = (targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: targetTop, behavior: 'smooth' }); // solo esto
  };

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href')?.replace(/^#/, '');
      if (!targetId) return;

      e.preventDefault();
      setActiveLink(targetId);
      scrollToSection(targetId);

      if (window.history.pushState) {
        history.pushState(null, '', `#${targetId}`);
      }
    });
  });

  updateActiveSection();
  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection);
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
      transform: translateY(32px);
      transition:
        opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: var(--reveal-delay, 0ms);
    }
    [data-reveal].is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  // Elementos que entran al viewport en la misma tanda (misma llamada del
  // observer) se escalonan entre sí; los que entran solos por scroll normal
  // no llevan delay extra — ya vienen naturalmente espaciados por el scroll.
  const STAGGER_STEP = 90;  // ms
  const STAGGER_MAX = 4;    // tope de escalones para no alargar tandas largas

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, i) => {
          const delay = Math.min(i, STAGGER_MAX) * STAGGER_STEP;
          entry.target.style.setProperty('--reveal-delay', `${delay}ms`);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
    },
    { threshold: 0.08 }
  );

  els.forEach((el) => observer.observe(el));
})();


(function initProjectPreview() {
  const preview = document.getElementById('projectPreview');
  const previewImg = document.getElementById('projectPreviewImg');
  const items = document.querySelectorAll('.project-list__item[data-preview]');
  if (!preview || !items.length) return;

  let mouseX = 0, mouseY = 0;
  let previewX = 0, previewY = 0;
  let tracking = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!tracking) {
      previewX = mouseX;
      previewY = mouseY;
      tracking = true;
    }
  });

  function animatePreview() {
    previewX += (mouseX - previewX) * 0.18;
    previewY += (mouseY - previewY) * 0.18;
    preview.style.left = (previewX + 24) + 'px';
    preview.style.top = (previewY - 80) + 'px';
    requestAnimationFrame(animatePreview);
  }
  animatePreview();

  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const src = item.dataset.preview;
      previewImg.src = src;
      previewImg.alt = item.querySelector('.project-list__title').textContent;
      preview.classList.add('is-visible');
    });
    item.addEventListener('mouseleave', () => {
      preview.classList.remove('is-visible');
    });
  });
})();


// Case study — apertura/cierre animado de "Ver caso completo"
// Intercepta el toggle nativo de <details> para poder animar la altura
// (grid-template-rows 0fr→1fr en .case-study__more-body vía clase .is-open).
// -----------------------------------------------------------------------------
(function initCaseStudyMore() {
  document.querySelectorAll('.case-study__more').forEach((details) => {
    const summary = details.querySelector(':scope > summary');
    if (!summary) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      if (details.open) {
        details.classList.remove('is-open');
        const onEnd = (ev) => {
          if (ev.propertyName !== 'grid-template-rows') return;
          details.open = false;
          details.removeEventListener('transitionend', onEnd);
        };
        details.addEventListener('transitionend', onEnd);
      } else {
        details.open = true;
        requestAnimationFrame(() => details.classList.add('is-open'));
      }
    });
  });
})();


// Texto rotativo del hero — cada palabra se arma letra por letra,
// intercambiando caracteres al azar antes de asentarse (como el conteo
// animado de initCounters, pero por caracter en vez de por dígito).
// -----------------------------------------------------------------------------
(function initRotatingText() {
  const el = document.querySelector('.hero__rotating');
  const liveEl = document.querySelector('.hero__rotating-live');
  if (!el) return;

  const words = ['Diseño de producto', 'Branding'];
  const scrambleChars = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz';
  let i = 0;
  let frameId;

  const style = document.createElement('style');
  style.textContent = `
    .hero__rotating {
      display: inline-block;
      overflow: visible;
      vertical-align: bottom;
      padding-bottom: 0.15em;
    }
  `;
  document.head.appendChild(style);

  function scrambleTo(target) {
    const from = el.textContent;
    const length = Math.max(from.length, target.length);
    const queue = [];

    for (let idx = 0; idx < length; idx++) {
      const start = Math.floor(Math.random() * 8);
      queue.push({
        fromChar: from[idx] || '',
        toChar: target[idx] || '',
        start,
        end: start + Math.floor(Math.random() * 10) + 6,
      });
    }

    cancelAnimationFrame(frameId);
    let frame = 0;

    function update() {
      let output = '';
      let settled = 0;

      queue.forEach(({ fromChar, toChar, start, end }) => {
        if (frame >= end) {
          settled++;
          output += toChar;
        } else if (frame >= start) {
          output += toChar === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        } else {
          output += fromChar;
        }
      });

      el.textContent = output;
      if (settled === queue.length) {
        if (liveEl) liveEl.textContent = target;
        return;
      }
      frame++;
      frameId = requestAnimationFrame(update);
    }
    update();
  }

  scrambleTo(words[0]);
  setInterval(() => {
    i = (i + 1) % words.length;
    scrambleTo(words[i]);
  }, 2400);
})();


// Animated counters
// -----------------------------------------------------------------------------
(function initCounters() {
  function animateCounter(el, target, duration) {
    duration = duration || 1400;
    var start = performance.now();
    function update(now) {
      var progress = Math.min((now - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target, parseInt(entry.target.dataset.count));
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(function(el) {
    counterObserver.observe(el);
  });
})();


// Custom cursor
// -----------------------------------------------------------------------------
(function initCustomCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.documentElement.classList.add('has-custom-cursor');

  var cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  var cursorRing = document.createElement('div');
  cursorRing.className = 'cursor-ring';
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  var targetX = 0, targetY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', function(e) {
    targetX = e.clientX;
    targetY = e.clientY;
    cursorDot.style.transform = 'translate(calc(' + targetX + 'px - 50%), calc(' + targetY + 'px - 50%))';
  });

  function animateCursorRing() {
    ringX += (targetX - ringX) * 0.1;
    ringY += (targetY - ringY) * 0.1;
    cursorRing.style.transform = 'translate(calc(' + ringX + 'px - 50%), calc(' + ringY + 'px - 50%))';
    requestAnimationFrame(animateCursorRing);
  }
  animateCursorRing();

  document.querySelectorAll('a, button').forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      cursorDot.classList.add('is-hovering');
      cursorRing.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', function() {
      cursorDot.classList.remove('is-hovering');
      cursorRing.classList.remove('is-hovering');
    });
  });
})();


// "Ver →" label on project card images
// -----------------------------------------------------------------------------
(function initProjectCardLabels() {
  document.querySelectorAll('.project-card__image').forEach(function(img) {
    var label = document.createElement('span');
    label.className = 'project-card__view-label';
    label.textContent = 'Ver →';
    img.appendChild(label);
  });
})();


// Phones carousel — drag to scroll
// -----------------------------------------------------------------------------
document.querySelectorAll('.case-study__phones-track').forEach(track => {
  let isDown = false;
  let startX;
  let scrollLeft;

  track.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => { isDown = false; });
  track.addEventListener('mouseup', () => { isDown = false; });
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });
});
