# Chiv Heng Consulting Website - Project Notes

*Last updated: January 30, 2026*

---

## Project Overview

Building a website for Chiv Heng Consulting — a fractional COO/CTO practice serving K-12 schools and nonprofits. The site establishes credibility for referrals beyond word-of-mouth and attracts mission-aligned partners.

### Core Positioning
- **Fractional partner**, not transactional consultant
- Technology in service of **people, community, and mission** — not tech for its own sake
- "Build capacity, not consultant dependency"
- Anti-transactional language: "partner," "embed," "collaborate," "build together"

### Target Audience
- K-12 education leaders and nonprofit leaders (generally smaller orgs, <200 staff)
- People who don't already know Chiv personally
- Mission-aligned organizations

---

## Site Structure (Current)

1. **Header** — Logo (144px cropped), nav (How I Work, Focus Areas, Resources, About), "Let's Talk" CTA
2. **Hero** — "From chaos to clarity. Together." + fractional partner positioning
3. **This might be for you if...** — 4 qualifier cards
4. **How I Partner** — 3-step approach + philosophy quote
5. **Where I Can Help** — 3 focus areas (Systems & Data, Team Capacity, AI & Practical Tech)
6. **What This Looks Like** — Sample work (Systems Data Flow Map) with process explanation
7. **Resources** — Free tools and guides (PowerSchool RI State Reporting, Job Search Tracker)
8. **AI for Nonprofit Leaders** — Featured workshop
9. **About Chiv** — Bio, experience/education sidebar, unalome story
10. **CTA** — TidyCal embed + email/LinkedIn
11. **Footer** — Tagline, contact links

### Removed (for now)
- Testimonials section — will add back once real quotes are collected via survey

---

## Design Decisions

### Colors (from logo)
- Navy: `#2B4C7E`
- Gold: `#D4A84B`
- Cream background: `#FAF8F5`
- White surface: `#FFFFFF`

### Typography
- Headings: Outfit
- Body: Inter

### Visual Approach
- Warm, approachable, clean
- No stock photos
- No professional headshot yet (designed to work without)

---

## Key Content Decisions

### The Unalome Story
Included in About section under "What's the funny symbol in my name?" — explains:
- Name pronunciation ("chew" not "chive")
- First U.S.-born child of Cambodian refugees
- Unalome symbol = path from chaos to clarity
- Connects personal heritage to professional approach

**Not included on site:** Details about monk ordination in Thailand (shared for context only)

### Workshop Positioning
Not positioned as an AI expert — positioned as a guide who can help non-technical nonprofit leaders cut through the noise. Framed around appropriate use: "If AI can free up time for you to focus on mission and community impact, that feels like appropriate use."

### Experience Dates
- Blackstone Valley Prep: 2015-2025
- Democracy Prep: 2010-2015
- The Providence Plan: 2006-2010
- Education in K-12/nonprofit sector: March 2010 - June 2025

---

## Links & Contact Info

- **Booking:** https://tidycal.com/chivheng/introductory-call
- **Email:** hello@chivheng.consulting
- **LinkedIn:** https://www.linkedin.com/in/chivheng
- **GitHub:** https://github.com/chiv-heng/chivheng-consulting-website.git
- **Domains (Cloudflare):** chivheng.consulting, chivhengconsulting.com

---

## Resources Section

Free tools and guides shared publicly to demonstrate expertise and build capacity. Links to external resources (not hosted on site).

### Current Resources

1. **PowerSchool RI State Reporting Guide**
   - Platform: Notion
   - URL: https://mighty-hoof-255.notion.site/PowerSchool-SIS-RI-State-Reporting-2781c20d2ec880c59afdfa297597b24e
   - Description: Documentation for Rhode Island schools using PowerSchool SIS. Covers state reporting requirements, common issues, and field-by-field guidance.
   - Context: Created because PowerSchool's own documentation was insufficient and outdated.

2. **Job Search Tracker**
   - Platform: Google Sheets
   - URL: https://ggl.link/JoHo-JobTracker
   - Version: 1.1 (2025-06-17)
   - Description: Tool to bring clarity and structure to job search. Tracks applications, networking contacts, with live dashboard.
   - Collaboration: Created with JohoTalent.com
   - Tabs: Applications, Networking, Dashboard, Settings
   - Note: Has optional advanced features via Google Apps Script in menu bar

---

## File Structure

```
ChivHengConsulting/
├── index.html              # Main page
├── src/
│   ├── style.css           # All styling
│   └── main.js             # Scroll animations
├── public/
│   ├── logo-cropped.png    # Trimmed logo (929x416)
│   ├── logo.png            # Original logo
│   ├── School System Data Flow.png # High-res PNG
│   ├── School System Data Flow.svg # High-res SVG
│   ├── School System Data Flow.pdf # High-res PDF
│   ├── sample-data-flow-map.png  # Legacy sample work image
│   ├── favicon.svg         # Primary favicon (SVG)
│   ├── favicon.ico
│   ├── favicon-32.png
│   └── apple-touch-icon.png
├── package.json
├── PROJECT-NOTES.md        # This file
└── WEBSITE-STATUS.md       # Status & next steps
```

---

## To Run Locally

The project uses Vite. However, node_modules may have platform issues.

**Option 1: Simple HTTP server (no build)**
```bash
cd ChivHengConsulting
python3 -m http.server 8080
# Then visit http://localhost:8080
```

**Option 2: Vite dev server (if node_modules work)**
```bash
cd ChivHengConsulting
npm install  # if needed
npm run dev
# Then visit http://localhost:5173
```

---

## Deployment Plan

### Recommended: Netlify + Cloudflare DNS

1. **Build production files:**
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with optimized files.

2. **Deploy to Netlify:**
   - Create Netlify account (free)
   - Drag `dist/` folder to Netlify dashboard, OR
   - Connect GitHub repo for automatic deploys

3. **Configure Cloudflare DNS:**
   - Add CNAME record: `chivheng.consulting` → `[your-site].netlify.app`
   - Add redirect: `chivhengconsulting.com` → `chivheng.consulting`

4. **In Netlify:**
   - Add custom domain: `chivheng.consulting`
   - SSL certificate will be automatic

### Alternative: Cloudflare Pages
Since domains are already on Cloudflare, could use Cloudflare Pages instead of Netlify — keeps everything in one place.

---

## Outstanding Items

### Before Launch
- [x] Favicon created
- [x] Testimonials removed (placeholder)
- [x] Test on mobile devices
- [x] Integrate high-res Data Flow Map assets
- [x] Build production files
- [x] Deploy to hosting
- [x] Configure domain (DNS active on Cloudflare)

### Completed Post-Launch
- [x] Resources section added with external tools/guides

### Future Enhancements
- [ ] Collect testimonials via survey (separate project)
- [ ] Add professional headshot when available
- [ ] Additional sample work images
- [ ] Case studies / project stories
- [ ] Separate landing page for workshop interest (maybe)
- [ ] Additional resources as created

---

## Testimonial Survey (To Create)

Separate project: Create a survey to send to past clients to collect testimonials. Should ask about:
- What challenge they were facing
- What it was like working together
- What changed as a result
- Permission to use quote + attribution

---

## Session Context

This site was built collaboratively in a single working session. Key conversation points:

- Chiv's background: 15+ years in K-12 ops, first-gen Cambodian-American, monk ordination in Thailand
- Values: People-first, mission-driven, build capacity not dependency
- Tone: Warm, approachable, direct — not salesy or corporate
- The unalome symbol in the logo represents the path from chaos to clarity

If continuing work in a new session, this document + the code files should provide full context.

---

*End of project notes*

---

## 2026-01-29 Website Review & Recommendations

### Critical Issue: Mobile Navigation
- **Finding:** On mobile screens (<768px), the main navigation links disappear, but no "hamburger" menu replaces them.
- **Action Required:** Implement a responsive mobile menu (slide-out or dropdown) so users can navigate on phones.

### Design Polish
- **Header:** At very narrow widths (e.g., iPhone SE), the logo and "Let's Talk" button are cramped. Enhance padding/layout for <375px.
- **Images:** The "Data Flow Map" is detailed; consider adding a "zoom" feature or link to high-res version for mobile users.
- **Text:** Consider breaking up long text blocks (like in "About") with more visual spacing or pull quotes.

### Content decisions
- **Testimonials:** Remove placeholder quotes immediately. Add real ones only after collecting them via survey.
- **CTA Phrasing:** Keep "Let's see if we're a fit." User explicitly prefers this relational language over "Schedule a discovery call."
