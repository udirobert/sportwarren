# SportWarren Design System — Figma Binding Cheatsheet

Source of truth: `docs/DESIGN_TOKENS.md`. This file is the operational
shorthand for binding Figma generations to SportWarren tokens.

## Typography
- **Font family:** Space Grotesk (variable 300–700). Do NOT use Inter.
- **Hero label:** 28–48px, Bold (700), tight tracking
- **Detail body:** 15–18px, Regular (400), 1.5 line height
- **Kicker pill:** 10–11px, Black (900), uppercase, widest tracking
- **Footer meta:** 12px, Semibold (600)

## Semantic colors (use these names in Figma variables)
| Figma variable | Light | Dark | Use in cards |
|----------------|-------|------|--------------|
| `color/primary` | `#16a34a` (green-600) | `#16a34a` | Active states, kicker accents on emerald archetypes |
| `color/success` | `#16a34a` | `#16a34a` | `achievement`, streak tier ornament |
| `color/warning` | `#f59e0b` (amber-500) | `#f59e0b` | `level_up` archetype, expiring sessions |
| `color/destructive` | `#ef4444` (red-500) | `#ef4444` | `record_broken` archetype |
| `color/background` | `#ffffff` | `#0a0a0a` (gray-950) | Card surface |
| `color/foreground` | `#0a0a0a` | `#ffffff` | Primary text |
| `color/muted` | `#f3f4f6` | `#1f2937` (gray-850) | Subtle backgrounds, dividers |
| `color/border` | `#e5e7eb` | `#1f2937` | Card divider, footer rule |
| `color/team-home` | `#1f9d52` (emerald 142 76% 36%) | same | Sim/match archetypes |
| `color/team-away` | `#dc2626` (red 0 84% 60%) | same | Sim/match archetypes |
| `color/xp-gold` | `#f59e0b` (amber 38 92% 50%) | same | `season_end`, premium tier ornament |

Cards default to **dark surface** because the existing renderer targets dark
PNGs that look good in social/share contexts. Light variants are secondary.

## Card frame
- **Size:** 600 × 400 (match satori output)
- **Padding:** 32px on all sides (matches current renderer)
- **Corner radius:** 16px (matches current renderer)
- **Surface treatment:** archetype-specific. Default to a solid `color/background`
  dark fill plus an archetype motif layer. Do NOT default to a 135deg
  gradient — that's the slop pattern we're replacing.

## Tier ornament layer
A separate variant layer applied on top of any kind:
- `standard` — no ornament
- `premium` — 1px `color/xp-gold` border + 8% gold glow on top edge
- `streak_reward` — emerald 8% pulse on top-right corner + "STREAK" pip in
  footer
- `partner` — empty partner-logo slot (240×60) in footer right
- `internal` — small "INT" pip in footer left, all colors at 85% saturation

## Type scale → Figma text styles
Mirror `tailwind.config.js` so the Figma library shares names with the code:
- `text/xs` (12px / 16) — footer meta
- `text/sm` (14px / 20) — body detail
- `text/base` (16px / 24) — body
- `text/lg` (18px / 28) — feature text
- `text/xl` (20px / 28) — section titles
- `text/2xl` (24px / 32) — secondary heroes
- `text/3xl` (30px / 36) — primary heroes for most archetypes
- `text/4xl` (36px / 40) — `record_broken` hero size

## What NOT to bind
Do not bind to literal hex values inline. If a token doesn't exist for what
you need, create a new Figma variable under the `color/`, `text/`, or `space/`
namespace and document it in the build log — don't paint with raw values.

## Mobile / cross-channel notes
The same component will also be embedded in:
- Telegram Mini App (renders in Telegram's webview)
- WhatsApp share previews (OpenGraph image)
- Web dashboard (next/image)

All three contexts render the PNG output of satori. So the Figma component is
upstream of all three — design once, the channels consume the same PNG.
