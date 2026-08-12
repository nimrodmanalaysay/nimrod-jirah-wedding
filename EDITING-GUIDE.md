# 💍 Editing Guide — Nimrod & Jirah Wedding Site

A plain-English guide for updating the website. **No coding experience needed** — just careful copy-paste and typing between quote marks.

---

## 🧭 A few rules before you start

1. **Only change text between the quote marks** `' '` or `" "`. Leave the quotes, commas, and brackets exactly where they are.
2. **Keep every comma.** Lines in a list end with a comma — don't delete it.
3. **Photos** go in the `public/photos/` folder. In the code you refer to them as `/photos/your-file-name.jpg`.
4. After editing, **save the file**, then publish (see the last section).
5. When unsure, **make a copy of the file first** so you can undo.

Tip: the code has little `✏️` pencil marks next to things that are safe to edit.

---

## ✏️ How to change common things

### Couple names & the big date on the homepage
Open **`src/pages/Home.jsx`**. Find the names and the date:
```
Nimrod
&
Jirah
```
```
November 7, 2026
```
Change the text, keep the layout.

### The countdown timer
Open **`src/components/Countdown.jsx`**. Find:
```
const WEDDING_DATE = new Date('2026-11-07T15:00:00')
```
`2026-11-07` = year-month-day, `15:00:00` = time on a 24-hour clock (15:00 = 3:00 PM).

> ⚠️ If the wedding date changes, it appears in **several places**. Update ALL of them: `Home.jsx`, `Countdown.jsx`, `src/utils/venue.js`, `src/pages/Story.jsx` (last two chapters), and `apps-script-rsvp.gs` (the email/calendar file). See the checklist at the bottom.

### Venue name, address & map
Open **`src/utils/venue.js`**. Edit the name and address between the quotes. To change the map pin, replace the `MAP_LINK` with a new Google Maps share link.

### Our Story chapters
Open **`src/pages/Story.jsx`**. Each chapter looks like this:
```
chapter: 'How We Met',
date: '2019',
image: '/photos/story-how-we-met.jpg',
body: `We first met as college classmates...`,
```
Edit the title, date, and story text. To swap the photo, put a new image in `public/photos/` and update the `image:` line.

### Entourage (sponsors, groomsmen, bridesmaids, etc.)
Open **`src/pages/Entourage.jsx`**. Names are in simple lists, for example:
```
const ninongs = [
  'Mr. Ronald Aguilar',
  'Mr. Allan Santos',
]
```
- **To edit a name:** change the text between the quotes.
- **To add a person:** copy a whole line and paste it below, then change the name. Keep the comma at the end.
- **To remove a person:** delete that whole line.

### FAQs (questions & answers)
Open **`src/pages/FAQs.jsx`**. Each item is:
```
{
  q: 'What time should I arrive?',
  a: 'We recommend arriving by 2:15 PM...',
},
```
Edit the question (`q`) and answer (`a`). Copy a whole `{ ... },` block to add a new question.

> The contact email at the bottom of the FAQ page is `nimrodjirahwedding@gmail.com`. If you change it, change the matching `FROM_ADDRESS` and `REPLY_TO` in `apps-script-rsvp.gs` too, so guests reply to the same inbox the confirmation emails come from.

### Gifts / payment QR codes
Open **`src/pages/Gifts.jsx`**. Replace the QR images by saving your real QR pictures into `public/photos/` (as `gcash.jpg` and `bpi.jpg`), keeping the same file names — no code change needed.

### Gallery photos
Put photos in `public/photos/`, then open **`src/pages/Gallery.jsx`** and update the `photos` list to point at your file names.

### Colors
Open **`src/styles/global.css`** and find the block near the top with color codes like `#E1CA96`. Change a code to recolor the whole site.

---

## 📸 Adding or replacing a photo

1. Put your image file in the **`public/photos/`** folder.
2. Give it a simple name — lowercase, no spaces (e.g. `story-proposal.jpg`).
3. In the code, refer to it as `/photos/story-proposal.jpg`.
4. **Easiest trick:** name your new photo exactly the same as the one you're replacing — then you don't have to touch any code at all.

---

## 💌 About the RSVP page

The RSVP form is connected to a **Google Sheet** (that's where guest replies are collected) and it emails a confirmation to each guest automatically. This part is technical — if something about RSVP needs changing (guest list, emails, the sheet), it's best to ask a developer. The technical notes live in `CLAUDE.md` and `apps-script-rsvp.gs`.

The RSVP deadline shown to guests is **October 1, 2026** (in `src/pages/RSVP.jsx`).

---

## 🚀 Publishing your changes (making them go live)

After saving your edits, the site needs to be **published**. Ask your developer to set this up once; then updating is usually just:

```
git add .
git commit -m "Update wedding details"
git push
```

The site rebuilds and updates automatically a minute or two later. (If you're not comfortable with this step, send your changes to whoever set up the site.)

---

## ✅ "The date changed" checklist

If the wedding date or time changes, update it in **all** of these:

- [ ] `src/pages/Home.jsx` — hero date + venue block
- [ ] `src/components/Countdown.jsx` — `WEDDING_DATE`
- [ ] `src/utils/venue.js` — if the venue changed too
- [ ] `src/pages/Story.jsx` — the last two chapters ("Forever Begins", closing)
- [ ] `src/pages/RSVP.jsx` — the deadline / any dates in the text
- [ ] `apps-script-rsvp.gs` — the `WEDDING` details **and** the calendar invite times (needs a developer)

---

Made with ♥ for Nimrod & Jirah
