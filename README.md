# 💍 Nimrod & Jirah Wedding Website

Built with **React + Vite**. Auto-deploys to **GitHub Pages** on every push to `master`.

**Live URL:** `https://nimrodmanalaysay.github.io/nimrod-jirah-wedding/`

---

## 🚀 Step-by-Step Deployment

### Step 1 — Create the GitHub Repository

1. Go to [github.com](https://github.com) → sign in
2. Click **+** → **New repository**
3. Name it exactly: `nimrod-jirah-wedding`
4. Set visibility to **Public**
5. Leave everything else unchecked
6. Click **Create repository**

---

### Step 2 — Push the Code

Open your terminal inside the unzipped project folder:

```bash
git init
git add .
git commit -m "Initial commit: Nimrod & Jirah wedding website"
git branch -M master
git remote add origin https://github.com/nimrodmanalaysay/nimrod-jirah-wedding.git
git push -u origin master
```

> Replace `YOUR-USERNAME` with your actual GitHub username.

---

### Step 3 — Enable GitHub Pages (IMPORTANT — read carefully)

1. Go to your repo on GitHub
2. Click **Settings** tab
3. Click **Pages** in the left sidebar
4. Under **Source** — select **"GitHub Actions"** ← this is the key step
5. That's it — no branch to select

> ⚠️ Do NOT select "Deploy from a branch". Select **GitHub Actions**.

---

### Step 4 — Wait for the Action to Finish

1. Click the **Actions** tab in your repo
2. You'll see **"Deploy to GitHub Pages"** running
3. Wait for the green ✅ (usually under 2 minutes)
4. Your site is live at:

```
https://nimrodmanalaysay.github.io/nimrod-jirah-wedding/
```

---

### Step 5 — Future Updates

```bash
git add .
git commit -m "Your update message"
git push
```

GitHub Actions rebuilds and redeploys automatically. ✨

---

## 💻 Local Development

```bash
npm install   # first time only
npm run dev   # starts at http://localhost:5173
```

---

## ✏️ Editing Content

| What | File |
|---|---|
| Couple names & date | `src/pages/Home.jsx` |
| Countdown date | `src/components/Countdown.jsx` |
| Venue & address | `src/pages/Home.jsx` + `src/pages/RSVP.jsx` |
| Story slides | `src/pages/Story.jsx` → `slides` array |
| Entourage names | `src/pages/Entourage.jsx` → `entourage` object |
| Gallery photos | `src/pages/Gallery.jsx` → `photos` array |
| Colors | `src/styles/global.css` → `:root` |
| Hero background photo | `src/pages/Home.css` → `.hero` |
| Repo name (if different) | `vite.config.js` → `base` value |

---

## 📧 Google Sheets RSVP Setup

### 1. Create a Google Sheet

Headers in row 1: `Timestamp | First Name | Last Name | Email | Phone | Attendance`

### 2. Add Apps Script

**Extensions → Apps Script** → paste:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.firstName, data.lastName, data.email, data.phone, data.attendance]);
  return ContentService.createTextOutput(JSON.stringify({ result: 'success' })).setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Deploy as Web App

**Deploy → New Deployment → Web App**
- Execute as: **Me**
- Who has access: **Anyone**

Copy the Web App URL.

### 4. Paste URL in RSVP.jsx

```js
// src/pages/RSVP.jsx
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_ID/exec'
```

Then `git push` to redeploy.

---

## 📸 Adding Real Gallery Photos

1. Put photos in `public/photos/`
2. In `src/pages/Gallery.jsx`, update the `photos` array:

```js
{ id: 1, src: '/nimrod-jirah-wedding/photos/photo1.jpg', alt: 'Us at the beach', span: 2 }
```

---

## 🎨 Color Palette

| Variable | Hex | Used for |
|---|---|---|
| `--gold` | `#E1CA96` | Accents, hero text |
| `--sage` | `#556251` | Buttons, labels |
| `--terracotta` | `#BD6738` | Highlights, borders |
| `--burgundy` | `#691B19` | Navbar, headings, footer |
| `--blush` | `#FFD9DA` | Card backgrounds |

---

Made with ♥ for Nimrod & Jirah
