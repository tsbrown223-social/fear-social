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

### Sign in with Apple

Apple authentication follows the same account-linking rules as Google: a verified Apple identity links to an existing account with the same email without replacing its password, while first-time sign-up requires agreement to the current Terms and Conditions. Apple can return a private relay address; fear.social treats that verified relay address as the account email.

- Create an Apple App ID for `social.fear.app` with Sign in with Apple enabled.
- Create and associate a Services ID for the website. Use the Services ID as `APPLE_CLIENT_ID`.
- Registered domain: `fear.social`
- Return URL: `https://fear.social/api/auth/apple/callback`
- Create a Sign in with Apple key and store its `.p8` contents only as the encrypted Cloudflare secret `APPLE_PRIVATE_KEY`.
- Cloudflare secrets: `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY`
- Cloudflare variable: `APPLE_REDIRECT_URI=https://fear.social/api/auth/apple/callback`

The Apple button remains hidden until all four credentials are present. The OAuth request uses a single-use state and nonce, and the callback verifies Apple’s signed identity token before creating a session. Configure Apple’s private email relay for the `fear.social` sending domain so messages from `contact@fear.social` reach users who choose Hide My Email.

## Build

```bash
npm run build
```

Static output is written to `dist/` for Cloudflare Pages.
