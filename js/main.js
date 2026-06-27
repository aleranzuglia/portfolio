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
