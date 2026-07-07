# Ada Lovelace — Tribute Page (Enhanced)

A tribute page for Ada Lovelace, the first computer programmer, built with HTML, CSS, and a touch of vanilla JavaScript for scroll-driven animation.

## Features
- Hero with headline, tagline, and a hand-built SVG illustration (interlocking gears + punch-card motif) that responds to mouse movement with a subtle parallax
- Biography section: 4 original paragraphs on her life and contribution
- Timeline section: 6 key milestones, each animating in with a staggered cascade as you scroll
- **New: "Did You Know?" flip cards** — click any card to flip it over (real 3D CSS flip) and reveal a fact
- Distinct styled quote block
- Scroll-reveal animations throughout, built with `IntersectionObserver` — content is fully visible with JavaScript disabled (progressive enhancement, not a requirement)
- Two background colours (parchment / near-black) and two font families (Fraunces for display, Source Sans 3 for body)
- Fully responsive, smooth-scroll anchor navigation
- All motion respects `prefers-reduced-motion`

## File structure
```
WebDev-L2-TributePage/
├── index.html
├── css/style.css
├── js/animations.js
└── README.md
```

## Run it
Open `index.html` directly in a browser. Google Fonts load via CDN — an internet connection is needed for the exact typefaces, but the page degrades gracefully to system fonts if offline.

## Why no real photograph?
Ada Lovelace's portraits are historical paintings from the 1830s-40s. To keep this project 100% self-contained and guaranteed not to show a broken image (a real risk with hotlinked third-party URLs), the hero uses an original SVG illustration instead of an external portrait. If you'd like to add a real portrait, the public-domain Margaret Carpenter portrait (1836) on Wikimedia Commons is a good, freely licensed choice — just download it into an `img/` folder and reference it locally.

## Content sourcing
Biographical content was written from general historical knowledge of Ada Lovelace's life and paraphrased in original wording.
