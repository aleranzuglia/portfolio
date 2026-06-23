# CLAUDE.md — Portfolio de Ale

> Este archivo es la memoria persistente del proyecto para Claude Code.
> Leé esto antes de tocar cualquier archivo.

## Proyecto

Portfolio profesional de Alejandra — diseñador UX/UI y desarrollador front-end.
Stack: HTML + SCSS vanilla. Deployment: GitHub Pages / Netlify.
Sin frameworks JS. Sin dependencias de build complejas.
Fuentes: Barlow Condensed + Cutive Mono via Google Fonts (preconnect + font-display:swap).

## Arquitectura de archivos

```
portfolio/
├── index.html                 # única página (SPA-like con JS)
├── scss/
│   ├── _tokens.scss           # custom properties — ÚNICA fuente de verdad
│   ├── _reset.scss            # reset minimalista
│   ├── _typography.scss       # escala tipográfica
│   ├── _layout.scss           # grid, contenedor, secciones
│   ├── _components.scss       # project cards, nav, botones, tags
│   └── main.scss              # @forward de todo, sin lógica
├── js/
│   └── main.js                # scroll reveal, nav active state
├── assets/
│   ├── images/                # WebP, max 200kb por imagen
│   └── icons/                 # SVG inline (no icon font)
└── CLAUDE.md                  # este archivo
```

## Tokens de diseño (fuente canónica)

```scss
// _tokens.scss
:root {
  // Colores
  --color-ink:    #0F0F0F;
  --color-paper:  #F5F4F0;
  --color-stone:  #ECEAE4;
  --color-slate:  #6B6B6B;
  --color-charge: #C8FA64;   // acento — máximo 2-3 usos por página

  // Tipografía
  // --font-heading: Barlow Condensed — display e headings (cargada via Google Fonts)
  // --font-body:    Cutive Mono — body, labels, eyebrows, captions (cargada via Google Fonts)
  --font-heading: 'Barlow Condensed', sans-serif;
  --font-body:    'Cutive Mono', monospace;

  // Roles tipográficos
  // h1 hero:        --font-heading, weight 700, clamp(2.8rem, 7vw, 4.5rem), ls -0.01em, lh 1.0
  // h2 sección:     --font-heading, weight 700, 1.875rem (30px), ls -0.005em, lh 1.05
  // h3 subsección:  --font-heading, weight 600, 1.125rem (18px), ls 0.01em,  lh 1.15
  // body:           --font-body,    weight 400, 0.8125rem (13px), ls normal,  lh 1.8
  // eyebrow/label:  --font-body,    weight 400, 0.6875rem (11px), ls 0.10em, uppercase
  // caption/meta:   --font-body,    weight 400, 0.6875rem (11px), ls 0.06em, lh 1.6
  // nav logo:       --font-heading, weight 700, 1.125rem (18px),  ls 0.04em

  // Escala tipográfica
  --text-xs:   0.6875rem;              // 11px — eyebrows, captions, meta
  --text-sm:   0.8125rem;              // 13px — body text
  --text-base: 1rem;                   // 16px — body largo / intro
  --text-lg:   1.125rem;               // 18px — h3, nav logo
  --text-xl:   1.875rem;               // 30px — h2 de sección
  --text-2xl:  clamp(2rem, 4vw, 2.5rem);  // 32–40px — h1 interior
  --text-3xl:  clamp(2.8rem, 7vw, 4.5rem); // 45–72px — h1 hero

  // Pesos (Barlow Condensed disponible: 500, 600, 700)
  // --weight-heading-hero:    700
  // --weight-heading-section: 700
  // --weight-heading-sub:     600
  // --weight-heading-nav:     700

  // Espaciado (base 4px)
  --space-1:  4px;   --space-2:  8px;   --space-3:  12px;
  --space-4:  16px;  --space-6:  24px;  --space-8:  32px;
  --space-12: 48px;  --space-16: 64px;
  --space-24: 96px;  --space-32: 128px;

  // Layout
  --max-width: 1200px;
  --gutter: clamp(1.5rem, 5vw, 4rem);

  // Transiciones
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
}
```

## Carga de fuentes (head de index.html)

```html
<!-- Siempre primero en <head>, antes de cualquier CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Cutive+Mono&display=swap" rel="stylesheet">
```

`font-display: swap` viene incluido en la URL de Google Fonts con el parámetro `&display=swap`.
No agregar más fuentes a esta URL sin decisión explícita — cada familia agrega latencia.

## _typography.scss — implementación de la escala

```scss
// _typography.scss

h1, .h1 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-3xl);
  line-height: 1.0;
  letter-spacing: -0.01em;
}

h2, .h2 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-xl);
  line-height: 1.05;
  letter-spacing: -0.005em;
}

h3, .h3 {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--text-lg);
  line-height: 1.15;
  letter-spacing: 0.01em;
}

body, p, li {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--text-sm);   // 13px — Cutive Mono es ancha, 13px es más cómodo que 16px
  line-height: 1.8;
}

.eyebrow {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--color-slate);
  display: block;
  margin-bottom: var(--space-3);
}

.caption, figcaption {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  line-height: 1.6;
  letter-spacing: 0.04em;
  color: var(--color-slate);
}

// Nota sobre ancho de columna de texto:
// Cutive Mono es ~30% más ancha que una sans equivalente.
// El max-width recomendado para columnas de body es 560px (no 680px como en sans).
// En el grid de 12 cols, el body de case study va a 7/12, no 8/12.
```

```scss
// Bloque
.project-card { }

// Elemento
.project-card__title { }
.project-card__eyebrow { }   // label mono uppercase
.project-card__image { }

// Modificador
.project-card--featured { }
.project-card--case-study { }
```

Prefijos de utilidad permitidos:
- `.u-` — utilidades globales (`.u-sr-only`, `.u-truncate`)
- `.js-` — hooks de JavaScript (no llevan estilos)
- `.is-` / `.has-` — estados (`.is-active`, `.has-loaded`)

## Estructura de secciones (HTML semántico)

```html
<header class="site-header">          <!-- nav fijo -->
<main>
  <section class="hero">              <!-- nombre + tagline + CTA -->
  <section class="projects">         <!-- grid de casos -->
  <section class="about">            <!-- perfil + skills -->
  <section class="contact">          <!-- CTA de contacto -->
</main>
<footer class="site-footer">
```

## Componente: eyebrow (firma del sistema)

Cada sección empieza con un label en mono uppercase antes del título h2.

```html
<span class="eyebrow">UX/UI · 2024 · Figma + React</span>
<h2 class="section-title">Proyectos</h2>
```

```scss
.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-slate);
  display: block;
  margin-bottom: var(--space-3);
}
```

## Proyectos del portfolio

### App Formosa V2
- Disciplina: UX/UI
- Herramientas: Figma, investigación UX, prototipo
- Ángulo: diseño en contexto gubernamental con constraints reales
- Assets: capturas de Figma, diagrama de flujo

### Ranzuglia SRL
- Disciplina: web design
- Herramientas: Figma Make, HTML/SCSS
- Ángulo: criterio sobre cuándo y cómo usar IA en diseño web
- URL referencia: [pendiente — repo GitHub]

### Branding + packaging
- Disciplina: diseño gráfico
- Herramientas: Illustrator, Figma
- Ángulo: sistema visual aplicado a producto físico — identidad que trasciende la pantalla

### Branding canal de streaming
- Disciplina: diseño gráfico
- Herramientas: Illustrator, After Effects
- Ángulo: coherencia de sistema en piezas dinámicas y estáticas

## Credenciales (About, sin case study)

- **CTI Latam** — layout designer en producción, componentes React/Tailwind en arquitectura MFE. Evidencia de trabajo real en código, no solo diseño.
- **InHub DS** — contribuidor de implementación (estilos, tokens). No autor del sistema — no presentar como tal.

## Reglas de desarrollo

1. **Cero dependencias de runtime.** No jQuery, no GSAP (a menos que se justifique). Animaciones en CSS.
2. **Google Fonts con preconnect obligatorio.** Cargar solo Barlow Condensed (wght@500;600;700) y Cutive Mono. Siempre con `font-display: swap`. No agregar otras fuentes sin decisión explícita.
3. **Imágenes en WebP**, max 200kb. Siempre con `width` y `height` para evitar CLS.
4. **SVGs inline** para íconos — nunca `<img>` para SVG decorativo.
5. **SCSS compilado** con `sass --watch scss/main.scss:css/main.css`
6. **JavaScript al final del body** o con `defer`. Nada que bloquee render.
7. **Responsive mobile-first.** Breakpoints: 640px, 1024px, 1280px.
8. **Accesibilidad básica**: focus visible, alt texts, contraste AA mínimo.

## Comandos frecuentes

```bash
# Compilar SCSS en watch mode
sass --watch scss/main.scss:css/main.css --style=compressed

# Servidor local
npx serve . -p 3000

# Deploy a GitHub Pages
git push origin main
# (GitHub Actions compila y pushea a gh-pages)
```

## Estado del proyecto

- [ ] Estructura base HTML/SCSS
- [ ] Tokens implementados en _tokens.scss
- [ ] Sección Hero
- [ ] Grid de proyectos
- [ ] Case study: App Formosa
- [ ] Case study: Ranzuglia y Nexum org
- [ ] Case study: Branding
- [ ] Sección About
- [ ] Sección Contact
- [ ] Deploy en GitHub Pages
- [ ] Dominio custom (opcional)

## Lo que NO hacer

- No inventar tokens fuera de `_tokens.scss`
- No agregar clases de utilidad sin prefijo `.u-`
- No usar `!important` (excepto en reset)
- No animar `width`, `height`, `top`, `left` — solo `transform` y `opacity`
- No cargar fuentes de Google Fonts
- No poner lógica en `main.scss` — solo `@forward`
