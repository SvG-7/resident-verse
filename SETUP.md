# RESIDENT-VERSE : SETUP & DEPLOYMENT GUIDE

Complete step-by-step instructions for deploying **RESIDENT-VERSE** as a free public HTTPS web app on **GitHub Pages** with automatic response logging to **Google Sheets**.

---

## PART A — GOOGLE SHEETS & APPS SCRIPT BACKEND (FREE)

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Name your spreadsheet **Resident Verse Responses**.

### Step 2: Open Apps Script Editor
1. In your Google Sheet top menu, click **Extensions** → **Apps Script**.
2. Erase any default code in the editor (`myFunction`).
3. Open [Code.gs](file:///s:/RAstuffs/Code.gs) from this repository, copy all of its content, and paste it into the Apps Script editor.
4. Click the **Save** icon (💾) or press `Ctrl + S` / `Cmd + S`.

### Step 3: Deploy as Web App
1. At the top right of the Apps Script editor, click **Deploy** → **New deployment**.
2. Click the gear icon (⚙️) next to *Select type* and select **Web app**.
3. Fill out the deployment options **EXACTLY** as follows:
   - **Description**: `Resident Verse Production Exporter`
   - **Execute as**: `Me (your email address)`
   - **Who has access**: `Anyone` *(CRITICAL: This allows your dorm residents to submit their answers without signing into Google!)*
4. Click **Deploy**.
5. Google will prompt you to authorize permissions:
   - Click **Authorize access**.
   - Select your Google account.
   - Click **Advanced** (if warning appears) → Click **Go to Resident Verse Responses (unsafe)** → Click **Allow**.
6. Copy the **Web App URL**. It will look like this:
   `https://script.google.com/macros/s/AKfycbx.../exec`

### Step 4: Paste URL into Frontend Code
1. Open [script.js](file:///s:/RAstuffs/script.js).
2. At the very top of the file (Line 7), locate:
   ```javascript
   const RESPONSE_ENDPOINT = "PASTE_GOOGLE_APPS_SCRIPT_URL_HERE";
   ```
3. Replace `"PASTE_GOOGLE_APPS_SCRIPT_URL_HERE"` with your copied Web App URL:
   ```javascript
   const RESPONSE_ENDPOINT = "https://script.google.com/macros/s/AKfycbx.../exec";
   ```
4. Save `script.js`.

---

## PART B — GITHUB PAGES DEPLOYMENT (FREE PUBLIC WEBSITE)

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and sign in.
2. Click **+** (top right) → **New repository**.
3. Name your repository `resident-verse`.
4. Keep it **Public**.
5. Click **Create repository**.

### Step 2: Upload Files
Upload all files from `s:/RAstuffs/` to your new repository:
- `index.html`
- `style.css`
- `script.js`
- `assets/` (entire folder including `assets/images/`)

*(You can drag and drop these files directly into the GitHub web interface or use Git commands)*.

### Step 3: Enable GitHub Pages
1. In your GitHub repository, click **Settings** (top tab).
2. On the left menu, click **Pages** (under Code and automation).
3. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
4. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
5. Click **Save**.
6. Wait 1–2 minutes. Refresh the page until GitHub displays your live URL:
   `https://YOUR_USERNAME.github.io/resident-verse/`

---

## PART C — TEST YOUR RESPONSES

1. Open your live site on your phone or browser (`https://YOUR_USERNAME.github.io/resident-verse/`).
2. Complete the short mission:
   - Enter test name & hometown.
   - Select your major and year.
   - Choose 3 power tiles and 2 community mission event tiles.
   - Press **FINISH MISSION**.
3. Watch the verification sequence complete.
4. Open your **Google Sheet**.
5. Confirm that a new row automatically appeared with your test response!

### Google Sheet Column Structure Created Automatically:
1. `Timestamp`
2. `Name`
3. `Preferred Name`
4. `Hometown`
5. `Major`
6. `Year`
7. `Class Thought`
8. `Clubs / Orgs / Sports / Jobs`
9. `Interests` (e.g., `Gaming, Technology, Music`)
10. `Other Hobbies`
11. `Preferred Community Events` (e.g., `Food Events, Game Nights`)
12. `Event Suggestion`
13. `Anything Else`

---

## PART D — FREE QR CODE GENERATION FOR RESIDENTS

1. Copy your live GitHub Pages URL (`https://YOUR_USERNAME.github.io/resident-verse/`).
2. Go to a free, non-tracking QR generator like [qr-code-generator.com](https://www.qr-code-generator.com/) or use Google Chrome's built-in QR generator (Right-click page → *Create QR Code for this Page*).
3. Download the QR code image.
4. Print it on a flyer or poster for your dorm floor!
