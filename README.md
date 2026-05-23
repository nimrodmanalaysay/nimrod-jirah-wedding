# 💍 Nimrod & Jirah Wedding Website

A modern, elegant wedding website built with **React + Vite**.

**Wedding Date:** November 7, 2026  
**Ceremony:** 3:00 PM | **Reception:** 4:00 PM  
**Venue:** Grass Garden *(update address in code)*

---

## 📁 Folder Structure

```
nimrod-jirah-wedding/
├── index.html               ← Root HTML file
├── vite.config.js           ← Vite configuration
├── package.json
├── public/
│   └── photos/              ← Put your real photos here
└── src/
    ├── main.jsx             ← App entry point
    ├── App.jsx              ← Router + layout
    ├── styles/
    │   └── global.css       ← Color palette, fonts, base styles
    ├── components/
    │   ├── Navbar.jsx / .css
    │   ├── Footer.jsx / .css
    │   └── Countdown.jsx / .css
    └── pages/
        ├── Home.jsx / .css
        ├── Story.jsx / .css
        ├── Entourage.jsx / .css
        ├── RSVP.jsx / .css
        └── Gallery.jsx / .css
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

---

## ✏️ How to Edit Content

| What to change | Where to edit |
|---|---|
| Couple names | `src/pages/Home.jsx` → hero section |
| Wedding date/time | `src/pages/Home.jsx` + `src/components/Countdown.jsx` |
| Venue address | `src/pages/Home.jsx` + `src/pages/RSVP.jsx` |
| Story slides | `src/pages/Story.jsx` → `slides` array |
| Entourage names | `src/pages/Entourage.jsx` → `entourage` object |
| Gallery photos | `src/pages/Gallery.jsx` → `photos` array |
| Color palette | `src/styles/global.css` → `:root` variables |
| Hero background | `src/pages/Home.css` → `.hero` section |

---

## 📧 Google Sheets RSVP Setup

### Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Add these column headers in row 1:
   ```
   Timestamp | First Name | Last Name | Email | Phone | Attendance
   ```

### Step 2 — Create an Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code
3. Paste the following:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.firstName,
    data.lastName,
    data.email,
    data.phone,
    data.attendance
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (floppy disk icon)

### Step 3 — Deploy as Web App

1. Click **Deploy → New Deployment**
2. Click the gear icon → **Web App**
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Authorize when prompted
6. **Copy the Web App URL**

### Step 4 — Connect to the Website

Open `src/pages/RSVP.jsx` and replace:

```js
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
```

With your actual Web App URL.

---

## 🌐 Deployment

### Option A: Vercel (Recommended — easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts — your site will be live in seconds!
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) for automatic deploys.

### Option B: GitHub Pages

1. In `vite.config.js`, set:
   ```js
   base: '/nimrod-jirah-wedding/'
   ```

2. Build and deploy:
   ```bash
   npm run build
   npm install -g gh-pages
   gh-pages -d dist
   ```

3. In your GitHub repo → **Settings → Pages → Source → gh-pages branch**

---

## 🗂️ Git Setup

```bash
# Initialize repository
git init

# Stage all files
git add .

# First commit
git commit -m "Initial commit: Nimrod & Jirah wedding website"

# Rename branch to main
git branch -M main

# Connect to GitHub (create the repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/nimrod-jirah-wedding.git

# Push to GitHub
git push -u origin main
```

---

## 🎨 Color Palette

| Variable | Hex | Usage |
|---|---|---|
| `--gold` | `#E1CA96` | Accent text, hero elements |
| `--sage` | `#556251` | Buttons, backgrounds |
| `--terracotta` | `#BD6738` | Highlights, borders |
| `--burgundy` | `#691B19` | Navbar, headings |
| `--blush` | `#FFD9DA` | Section backgrounds, cards |

---

## 📸 Adding Real Photos to Gallery

1. Place your images in `public/photos/`
2. Open `src/pages/Gallery.jsx`
3. Update the `photos` array:

```js
{ id: 1, src: '/photos/your-photo.jpg', alt: 'Description', span: 2 }
```

`span: 2` = tall tile, `span: 1` = regular tile

---

Made with ♥ for Nimrod & Jirah
