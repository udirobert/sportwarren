# SportWarren Design Tokens & Visual Hierarchy

## Color System

These tokens are also published as a Figma variable collection in the
[**SportWarren — Moment Cards**](https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ)
library, so design and code share the same source of truth. See
[`docs/makeathon/REPRODUCE.md`](makeathon/REPRODUCE.md) for how the
binding is maintained.

### Semantic Colors (CSS Custom Properties)
Defined in `src/app/globals.css` and mapped to Tailwind in `tailwind.config.js`.

| Token | Light Value | Dark Value | Usage |
|-------|------------|------------|-------|
| `--primary` | Green-600 | Green-600 | Brand color, primary actions, active states |
| `--success` | Green-600 | Green-600 | Verified matches, confirmations, positive stats |
| `--warning` | Amber-500 | Amber-500 | Pending actions, verification warnings, expiring sessions |
| `--destructive` | Red-500 | Red-500 | Errors, cancellations, dangerous actions |
| `--background` | White | Gray-950 | Page background |
| `--foreground` | Gray-950 | White | Primary text |
| `--card` | White | Gray-950 | Card backgrounds |
| `--card-foreground` | Gray-950 | White | Card text |
| `--muted` | Gray-100 | Gray-850 | Subtle backgrounds, disabled states |
| `--border` | Gray-200 | Gray-850 | Card borders, dividers |
| `--ring` | Green-600 | Green-600 | Focus rings |

### Game/Status Colors
- **Team Home**: Emerald (`--team-home: 142 76% 36%`)
- **Team Away**: Red (`--team-away: 0 84% 60%`)
- **XP Gold**: Amber (`--xp-gold: 38 92% 50%`)

### Dark Mode
Toggled via `.dark` class on `<html>`. All components must support `dark:` variants.

---

## Typography

### Font Family
**Primary Font**: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (variable weight 300–700)
- Loaded via `next/font/google` in `src/app/layout.tsx` as a CSS variable `--font-space-grotesk`
- Applied globally via `globals.css`: `font-family: var(--font-space-grotesk), system-ui, sans-serif`
- Chosen for its geometric, distinctive letterforms — intentionally different from Inter/Arial to avoid "generic AI" aesthetics

**Why not Inter/Segoe/System?**
Inter and system fonts are overused in AI-generated UIs. Space Grotesk gives a sport-tech character that aligns with the brand. If a specific component needs a different font (e.g., monospace for data), use `font-mono`.

### Scale (from tailwind.config.js)
| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| `xs` | 0.75rem | 1rem | Labels, metadata, timestamps |
| `sm` | 0.875rem | 1.25rem | Body text, descriptions |
| `base` | 1rem | 1.5rem | Default body |
| `lg` | 1.125rem | 1.75rem | Feature text |
| `xl` | 1.25rem | 1.75rem | Section titles |
| `2xl` | 1.5rem | 2rem | Page headings |
| `3xl` | 1.875rem | 2.25rem | Hero headings |
| `4xl` | 2.25rem | 2.5rem | Landing page hero |

### Section Headers
- `.section-title`: `text-[10px] font-black uppercase tracking-widest text-gray-400` — subtle labels
- `.section-kicker`: `inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest` — prominent pill labels, used with contextual bg colors

Use `section-kicker` for section headers across all pages, not just match. Customize via `bg-* text-*` classes.

---

## Layout

### Page Shell
Use `<PageShell>` from `src/components/common/PageShell.tsx` for all page layouts.

```tsx
<PageShell maxWidth="6xl" className="space-y-6">
  {children}
</PageShell>
```

| Prop | Default | Options | Notes |
|------|---------|---------|-------|
| `maxWidth` | `"6xl"` | `"2xl"`, `"4xl"`, `"6xl"` | Narrower widths for detail/gated states |
| `className` | — | any | Add `space-y-*` for vertical rhythm |

PageShell enforces:
- `<main>` semantics for accessibility
- `max-w-6xl mx-auto px-4 py-6` (or chosen width)
- `nav-spacer-top nav-spacer-bottom` for navigation clearance
- `text-gray-900 dark:text-gray-100` for consistent color

### Width Conventions
| maxWidth | Used For |
|----------|----------|
| `6xl` | Primary content (match, squad, reputation, analytics, community) |
| `4xl` | Detail pages (stats, settings, leaderboard), gated states |
| `2xl` | Empty states, locked states (single card) |

### Padding
- **Standard**: `px-4 py-6` (set by PageShell)
- All page wrappers use `nav-spacer-top nav-spacer-bottom` for navigation clearance

---

## Component Patterns

### Cards
Use `<Card>` from `src/components/ui/Card` for **content sections** with dense information. Never use Card as a page-level wrapper or as the default container for every section.

**Anti-patterns to avoid ("AI slop" guardrails):**
- ❌ Uniform grids of identical Cards with borders/shadows + white backgrounds
- ❌ Wrapping every list item, stat, or section in a `<Card>`
- ❌ Using Card as the default approach for new sections

**Preferred alternatives:**
- **Stats/metrics**: Use a `stat-ribbon` pattern (gradient background, grid cells with light dividers) instead of a grid of Cards — see the squad page overview tab
- **List items**: Use `bg-white/[0.02] border border-white/[0.06]` with hover states instead of wrapping each item in `<Card>` — see `SquadMomentsGallery` list items
- **Empty states**: Use an atmospheric gradient container (`bg-gradient-to-br from-...`) with subtle overlays instead of a `<Card>` wrapper — see `SquadMomentsGallery` empty state
- **Featured sections**: Use full-width gradient banners with grid overlays instead of Card containers — see the HeroSection on the landing page

**When to use `<Card>`:**
- Information-dense content panels (forms, detail views, settings)
- Content that needs clear separation from surrounding elements
- When the default white/slate-900 background with border is appropriate for the context

### Loading States
Every route should have a `loading.tsx` with:
1. **SoccerLoader** component with contextual loading text
2. **Skeleton** variants matching the page layout

| Skeleton Variant | Dimensions | Usage |
|-----------------|------------|-------|
| `default` | Custom via className | Buttons, badges, custom shapes |
| `text` | Full width, ~1em height | Paragraph lines |
| `text-sm` | 3/4 width, ~0.875em height | Shorter text lines |
| `card` | Card-shaped placeholder | Card skeletons |
| `avatar` | Large circle | Profile images |
| `avatar-sm` | Small circle | List avatars, team members |
| `stat` | Inline stat value | Stat cards, numbers |

Loading pattern:
```tsx
<div className="flex items-center gap-3 px-2 mb-2">
  <SoccerLoader size={20} />
  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
    Contextual Loading Message
  </span>
</div>
```

---

## Navigation Spacing

| Variable | Mobile | Desktop |
|----------|--------|---------|
| `--nav-height-*` | 3.5rem | 4rem |
| `--bottom-nav-height` | 3.25rem | — |
| `--safe-area-bottom` | `env(safe-area-inset-bottom)` | 0 |

Use `.nav-spacer-top` and `.nav-spacer-bottom` classes on page wrappers (handled by PageShell).

---

## Mobile-Specific Utilities

| Utility | Purpose |
|---------|---------|
| `touch-manipulation` | Disables double-tap zoom, enables 300ms tap delay removal |
| `btn-mobile` | 44px min-height touch target |
| `input-mobile` | 44px min-height form inputs |
| `text-mobile-*` | Optimized text sizes for small screens |
| `card-mobile` | White background, rounded-xl, border, shadow-sm |

---

## Animation

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `fade-in` | 0.5s | ease-in-out | Page transitions, reveal elements |
| `slide-up` | 0.3s | ease-out | Modals, panels appearing from below |
| `slide-down` | 0.3s | ease-out | Dropdowns, banners |
| `bounce-gentle` | 2s | infinite | Loading indicators |
| `pulse-slow` | 3s | infinite | Skeleton loaders |

---

## Visual Hierarchy Guidelines

1. **Page shells**: Always use `PageShell` — provides consistent `<main>`, width, padding, nav spacing
2. **Section headers**: Use `section-kicker` for labeled sections; customize background/text colors per context
3. **Content cards**: Wrap related content in `<Card>` — never use Card as page wrapper
4. **Loading states**: Every route needs a `loading.tsx` with SoccerLoader + matching skeleton layout
5. **Journey gating**: Gated states use `JourneyGateCard` with `maxWidth="4xl"` centered layout
6. **Error boundaries**: Wrap component trees in `TrpcErrorBoundary` for resilience
7. **Dark mode**: All color choices must have `dark:` variants — no hardcoded light colors
