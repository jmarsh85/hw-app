# Happy Wife — His Edition
## Local Setup & Deployment Guide (Windows)

---

### First-time setup (do once)

**Step 1 — Install Node.js**
- Go to https://nodejs.org
- Download the **LTS** version (left button)
- Run the installer, all defaults, click through
- When done, open **Command Prompt** (search "cmd" in Start)
- Type: `node --version` — you should see a version number like `v20.x.x`

**Step 2 — Get the project files**
You need these files in a folder on your PC:

```
hw-app/
  src/
    main.jsx
    App.jsx          ← this is your happy-wife.jsx, renamed to App.jsx
  index.html
  vite.config.js
  package.json
  public/
    manifest.json
    _redirects
    icons/
      icon-192.png   ← create or drop in any 192x192 PNG (app icon)
      icon-512.png   ← create or drop in any 512x512 PNG (app icon)
```

**Step 3 — Install dependencies**
In Command Prompt, navigate to the hw-app folder:
```
cd C:\path\to\hw-app
npm install
```
This downloads React, Vite, and other dependencies into a `node_modules` folder.
Takes about 30 seconds. Only needed once (or when dependencies change).

**Step 4 — Test locally**
```
npm run dev
```
Open http://localhost:5173 in your browser. The app runs locally.
Press Ctrl+C to stop.

---

### Building for deployment

```
npm run build
```
This creates a `dist/` folder — these are the compiled files Netlify will serve.
Takes about 5 seconds.

---

### Deploying to Netlify (first time)

1. Go to https://netlify.com and create a free account
2. From the dashboard, click **Add new site → Deploy manually**
3. Drag your `dist/` folder into the upload box
4. Netlify gives you a URL like `https://random-name-123.netlify.app`
5. Optional: rename it in Site Settings → Site name → `happywife-app` or similar

**That's your live app URL.** Open it in Safari on your iPhone, tap Share → Add to Home Screen.

---

### Updating the app (every time after changes)

1. Copy the updated `App.jsx` (from Claude) into `src/App.jsx`
2. Run `npm run build`
3. Go to Netlify dashboard → your site → **Deploys** → drag new `dist/` folder in

Done. The live URL updates immediately.

---

### Connecting GitHub for auto-deploy (optional, recommended)

Once set up, pushing to GitHub automatically triggers a Netlify build — no dragging needed.

1. Push the `hw-app` folder to a GitHub repo (e.g. `hw-app`)
2. In Netlify: Site Settings → Build & Deploy → Link to GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`

From then on: edit → commit → push → Netlify builds and deploys automatically.

---

### App icon

You need two PNG files in `public/icons/`:
- `icon-192.png` — 192×192 pixels
- `icon-512.png` — 512×512 pixels

Simplest option: use any image editor (even MS Paint) to create a dark square
(#0c0a08) with a 🌹 rose emoji or "HW" text in gold. Save as PNG at those sizes.
Or use https://favicon.io/emoji-favicons/ — search "rose", download, resize.

---

### File that changes most often

`src/App.jsx` — this is your happy-wife.jsx renamed. Every update from Claude
replaces just this file. Everything else stays the same between updates.

---

### Folder structure reference

```
hw-app/
├── src/
│   ├── App.jsx          ← update this from Claude each version
│   └── main.jsx         ← never changes
├── public/
│   ├── manifest.json    ← rarely changes
│   ├── _redirects       ← never changes
│   └── icons/
│       ├── icon-192.png ← your app icon
│       └── icon-512.png ← your app icon
├── index.html           ← rarely changes
├── vite.config.js       ← never changes
└── package.json         ← rarely changes
```
