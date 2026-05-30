# fear.social

Founder community platform built with Vite, React, Cloudflare Pages, and Cloudflare D1.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server runs through Wrangler so `/api/*` routes hit the Cloudflare Pages Function and local D1.

For frontend-only work without the API:

```bash
npm run dev:vite
```

## Cloudflare setup

1. Log in: `npx wrangler login`
2. Apply database migrations: `npm run db:migrate`
3. Build and deploy: `npm run deploy`

The D1 binding is configured in `wrangler.toml` as `DB`. Pages Functions in `functions/api/` use it for posts, profiles, waitlist, messages, and live stats.

## Build

```bash
npm run build
```

Static output is written to `dist/` for Cloudflare Pages.
