# ApplyFit Design System

## 1. Atmosphere & Identity

ApplyFit feels like a focused, professional workspace: calm, trustworthy, and quietly confident.
The signature is **clarity through restraint** — generous whitespace, a single blue accent that guides action,
and a clear typographic hierarchy that keeps the candidate's attention on their content rather than the interface.
Surfaces are soft and layered with subtle borders; motion is quick and purposeful.

## 2. Color

### Palette

| Role | Token | Light | Usage |
|------|-------|-------|-------|
| Surface/primary | --color-surface | #FFFFFF | Main backgrounds |
| Surface/secondary | --color-surface-elevated | #FAFBFD | Elevated panels, hover rows |
| Surface/page | --color-background | #EEF1F6 | Page body background |
| Surface/dark | --color-dark | #101826 | Dark cards, inverted sections |
| Text/primary | --color-text | #101826 | Headings, primary body text |
| Text/secondary | --color-text-secondary | #5B6678 | Descriptions, metadata |
| Text/muted | --color-text-muted | #6B7689 | Placeholders, hints |
| Text/light | --color-text-light | #9AA4B2 | Disabled, subtle labels |
| Text/inverse | --color-text-inverse | #FFFFFF | Text on dark surfaces |
| Border/default | --color-border | #E1E6EF | Cards, dividers, inputs |
| Border/light | --color-border-light | #EDF0F5 | Subtle separations |
| Border/hover | --color-border-hover | #CBD5E6 | Interactive hover borders |
| Accent/primary | --color-primary | #2F6BFF | CTAs, links, active states |
| Accent/primary-dark | --color-primary-dark | #1A4FD8 | Hover/active accent |
| Accent/primary-light | --color-primary-light | #5B8FFF | Focus rings, highlights |
| Accent/primary-surface | --color-primary-surface | #F4F8FF | Tinted info backgrounds |
| Accent/primary-border | --color-primary-border | #DCE8FF | Tinted info borders |
| Status/success | --color-success | #16A34A | Pass, success messages |
| Status/success-bg | --color-success-bg | rgba(22, 163, 74, 0.1) | Success tinted backgrounds |
| Status/warning | --color-warning | #D98A00 | Warnings |
| Status/warning-bg | --color-warning-bg | #FFFBEB | Warning tinted backgrounds |
| Status/warning-border | --color-warning-border | #FEF3C7 | Warning borders |
| Status/danger | --color-danger | #E5484D | Errors, destructive actions |
| Status/danger-bg | --color-danger-bg | #FEF2F2 | Error tinted backgrounds |

### Rules
- Use the primary blue ONLY for interactive elements and key metrics.
- Status colors communicate meaning; do not use them decoratively.
- Keep surfaces layered through subtle borders and background shifts, not heavy shadows.

## 3. Typography

### Scale

| Level | Token | Size | Weight | Line Height | Usage |
|-------|-------|------|--------|-------------|-------|
| Display | --fs-8xl | 52px | 700 | 1.1 | Marketing hero (rare) |
| H1 | --fs-7xl | 36px | 700 | 1.15 | Page title |
| H2 | --fs-6xl | 30px | 700 | 1.2 | Section title |
| H3 | --fs-5xl | 26px | 700 | 1.25 | Card/page header |
| H4 | --fs-4xl | 24px | 700 | 1.3 | Subsection headline |
| H5 | --fs-3xl | 19px | 600 | 1.35 | Small headline |
| H6 | --fs-2xl | 17px | 600 | 1.4 | Label-like titles |
| Body/lg | --fs-lg | 15px | 400 | 1.6 | Lead body text |
| Body | --fs-body | 13px | 400 | 1.5 | Default body text |
| Body/sm | --fs-sm | 11px | 400 | 1.5 | Secondary info |
| Caption | --fs-xs | 10.5px | 500 | 1.4 | Metadata, timestamps |
| Overline | --fs-base | 12px | 600 | 1.3 | Uppercase labels |

### Font Stack
- Primary body: 'IBM Plex Sans', system-ui, sans-serif
- Display/headings: 'Space Grotesk', system-ui, sans-serif
- Monospace/data: 'IBM Plex Mono', ui-monospace, monospace

### Rules
- Headlines use `Space Grotesk` for presence and tighter letter-spacing.
- Body text stays at 13px minimum; lead paragraphs may use 15px.
- Use `font-variant-numeric: tabular-nums` for scores, percentages, and tabular data.

## 4. Spacing & Layout

### Base Unit

The base spacing unit is **4px**. All spacing tokens derive from it.

| Token | Value | Usage |
|-------|-------|-------|
| --space-4 | 4px | Micro gap |
| --space-6 | 6px | Tight inline groups |
| --space-8 | 8px | Default inline gaps |
| --space-12 | 12px | Form field padding |
| --space-16 | 16px | Card padding, section inner spacing |
| --space-20 | 20px | Comfortable card padding |
| --space-24 | 24px | Between card groups |
| --space-28 | 28px | Section separations |
| --space-36 | 36px | Major section breaks |
| --space-48 | 48px | Page-level vertical rhythm |
| --space-60 | 60px | Hero spacing |
| --space-70 | 70px | Maximum separation |

### Grid
- Max content width: 1280px
- Page layout: two-pane dashboard with a collapsible sidebar and a main content area
- Breakpoints: sm 640px, md 768px, lg 1024px, xl 1280px

### Rules
- Avoid magic numbers; prefer the existing spacing scale.
- Dashboard panes use fixed sidebar width (~220px) with a fluid main area.
- Cards sit on the page background; do not make the whole page pure white.

## 5. Components

### Card
- **Structure**: `.card`, `.card-lg`, `.card-dark`, `.card-accent`, `.card-warning`
- **Variants**: default white card, large white card, dark inverted card, tinted accent card, warning callout
- **Spacing**: padding 20px–26px; border-radius --radius-xl (14px)
- **States**: default, hover (border-color shift), active
- **Accessibility**: semantic heading order inside cards
- **Motion**: background/border transitions use --transition-base

### Button
- **Structure**: `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- **Variants**: filled primary, outlined secondary, text ghost
- **Spacing**: padding 9px 16px; border-radius --radius-md (9px)
- **States**: default, hover (background darken), active (scale 0.98), focus (ring)
- **Accessibility**: focus-visible outline, disabled state
- **Motion**: 150ms ease background transitions

### Input / Textarea
- **Structure**: `.input`, `.textarea`
- **Spacing**: padding 10px 14px; border-radius --radius-md
- **States**: default, hover (border-hover), focus (primary border + ring), error (danger border)
- **Accessibility**: label association, aria-invalid on error

### Progress / Gauge
- **Structure**: `.confidence-bar`, `.plan-progress`, SVG gauge arcs
- **States**: default, animated fill
- **Motion**: width transitions and stroke-dashoffset transitions use --transition-gauge

### Badge
- **Structure**: `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`
- **Spacing**: padding 4px 8px; border-radius --radius-full
- **Usage**: status chips, ATS verdicts, score labels

## 6. Motion & Interaction

### Timing

| Type | Token | Duration | Easing | Usage |
|------|-------|----------|--------|-------|
| Micro | --transition-fast | 150ms | ease | Button press, toggles |
| Standard | --transition-base | 200ms | ease | Border, background, color |
| Slow | --transition-slow | 300ms | ease | Panel reveals, larger transitions |
| Gauge | --transition-gauge | 1.1s | cubic-bezier(0.2, 0.7, 0.2, 1) | Score gauges, progress bars |

### Rules
- Animate only `transform`, `opacity`, and `filter` for GPU-composited motion.
- Avoid animating layout properties (width, height, top, left).
- Respect `prefers-reduced-motion`: disable non-essential animations for users who request reduced motion.
- Every interactive element has visible hover, active, and focus states.

## 7. Depth & Surface

### Strategy
**Mixed**: subtle borders are the primary separation, with soft shadows reserved for elevated elements and floating panels.

| Level | Token | Value | Usage |
|-------|-------|-------|-------|
| Subtle | --shadow-sm | 0 1px 2px rgba(16,24,38,0.25) | Buttons at rest, small controls |
| Default | --shadow-md | 0 4px 12px rgba(16,24,38,0.08) | Elevated cards, dropdowns |
| Prominent | --shadow-lg | 0 8px 24px rgba(16,24,38,0.12) | Modals, popovers |
| Floating | --shadow-xl | 0 12px 40px rgba(16,24,38,0.18) | Toasts, command palettes |

### Rules
- Prefer borders and background shifts for hierarchy.
- Use shadows sparingly to avoid a heavy interface.
- Dark cards (`--color-dark`) invert the shadow tint for cohesion.
