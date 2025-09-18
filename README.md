# A4F Free Models — Dashboard

🎛️ Live dashboard that lists free models from A4F and exposes JSON endpoints for Chat, Audio, Embeddings and Image Generation.

Summary
-------
- Framework: Next.js (Pages router)
- React version: 19.x
- Purpose: Display and filter models fetched from A4F upstream API and provide JSON endpoints at top-level paths:
  - `/chat`  -> Chat & Completion models
  - `/audio` -> Audio & Transcriptions
  - `/embeddings` -> Embeddings
  - `/image` -> Image Generation

This repository also contains a small admin page (`/admin`) with safe simulated actions.

Quick links
-----------
- Project: (this repository)
- Upstream source: https://www.a4f.co/models
- DevSyst: https://devsyst.com
- Cloudflare Pages: https://pages.cloudflare.com/
- Cloudflare Wrangler (Workers): https://developers.cloudflare.com/workers/
- Live demo: https://271f140a.a4f-models.pages.dev

Prerequisites
-------------
- Node.js 18+ (LTS recommended)
- npm or yarn
- A GitHub repository (Cloudflare Pages integrates with GitHub for automatic deploys)

Run locally
------------
1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Open http://localhost:3000 in your browser.

Build
-----

```bash
npm run build
npm run start
```

Deployment to Cloudflare Pages (recommended)
-------------------------------------------

Cloudflare Pages can host Next.js apps. There are two general ways:

1) Use Cloudflare Pages native Next.js support (recommended for simplicity)
   - In the Cloudflare dashboard, create a new Pages project and connect your GitHub repository.
   - For **Framework preset**, choose **Next.js**.
   - Build command: `npm run build`
   - Build output directory: (leave default for Next.js or `.next` depending on Cloudflare UI)
   - For environment variables, add any secrets your app needs (see Environment Variables below).
   - Save and deploy. Pages will build on every push to the selected branch (e.g. `main`).

2) Use Wrangler + Pages (advanced / if you need Workers functions)
   - Install Wrangler: `npm i -g wrangler` or see documentation above.
   - Authenticate Wrangler with your Cloudflare account (API token with appropriate permissions).
   - Use `wrangler pages publish` to push static output or use `wrangler pages deploy` for preview deployments.

Notes about Next.js features
----------------------------
- Server-side API routes in `pages/api/*` are used by the app. Cloudflare Pages provides Functions support; confirm your Pages plan supports server functions or use Workers.
- If you encounter runtime incompatibilities (e.g. Node-only APIs), consider deploying to a platform with full Node support (Vercel) or adapt to Cloudflare Workers environment.

GitHub Actions (optional)
-------------------------
You can add a GitHub Action to run tests and/or trigger a Pages deployment. Cloudflare also deploys automatically when you push to the branch if you configured Pages from the dashboard.

Example (replace placeholders with your values):

```yaml
# .github/workflows/pages-deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install
        run: npm ci
      - name: Build
        run: npm run build
      # Deploy using Cloudflare Pages (this is a placeholder; connect Pages to GitHub in dashboard for easiest setup)
      # - name: Deploy to Cloudflare Pages
      #   uses: cloudflare/pages-action@v1
      #   with:
      #     apiToken: ${{ secrets.CF_PAGES_API_TOKEN }}
      #     accountId: ${{ secrets.CF_ACCOUNT_ID }}
      #     projectName: your-pages-project
      #     directory: .
```

Environment variables / Secrets
-------------------------------
- If your API handlers require secrets (for example a provider API key), set them in Cloudflare Pages dashboard or as GitHub Secrets for CI.
- Common secrets to set:
  - CF_ACCOUNT_ID — Cloudflare account id (for CLI/deploy)
  - CF_PAGES_API_TOKEN — Pages deploy token (if using action/CLI)
  - Any upstream API keys your server may need (not required for the current safe simulated admin endpoints)

How to push and trigger Pages deploy (recommended flow)
-----------------------------------------------------
1. Commit your changes locally:

```bash
git add .
git commit -m "Prepare for Cloudflare Pages deployment: add README and docs"
git push origin main
```

2. In Cloudflare dashboard > Pages, create a project and connect your repo. Cloudflare will build and deploy on push.

Deployed site
-------------
You can access the deployed site here:

https://271f140a.a4f-models.pages.dev

Deploy using Wrangler (alternative)
---------------------------------
1. Install Wrangler

```bash
npm i -g wrangler
# or
npm install --save-dev wrangler
```

2. Authenticate

```bash
wrangler login
```

3. Publish

```bash
wrangler pages deploy ./public --project-name=your-pages-project
```

Note: `wrangler pages publish` expects static assets. For Next.js server features you may need to adapt build output or use a Worker target.

Repository notes and developer tips
---------------------------------
- API endpoints are in `pages/api/` and top-level rewrites are configured in `next.config.js` so `/chat` maps to `/api/chat` etc.
- Admin endpoints are safe no-ops under `pages/api/admin/[action].js`.
- Keep server-only code inside `pages/api` to avoid client bundle errors.

Troubleshooting
---------------
- If Pages build fails with Node-specific APIs: check if your Pages plan supports Next serverless functions; otherwise use Workers or Vercel.
- If `/chat` shows client errors, ensure there's no accidental `pages/chat.js` page (should be only `pages/api/chat.js`).

Contact
-------
- Project owner / maintainer: Please see repo for contact details.

License
-------
MIT
