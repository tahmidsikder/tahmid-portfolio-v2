# Project notes for Claude: tahmid-portfolio-v2

Personal portfolio of Tahmid Sikder Rifat, live at https://www.tahmidsikder.me
(the bare domain tahmidsikder.me redirects 301 to www).

## Files

- `index.html`: the whole site, with HTML, inline CSS and inline JS. Dark theme by
  default. Light theme comes from `prefers-color-scheme: light` or from the ☀ toggle,
  which is saved in `localStorage["theme"]`.
- `loader.js`: intro loading screen. It draws a wireframe 3×3 cube on a canvas
  that forms, twists, breaks apart and rebuilds, then lifts away like a curtain and
  reveals the page with a staggered rise. It follows the active theme (re-checked every
  few frames) and honours the saved toggle. It runs for 3.9s minimum and 8s at most.
  It has a Skip button and also exits on Esc/Enter. It is shortened for reduced motion.
  It is included as the first thing inside `<body>`.
- `assets/rifat.avif`, `assets/rifat.webp`: the hero photo (AVIF, with WebP fallback).
- `favicon.ico`, `icon.png`, `apple-touch-icon.png`: site icons.
- `.gitignore`: keeps `.env*`, keys, credentials and `node_modules` out of Git.

No framework, no build step, no package.json, no server code, no API keys.

## Hosting

- Vercel project **tahmid-portfolio-v2** (Hobby account "tahmidsikder").
  Framework preset: Other. Build command: empty. Output directory: repo root.
- Domains `www.tahmidsikder.me` and `tahmidsikder.me` (redirect to www) are on this
  project.
- DNS is on Cloudflare with the proxy on. Vercel shows "Proxy Detected", which is
  expected. Do **not** change Cloudflare DNS, nameservers or SSL.
- The live deployment was uploaded directly, not from Git. It uses a 500px AVIF photo
  only. The files in this folder are the fuller version (760px AVIF + WebP fallback).
  The design is the same.
- The old site lives in Vercel project `portfolio-of-tahmid-sikder-r-ifat` and the
  public GitHub repo `Portfolio-Of-Tahmid-Sikder-RIfat`. Leave both untouched.
  That repo has a committed `.env`. Never open or copy it.

## Still to do

1. Create the **private** GitHub repo `tahmid-portfolio-v2` and push this folder.
2. In Vercel, connect tahmid-portfolio-v2 → Settings → Git to that repo, so pushes to
   `main` deploy to production and other branches make preview deployments.

## Rules

- Never put passwords, tokens or API keys in these files. Everything here is public.
- Show the owner a preview before changing the live site.
- Keep the design as it is unless asked. The owner writes in Bangla/Banglish.
