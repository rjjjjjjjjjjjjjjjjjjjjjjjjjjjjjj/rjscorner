# Ridhima Jain — Neurotech Portfolio

Scroll-driven 3D brain portfolio. Brain rotates in response to scroll velocity.

## Setup
```bash
npm install
npm run dev       # local dev
npm run build     # production build → dist/
```

## Deploy to GitHub Pages
1. Run `npm run build`
2. Push the `dist/` folder contents to your `gh-pages` branch, OR
3. Use the **Actions** workflow: push to main, deploy `dist/` automatically.

> The `vite.config.ts` uses `base: "./"` so all assets resolve correctly on GitHub Pages.
