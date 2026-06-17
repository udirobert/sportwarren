# Config Makeathon — Brief & Foundation

## The opportunity
- **Deadline:** Enter by Jun 18, 11:59pm PDT. Winners announced Jun 23 at Config.
- **Prize pool:** $100k total.
  - $50k — Grand Prize (best overall: design, build, impact, craft)
  - $15k — Runner Up (standout working prototype)
  - $10k — Innovative Workflow Award (how you built it; novel design-to-build)
  - $10k — Building with Purpose Award (real problem, real people)
  - $10k — Build-in-Public Award (best process documentation)
  - $5k — Community Favorite (scroll-stopping)

## Hard requirements (must-have to qualify)
1. **Walkthrough video** — explains the problem, the idea, and the workflow used.
2. **Built with Figma's suite** — Make, MCP, Agent, Weave, Local.
3. **Project links** — live project link + community/working file link.
4. **Social post** — Instagram, X, or LinkedIn. Tag #ConfigMakeathon and @figma. REQUIRED to qualify.

## Scoring (additive — chase the free points)
- 5 pts per judging category (work quality, idea quality, video quality, novel use of Figma)
- +5 pts for sharing on social
- +5 pts for sharing to the Figma Community
- Bonus: Community share could get featured on figma.com/community.

## Anchor project
**SportWarren** (this repo). Already live, already real, already shipping. The
makeathon work is a new pipeline plugged into an existing surface — the moment
card renderer in `src/server/services/personalization/moment-render.ts`.

See `concept.md` for the specific intervention.

## Tooling status
- Figma Pro upgrade redeemed via Contra access code → MCP read cap lifted from
  6/month (Starter) to 200/day, 15/min (Pro).
- **10k promotional AI credits expire Jun 19** — use them on the demo build,
  not on iteration. Develop against cached MCP responses where possible.
- Figma MCP server connected at `https://mcp.figma.com/mcp` (HTTP, user scope).
- `whoami` confirms: Papa Jams / papaandthejimjams@gmail.com / Pro tier.

## Strategy
- Lead with **a write-heavy, design-system-aware pipeline** that burns AI
  credits productively (each generated card = a credit spend with a visible
  artifact).
- Anchor in a **real, live product** — SportWarren — so "Building with
  Purpose" isn't theoretical. The Scottish-dads-and-spreadsheet narrative
  carries the video.
- The **bidirectional Figma ↔ code loop** (MCP read code → generate Figma
  library → Code Connect map → swap into satori renderer) targets the
  Innovative Workflow award.
- This log + the in-repo skill (`.claude/skills/sw-moments/`) is itself the
  Build-in-Public artifact — others can clone, run `/sw-moments`, reproduce.
- Always claim the +10 free points (social + community share).

## Sources
- MCP install (Claude Code): https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/#claude-code
- Figma agent: https://www.figma.com/blog/the-figma-agent-is-here/
- Agents + canvas: https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/
- SportWarren docs: `docs/ARCHITECT.md`, `docs/DESIGN_TOKENS.md`
