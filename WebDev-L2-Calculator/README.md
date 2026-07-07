# Slab — Scientific Calculator (Enhanced)

A fully functional calculator built with vanilla HTML, CSS, and JavaScript — now with scientific functions, memory, calculation history, and a light/dark theme.

## Features
- Numeric buttons, decimal point, operators (`+ − × ÷`), operator chaining with correct precedence, no `eval()`
- **Scientific functions:** √x, x², 1/x, ± (sign toggle), %
- **Memory:** MC (clear), MR (recall), M+ (add), M− (subtract) — with an "M" indicator that lights up when memory holds a non-zero value
- **Calculation history:** every evaluated expression is saved (persisted in `localStorage`), click any entry to reuse its result; clear history with one click
- **Copy result** to clipboard with one click
- **Light / dark theme toggle**, remembered across visits
- Division-by-zero and invalid-math (e.g. √ of a negative number, 1/0) handled gracefully with an `Error` display instead of crashing
- Full keyboard support
- Subtle tactile feedback: each key press flashes and the result "pops" when it changes
- Layout via CSS Grid, all interactivity via `addEventListener` — no inline `onclick`

## File structure
```
WebDev-L2-Calculator/
├── index.html
├── css/style.css
├── js/script.js
└── README.md
```

## Run it
Open `index.html` in any browser — no build step, no server required.
