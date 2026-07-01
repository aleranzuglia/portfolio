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

    window.scrollTo({ top: targetTop, behavior: 'auto' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
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


// Custom cursor — spotlight radial que sigue el mouse
// -----------------------------------------------------------------------------
(function initSpotlightCursor() {
  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: fixed;
    pointer-events: none;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,250,100,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    z-index: 9999;
    transition: opacity 0.3s ease;
    opacity: 0;
  `;
  document.body.appendChild(spotlight);

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    spotlight.style.opacity = '1';
  });

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    spotlight.style.left = currentX + 'px';
    spotlight.style.top = currentY + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
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
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    preview.style.left = (mouseX + 24) + 'px';
    preview.style.top = (mouseY - 80) + 'px';
  });
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


(function initRotatingText() {
  const el = document.querySelector('.hero__rotating');
  if (!el) return;
  const words = ['Branding','Packaging','Web design','UX/UI','Frontend'];
  let i = 0;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes wordSlideIn {
      from { transform: translateY(110%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .hero__rotating {
      display: inline-block;
      overflow: visible;
      vertical-align: bottom;
      padding-bottom: 0.15em;
    }
    .hero__rotating.is-animating {
      animation: wordSlideIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
    }
  `;
  document.head.appendChild(style);
  function next() {
    el.classList.remove('is-animating');
    void el.offsetWidth;
    i = (i + 1) % words.length;
    el.textContent = words[i];
    el.classList.add('is-animating');
  }
  el.classList.add('is-animating');
  setInterval(next, 2200);
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
