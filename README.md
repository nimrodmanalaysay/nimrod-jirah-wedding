# 💍 Nimrod & Jirah Wedding Website

A modern, elegant wedding website built with **React + Vite**.
Automatically deploys to **GitHub Pages** on every push to `main`.

**Wedding Date:** November 7, 2026
**Live URL (after setup):** `https://YOUR-USERNAME.github.io/nimrod-jirah-wedding/`

---

## 🚀 Deployment Guide (GitHub Pages)

Follow these steps **once** to get your site live. After that, every `git push` auto-deploys.

### Step 1 — Create the GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Name it exactly: `nimrod-jirah-wedding`
4. Set it to **Public**
5. Do **NOT** check "Add README" (we already have one)
6. Click **Create repository**

---

### Step 2 — Push the Code

Open your terminal inside the project folder and run:

```bash
# Initialize git
git init

# Stage all files
git add .

# First commit
git commit -m "Initial commit: Nimrod & Jirah wedding website"

# Rename branch to main
git branch -M main

# Connect to your GitHub repo (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/nimrod-jirah-wedding.git

# Push to GitHub
git push -u origin main
```

---

### Step 3 — Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Set branch to **`gh-pages`** and folder to **`/ (root)`**
5. Click **Save**

> ⚡ The `gh-pages` branch is created automatically by GitHub Actions
> after your first push. Wait ~1 minute for the action to finish.

---

### Step 4 — Watch it Deploy

1. In your repo, click the **Actions** tab
2. You'll see a workflow called **"Deploy to GitHub Pages"** running
3. Once it shows a green ✅, your site is live at:

```
https://YOUR-USERNAME.github.io/nimrod-jirah-wedding/
```

---

### Step 5 — Future Updates

Any time you make changes, just push to main:

```bash
git add .
git commit -m "Update entourage names"
git push
```

GitHub Actions will automatically rebuild and redeploy. ✨

---

## 💻 Local Development

```bash
# Install dependencies (first time only)
npm install

# Start local dev server
npm run dev

# Open in browser
# http://localhost:5173
```

---

## ✏️ How to Edit Content

| What to change | File to edit |
|---|---|
| Couple names & date | `src/pages/Home.jsx` |
| Wedding countdown date | `src/components/Countdown.jsx` |
| Venue address | `src/pages/Home.jsx` + `src/pages/RSVP.jsx` |
| Story slides | `src/pages/Story.jsx` → `slides` array |
| Entourage names | `src/pages/Entourage.jsx` → `entourage` object |
| Gallery photos | `src/pages/Gallery.jsx` → `photos` array |
| Color palette | `src/styles/global.css` → `:root` variables |
| Hero background photo | `src/pages/Home.css` → `.hero` rule |
| Repo name in vite config | `vite.config.js` → `base` value |

---

## 📧 Google Sheets RSVP Setup

### Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → New spreadsheet
2. Add these headers in row 1:
   ```
   Timestamp | First Name | Last Name | Email | Phone | Attendance
   ```

### Step 2 — Create an Apps Script

1. In your sheet: **Extensions → Apps Script**
2. Delete existing code, paste this:

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

3. Click **Save**

### Step 3 — Deploy as Web App

1. Click **Deploy → New Deployment**
2. Gear icon → **Web App**
3. Set **Execute as: Me** | **Who has access: Anyone**
4. Click **Deploy** → authorize → copy the **Web App URL**

### Step 4 — Connect to RSVP Form

Open `src/pages/RSVP.jsx` and replace:
```js
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
```
with your actual Web App URL, then push to GitHub.

---

## 📁 Folder Structure

```
nimrod-jirah-wedding/
├── .github/
│   └── workflows/
│       └── deploy.yml       ← Auto-deploy GitHub Action
├── .gitignore
├── index.html
├── vite.config.js           ← base path set to /nimrod-jirah-wedding/
├── package.json
├── README.md
└── src/
    ├── main.jsx             ← HashRouter (GitHub Pages compatible)
    ├── App.jsx              ← Routes + layout
    ├── styles/
    │   └── global.css       ← Color palette & base styles
    ├── components/
    │   ├── Navbar.jsx/.css
    │   ├── Footer.jsx/.css
    │   ├── Countdown.jsx/.css
    │   └── PageTransition.jsx/.css
    └── pages/
        ├── Home.jsx/.css
        ├── Story.jsx/.css
        ├── Entourage.jsx/.css
        ├── RSVP.jsx/.css
        └── Gallery.jsx/.css
```

---

## 🎨 Color Palette

| Variable | Hex | Used for |
|---|---|---|
| `--gold` | `#E1CA96` | Accents, hero text |
| `--sage` | `#556251` | Buttons, form labels |
| `--terracotta` | `#BD6738` | Highlights, borders |
| `--burgundy` | `#691B19` | Navbar, headings, footer |
| `--blush` | `#FFD9DA` | Card backgrounds |

---

## 📸 Adding Real Photos to Gallery

1. Place your images in `public/photos/`
2. Open `src/pages/Gallery.jsx`
3. Update the `photos` array:

```js
{ id: 1, src: '/nimrod-jirah-wedding/photos/your-photo.jpg', alt: 'Description', span: 2 }
```

> Note the `/nimrod-jirah-wedding/` prefix — required for GitHub Pages.
> On local dev, use just `/photos/your-photo.jpg`.

---

Made with ♥ for Nimrod & Jirah
