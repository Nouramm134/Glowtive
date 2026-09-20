# Glowtive — one deployable service

This folder is now the whole app: Express serves the API **and** the UI
(`public/index.html`, plain React loaded from a CDN — no build step). One
project, one deploy, no terminal required once it's live.

## Deploy from your phone (Safari), no computer needed

1. **Create a GitHub account** at github.com if you don't have one.
2. **Create a new repository** (e.g. `glowtive`) — GitHub's "+" button →
   New repository.
3. **Upload these files**: open the repo → "Add file" → "Upload files" →
   pick every file in this folder (`server.js`, `db.js`, `aiEngine.js`,
   `products.js`, `package.json`, and the `public` folder with
   `index.html` inside it) → Commit.
4. **Go to render.com** → sign up (you can sign up with your GitHub
   account directly) → "New +" → "Web Service" → pick the `glowtive`
   repo you just created.
5. Render will ask for:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   Leave everything else default → "Create Web Service".
6. Wait for the deploy log to say "Live" (a couple of minutes). Render
   gives you a real URL like `https://glowtive.onrender.com` — open it
   on your phone. That's the actual app, with a real server and a real
   SQL database behind it.
7. On iPhone: open that URL in Safari → Share button → "Add to Home
   Screen". It now has its own icon and opens full-screen, no browser
   bar — the closest thing to an installed app without an App Store build.

## Notes

- Render's free tier sleeps after inactivity — the first open after a
  while takes ~30–50 seconds to wake up. Normal for free hosting.
- The SQLite database file resets on redeploy on Render's free tier
  (no persistent disk on that tier). Fine for a demo; if you need data
  to survive redeploys, Render's paid tier adds a persistent disk, or
  swap in a hosted Postgres later — the SQL logic in `db.js` stays the
  same shape.
- Still true regardless of hosting: this is a real web app you open by
  URL, not a compiled App Store binary. That last step needs a Mac with
  Xcode (wrap this same code with Capacitor) — no hosting choice changes
  that.
