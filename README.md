# tahmid-portfolio-v2

New portfolio design for Tahmid Sikder Rifat (tahmidsikder.me).

## Structure

```
index.html            The whole page: HTML with inline CSS and JavaScript
assets/rifat.avif     Hero photo (AVIF, used by modern browsers)
assets/rifat.webp     Hero photo fallback (WebP)
favicon.ico           Browser tab icon
icon.png              192px icon
apple-touch-icon.png  iOS home-screen icon
```

Fonts (Geist, Geist Mono) load from Google Fonts. No framework, no build
step, no server code, no API keys.

## Run locally

Open `index.html` in a browser, or run `python3 -m http.server 8000` in this
folder and visit http://localhost:8000.

## Deploy

Hosted on Vercel as a static site: Framework Preset "Other", no build
command, output directory = repository root. Pushes to other branches create
Preview Deployments; pushes to `main` create Production Deployments.

Everything in this repository is served to visitors, so never add secrets
(API keys, tokens, passwords) to these files.
