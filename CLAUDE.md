# CLAUDE.md — Nimrod & Jirah Wedding Website

Guidance for Claude Code (and humans) working in this repo.

## What this is

A single-page **React 18 + Vite 5** website for the wedding of **Nimrod & Jirah**, held **November 7, 2026** at **Grass Garden**, Purok 4, P. Reyes Street, Barangay Sipat, Plaridel, Bulacan (ceremony 2:30 PM, reception 4:00 PM — one venue for both).

- Routing: `react-router-dom` v6
- Analytics: `@vercel/analytics`
- Styling: plain CSS — one `.css` file per component/page, no framework
- No TypeScript, no test suite

## Commands

```bash
npm install    # first time only
npm run dev     # dev server at http://localhost:5173
npm run build   # production build (vite build)
npm run preview # preview the build
```

## Deployment ⚠️

The deploy target is **ambiguous** — resolve before deploying:

- `vite.config.js` sets `base: '/'`, and there is a `vercel.json` + Vercel Analytics → suggests **Vercel** (root-served).
- `README.md` and `.github/workflows/deploy.yml` describe **GitHub Pages** at `https://nimrodmanalaysay.github.io/nimrod-jirah-wedding/`.

If deploying to **GitHub Pages**, `base` must be `/nimrod-jirah-wedding/` (not `/`), or asset paths break. If deploying to **Vercel**, keep `base: '/'`. Don't change `base` without confirming the target.

## Routes (`src/App.jsx`)

`/` Home · `/story` · `/entourage` · `/rsvp` · `/gallery` · `/ceremony` (+ `/ceremony/wedding`, `/ceremony/reception`, `/ceremony/dresscode`) · `/faqs` · `/gifts`. The navbar labels the `/ceremony` group **"Program"**.

## Where content lives (edit points)

| To change… | Edit |
|---|---|
| Couple names, hero date, venue block, Explore cards | `src/pages/Home.jsx` |
| Countdown target date | `WEDDING_DATE` in `src/components/Countdown.jsx` |
| Venue name / address / map link / embed | `src/utils/venue.js` (single source; map embed is OpenStreetMap — Google's keyless iframe blocks framing) |
| Story chapters | `scenes` array in `src/pages/Story.jsx` |
| Entourage names/roles | arrays in `src/pages/Entourage.jsx` |
| FAQ items | `faqs` array in `src/pages/FAQs.jsx` |
| Gift / QR options | `giftOptions` in `src/pages/Gifts.jsx` |
| Gallery photos | `photos` array in `src/pages/Gallery.jsx` |
| Colors / fonts / spacing | `:root` in `src/styles/global.css` |
| Images | `public/photos/` — reference as `/photos/name.jpg` (works because `base` is `/`) |

**The wedding date/venue are duplicated in several places** — if they change, update all of: `Home.jsx`, `Countdown.jsx`, `utils/venue.js`, `Story.jsx` (last scenes), `apps-script-rsvp.gs` (`WEDDING` object + `.ics` UTC times), and RSVP copy.

## Color palette (CSS variables in `src/styles/global.css`)

| Variable | Hex | Role |
|---|---|---|
| `--gold` | `#E1CA96` | hero text, accents |
| `--sage` | `#556251` | labels, "attending" green |
| `--btn-color` | `#CA6641` | buttons, dividers |
| `--terracotta` | `#BD6738` | highlights, borders |
| `--burgundy` | `#691B19` | headings, navbar, footer, body text |
| `--blush` | `#FFD9DA` | card/section backgrounds |
| `--off-white` | `#FDF8F5` | page background |

Fonts: `--font-display` Cormorant Garamond (headings), `--font-body` Jost (body). These same hex values are **hardcoded again** in the HTML emails inside `apps-script-rsvp.gs` — keep both in sync.

## RSVP system (the complex part)

`src/pages/RSVP.jsx` is a multi-step wizard backed by **two Google Apps Script web apps** (URLs in `src/pages/rsvp/constants.js`):

- `INVITEE_SCRIPT_URL` — read-only guest list; `GET` → `{ names, invitees }`. Gates RSVP by name.
- `RSVP_SCRIPT_URL` — responses sheet; `GET` reads, `POST` upserts/cancels. Backing script committed at `apps-script-rsvp.gs`.

Flow (`src/pages/rsvp/RsvpSteps.jsx`): name gate (with last-name disambiguation + existing-RSVP detection) → Attendance → Contact → Personal → optional Plus One (only if invitee is `plusOneEligible` via the invitee record's `additionalInvitee` field) → Success.

- Primary guest and plus-one are written as **separate sheet rows**; the plus-one row is named `Plus One of <name>`.
- POSTs are `mode: 'no-cors'` (fire-and-forget; resubmits upsert).
- Progress is cached in the browser (`src/utils/rsvpCache.js`) so a refresh resumes the same step.
- The Apps Script sends themed HTML confirmation emails (with an `.ics` calendar attachment when attending) via `GmailApp`, masked as "Nimrod & Jirah Wedding <nimrodandjirahwedding@gmail.com>".
- Sheet headers: `ID | Timestamp | Invitee Name | Attendance | First Name | Last Name | Email | Notes | Advice | Plus One Name | Plus One Attendance`.
- RSVP deadline shown to guests: **October 1, 2026**.

## Conventions

- Match the existing style: functional components, hooks, plain CSS with BEM-ish class names (`block__element--modifier`).
- Content data lives in top-of-file `const` arrays/objects in each page — edit those rather than the JSX markup.
- Keep decorative comments (many files have `✏️` markers pointing at editable values).
