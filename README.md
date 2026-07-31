# I Got Hungry

I Got Hungry finds nearby restaurants from cached public Instagram recommendation evidence. Searches return immediately and record a refresh request for later ingestion; the Apify ingestion worker is intentionally part of Milestone 2.

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Without environment variables the public search uses a small Brooklyn demonstration dataset. This makes the complete search interaction available without external credentials.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL, publishable key, and server-only secret key.
3. Apply `supabase/migrations/20260731202700_create_milestone_one_schema.sql` and then `supabase/seed.sql` using the Supabase CLI or SQL editor.
4. Enable Google in Supabase Auth Providers and add `/auth/callback` for the local and deployed site URLs. Email magic-link sign-in is the fallback.

`SUPABASE_SECRET_KEY` must stay server-side. Never rename it with a `NEXT_PUBLIC_` prefix or commit `.env.local`.

## Verification

```bash
npm test -- --run
npm run lint
npm run build
```

The Supabase schema enables RLS on every public table. Restaurant evidence is public read-only data, saved searches and profiles are owner-scoped, and refresh requests have no client policy.

## Delivery sequence

- Milestone 1: standalone web app, Supabase schema/auth, cached recommendation search.
- Milestone 2: Apify ingestion, background refresh execution, ranking expansion, observability.
- Milestone 3: ChatGPT plugin packaging and submission.
- Milestone 4: Vercel production deployment and service configuration.
