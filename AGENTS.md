# Chiv Heng Consulting Website

> **Single source of truth for agent rules.** Codex reads this file directly; Claude Code loads it
> through the `@AGENTS.md` import in `CLAUDE.md`. Edit project rules here, not in `CLAUDE.md`.

Fractional COO/CTO consulting site for K-12 schools and mission-driven nonprofits. Single-page static site.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Deploy

Hosted on Vercel via its GitHub integration (repo `chiv-heng/chivheng-consulting-website`).

- Push to `main` triggers a production deploy.
- Branches and PRs get preview deploys.
- No GitHub Actions workflow and no local Vercel CLI link (`.vercel/`); builds run on Vercel from the Git push.
- `vercel.json` sets relaxed frame headers (`X-Frame-Options: ALLOWALL`, permissive `frame-ancestors` CSP) on `/example-ai-advisory-dashboard.html` so it can be embedded in an iframe.

## Key Files

- `index.html` — All page content (single-page site)
- `src/style.css` — All styling
- `src/main.js` — Scroll animations + mobile nav
- `vercel.json` — Deployment config

## Design

- **Colors:** Navy (#2B4C7E) + Gold (#D4A84B), warm cream backgrounds
- **Fonts:** Outfit (headings), Inter (body)
- **Integrations:** Formspree (interest form), TidyCal (scheduling)

## Node

Requires Node >= 22.
