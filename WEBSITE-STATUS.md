# Chiv Heng Consulting Website - Status & Next Steps

## What We Built

A single-page website for Chiv Heng Consulting positioned as a **fractional COO/CTO partner** for K-12 schools and nonprofits. The site emphasizes partnership over transactional consulting, with messaging centered on people and mission rather than technology for its own sake.

### Site Structure
1. **Header** — Logo (cropped), nav links, "Let's Talk" CTA
2. **Hero** — "From chaos to clarity. Together." + fractional partner positioning
3. **Who This Is For** — 4 qualifier cards helping visitors self-select
4. **How I Partner** — 3-step approach (Listen & Learn → Build Together → Transfer & Step Back)
5. **Where I Can Help** — 3 focus areas (Systems & Data, Team Capacity, AI & Practical Tech)
6. **What This Looks Like** — Sample work (Systems Data Flow Map) with process description
7. **AI for Nonprofit Leaders** — Featured workshop section
8. **About Chiv** — Bio, experience sidebar, education, and the unalome story
9. **CTA** — TidyCal embed for scheduling + email/LinkedIn
10. **Footer** — Tagline, contact links

### Design Decisions
- **Colors:** Navy (#2B4C7E) + Gold (#D4A84B) from logo, warm cream backgrounds
- **Fonts:** Outfit (headings), Inter (body)
- **Tone:** Warm, approachable, values-driven — technology in service of people and mission
- **No photos yet** — designed to work without headshots for now

### Key Files
- `index.html` — Main page content
- `src/style.css` — All styling
- `src/main.js` — Minimal JS (scroll animations + mobile nav)
- `public/favicon.svg` — Brand favicon (SVG)
- `public/logo-cropped.png` — Trimmed logo
- `public/School System Data Flow.png` — Sample work image (High-res PNG)
- `public/School System Data Flow.svg` — Sample work image (High-res SVG)
- `public/School System Data Flow.pdf` — Sample work image (High-res PDF)

---

## Next Steps for Production

### 1. Hosting Setup
Options to consider:
- **Netlify** (recommended) — Free tier, easy deployment, custom domain support
- **Vercel** — Similar to Netlify
- **GitHub Pages** — Free, requires GitHub repo
- **Squarespace/Webflow** — If you want a CMS later (would require migration)

### 2. Domain Configuration
- You'll need to point `chivheng.consulting` (or your chosen domain) to the hosting provider
- Set up SSL certificate (usually automatic with Netlify/Vercel)

### 3. Build for Production
The current site uses Vite. To create production files:
```bash
npm run build
```
This will generate a `dist/` folder with optimized files to deploy.

**Note:** The node_modules may need reinstallation on a different machine due to platform-specific dependencies.

### 4. Before Launch Checklist
- [x] Replace placeholder testimonials with real quotes (Removed section until data collected)
- [ ] Verify TidyCal booking link works correctly
- [x] Test on mobile devices (Mobile Nav implemented)
- [ ] Add favicon (browser tab icon)
- [ ] Set up Google Analytics or simple analytics (optional)
- [ ] Review meta description for SEO
- [ ] Test all links (email, LinkedIn, calendar)

### 5. Optional Enhancements (Post-Launch)
- Professional headshot when available
- Additional sample work images
- Case studies / detailed project stories
- Blog or resources section
- Contact form as backup to calendar

---

## Current URLs & Links
- **Booking:** https://tidycal.com/chivheng/introductory-call
- **Email:** hello@chivheng.consulting
- **LinkedIn:** https://www.linkedin.com/in/chivheng
- **GitHub:** https://github.com/chiv-heng/chivheng-consulting-website.git

---

*Last updated: January 30, 2025*
