# fear.social

Business-starter community platform built with Vite, React, Cloudflare Pages, and Cloudflare D1.

## Launch plan

- Public positioning: Your first step is fear. Empowering tomorrow's founders today.
- Email capture: the landing page posts directly to `/api/waitlist`, storing invite demand in Cloudflare D1.
- Audience: future founders, early builders, first-time business starters, and people who have not taken the first step yet.
- Free plan: public profile, build updates, discovery, events, rooms, direct messages, email verification, and password login.
- FEAR Pro: founding-member plan at `$19/month` with priority mentor request routing, advanced matching, private Pro rooms, opportunity alerts, and AI prep notes.
- Billing path: validate Pro demand from the waitlist, open Stripe checkout for FEAR Pro, then add annual billing once monthly conversion is proven.

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

The D1 binding is configured in `wrangler.local.toml` as `DB`. Pages Functions in `functions/api/` use it for posts, profiles, waitlist, messages, and live stats.

### Email

All product email should use `contact@fear.social`.

- Sender: `fear.social <contact@fear.social>`
- Owner/backend notification recipient: `contact@fear.social`
- Cloudflare Pages variables/secrets: `EMAIL_FROM`, `NOTIFICATION_EMAIL`, and `RESEND_API_KEY`
- The `fear.social` sending domain must be verified in Resend before verification codes can be delivered from `contact@fear.social`.
- User-facing email includes signup received confirmations and verification codes.

### Google sign-in

Google sign-in links verified Google identities to existing fear.social accounts by email without replacing their password. New accounts must accept the current Terms and Conditions before the OAuth flow begins.

- OAuth client type: Web application
- Authorized JavaScript origin: `https://fear.social`
- Authorized redirect URI: `https://fear.social/api/auth/google/callback`
- Cloudflare Pages secrets: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Cloudflare Pages variable: `GOOGLE_REDIRECT_URI=https://fear.social/api/auth/google/callback`

The Google button is hidden automatically until both client credentials are configured.

## Build

```bash
npm run build
```

Static output is written to `dist/` for Cloudflare Pages.
