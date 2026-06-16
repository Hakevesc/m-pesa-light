# Figma → HTML Exporter

A Figma plugin that turns a selected frame into **clean, optimised HTML + CSS** — the
reverse of [`figma-export.js`](../figma-export.js) (which goes HTML → Figma).

Its main job is to fight the mess that builds up while designing: deeply nested
wrapper frames, groups that exist only to hold a selection, and auto-layouts that
were turned on but wrap a single child. It flattens all of that, then emits tidy
markup with de-duplicated classes and colours mapped back to your design tokens.

## Install (local / development)

1. Open the Figma **desktop app** (browser Figma can't load local plugins).
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Select `figma-to-html/manifest.json` from this project.
4. Run it from **Plugins → Development → Figma → HTML Exporter**.

## Use

1. Select a frame (or several). Leave nothing selected to export the whole page.
2. Pick your clean-up / output options.
3. **Export to HTML** → review the HTML / CSS tabs → **Copy** or **Download**.

The status line reports how much was removed, e.g.
`182 nodes → 47 elements (74% leaner) · 31 CSS classes`.

## Options

| Option | What it does |
| --- | --- |
| **Simplify junky frames** | Unwraps frames/groups with no styling of their own. Single-child wrappers collapse into their child; pure positioning groups are hoisted into the parent (coordinates re-based). |
| **Strip purposeless auto-layout** | An auto-layout wrapping 0–1 children does nothing in CSS, so it's demoted to a plain block (padding dropped with it). |
| **De-duplicate styles into classes** | Elements with identical styles share one class instead of repeating declarations. |
| **Snap colours to design tokens** | Colours that match `styles/design-tokens.css` become `var(--Primary)` etc., emitted in a `:root` block. |
| **Inline styles instead of classes** | Writes `style="…"` on each element (overrides de-dup). |
| **Separate HTML + CSS files** | Links an external `style.css` instead of inlining a `<style>` block. |

## How it maps Figma → CSS

- **Auto layout** → flexbox (`direction`, `gap`, `justify-content`, `align-items`, padding).
- **Sizing** — Fixed → `px`, Hug → content-sized, Fill → `flex: 1` (main axis) / `align-self: stretch` (cross axis).
- **Non-auto-layout frames** → `position: relative` with absolutely-positioned children (`left`/`top` from the layer's x/y).
- **Fills** → solid colours, linear/radial/conic gradients (gradients are approximated); **image fills** export as embedded PNG data URIs.
- **Strokes** → `border`; **corner radius** → `border-radius` (ellipses → `50%`).
- **Effects** → drop/inner shadow → `box-shadow`; layer blur → `filter`; background blur → `backdrop-filter`.
- **Text** → `<p>` with font family/size/weight, colour, line-height, letter-spacing, alignment, case & decoration.
- **Vectors / icons** (`VECTOR`, `STAR`, `POLYGON`, `LINE`, boolean ops) → inline `<svg>`.

## Known limitations

- Gradient **angles** are approximated from the gradient transform.
- Mixed-style text runs collapse to the first run's style (one paragraph per text node).
- Blend modes, masks, and component variants aren't translated.
- Output favours pixel-accurate reproduction of the frame over responsive design;
  tidy up sizing for production breakpoints as needed.

## Files

| File | Role |
| --- | --- |
| `manifest.json` | Plugin manifest (entry points). |
| `code.js` | Main thread — traversal, simplification passes, HTML/CSS generation. |
| `ui.html` | Plugin panel — options, output tabs, copy/download. |
