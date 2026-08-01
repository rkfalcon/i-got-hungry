# Milestone 1 Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the standalone food-discovery web app, secure Supabase schema and authentication, and cached recommendation search service described by delivery item 2 of the approved product design.

**Architecture:** A Next.js App Router application renders the public search experience and exposes server-only search/save boundaries. Pure TypeScript domain functions normalize queries and rank cached recommendations; a repository interface keeps those functions testable and supports a seeded local fallback until Supabase credentials are supplied. Supabase SSR clients provide Google/email auth, while PostgreSQL migrations enforce row-level access for account-owned data and public read-only access to cached recommendations.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Vitest, Testing Library, Supabase PostgreSQL/Auth, `@supabase/ssr`, `@supabase/supabase-js`.

## Global Constraints

- The approved design at `docs/superpowers/specs/2026-07-31-i-got-hungry-design.md` is authoritative; do not redesign it.
- Search must return cached results immediately and record a targeted refresh request without waiting for scraping.
- Location permission has a visible manual city/neighborhood alternative; a saved default area is used only for signed-in accounts.
- Cuisine selection is optional and supports one or more cuisines plus a typed cuisine.
- Precise location is sensitive and is not persisted in saved searches or profiles; store a human-readable default area instead.
- Supabase secret/service-role credentials remain server-only. The browser may receive only the project URL and publishable key.
- All `public` schema tables have RLS enabled. Account data policies use `(select auth.uid()) = user_id` and explicit `TO authenticated` clauses.
- Milestone 1 does not call Apify; ingestion and refresh execution belong to delivery item 3.

---

### Task 1: Application shell and test harness

**Files:**
- Create: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`, `.gitignore`, `.env.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: none.
- Produces: `HomePage` as the public entry route and `npm` scripts for `dev`, `build`, `lint`, and `test`.

- [ ] **Step 1: Write the failing home-page test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

it("offers nearby food discovery and a manual location alternative", () => {
  render(<HomePage />);
  expect(screen.getByRole("button", { name: /find food near me/i })).toBeVisible();
  expect(screen.getByLabelText(/city or neighborhood/i)).toBeVisible();
});
```

- [ ] **Step 2: Run `npm test -- src/app/page.test.tsx` and verify it fails because the application does not exist.**
- [ ] **Step 3: Add the minimal Next.js shell, accessible page landmarks, project metadata, responsive base styles, and dependency lockfile.**
- [ ] **Step 4: Run `npm test -- src/app/page.test.tsx` and verify it passes.**
- [ ] **Step 5: Commit with `feat(app): establish food discovery web app`.**

### Task 2: Search query and cached ranking domain

**Files:**
- Create: `src/features/search/types.ts`
- Create: `src/features/search/query.ts`
- Create: `src/features/search/rank-restaurants.ts`
- Test: `src/features/search/query.test.ts`
- Test: `src/features/search/rank-restaurants.test.ts`

**Interfaces:**
- Consumes: user-entered `area`, optional coordinates, and cuisine strings.
- Produces: `normalizeSearchQuery(input): SearchQuery` and `rankRestaurants(restaurants, query, now): RankedRestaurant[]`.

- [ ] **Step 1: Write failing tests proving blank areas are rejected, cuisine values are trimmed/deduplicated, and coordinates remain transient query data.**
- [ ] **Step 2: Run `npm test -- src/features/search/query.test.ts` and verify failures identify the missing query functions.**
- [ ] **Step 3: Implement `normalizeSearchQuery` with typed validation errors and normalized cuisine keys.**
- [ ] **Step 4: Run the query tests and verify they pass.**
- [ ] **Step 5: Write failing ranking tests proving distance sorts nearer restaurants higher, every selected cuisine must match, independent mentions and freshness increase rank, and older evidence retains lower positive weight.**
- [ ] **Step 6: Run `npm test -- src/features/search/rank-restaurants.test.ts` and verify ranking assertions fail because the ranker is absent.**
- [ ] **Step 7: Implement a deterministic weighted score with exported score breakdown fields for distance, cuisine match, mention strength, and freshness.**
- [ ] **Step 8: Run both domain test files and verify they pass.**
- [ ] **Step 9: Commit with `feat(search): rank cached restaurant recommendations`.**

### Task 3: Secure Supabase schema

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/<cli-generated>_create_milestone_one_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/lib/supabase/database.types.ts`
- Test: `src/lib/supabase/schema.test.ts`

**Interfaces:**
- Consumes: Supabase Auth users and normalized restaurant/evidence records.
- Produces: `profiles`, `restaurants`, `recommendation_evidence`, `refresh_requests`, and `saved_searches` tables with indexes and RLS policies.

- [ ] **Step 1: Write a failing schema-contract test that reads the migration and requires RLS on every table, public read-only restaurant/evidence policies, owner-only profile/saved-search policies, no precise-coordinate columns on account tables, and no public access to refresh requests.**
- [ ] **Step 2: Run the schema test and verify it fails because no migration exists.**
- [ ] **Step 3: Use `supabase migration new create_milestone_one_schema` to generate the migration filename, then add tables, constraints, indexes, grants, and explicit policies.**
- [ ] **Step 4: Add realistic seed restaurants and evidence for a local credential-free demonstration; add matching generated-style TypeScript database types.**
- [ ] **Step 5: Run the schema-contract test and, when Docker/Supabase CLI is available, `supabase db reset` plus database advisors; verify all available checks pass.**
- [ ] **Step 6: Commit with `feat(database): add secure recommendation schema`.**

### Task 4: Cached recommendation repository and search service

**Files:**
- Create: `src/features/search/repository.ts`
- Create: `src/features/search/memory-repository.ts`
- Create: `src/features/search/supabase-repository.ts`
- Create: `src/features/search/search-service.ts`
- Create: `src/features/search/seed-data.ts`
- Test: `src/features/search/search-service.test.ts`

**Interfaces:**
- Consumes: `SearchQuery`, `RecommendationRepository.listCached`, and `RecommendationRepository.queueRefresh`.
- Produces: `searchRecommendations(input, dependencies): Promise<SearchResponse>` containing ranked cached cards, `updatedAt`, and refresh status.

- [ ] **Step 1: Write failing integration tests proving cached results return before refresh completion, each valid search queues one refresh request, stale data remains visible when queueing fails, and no server secret crosses the response boundary.**
- [ ] **Step 2: Run `npm test -- src/features/search/search-service.test.ts` and verify expected missing-service failures.**
- [ ] **Step 3: Implement the repository contract, seeded memory adapter, Supabase adapter, and service orchestration. Queue refresh asynchronously and report `queued` or `unavailable` without rejecting cached results.**
- [ ] **Step 4: Run the service and domain tests and verify they pass.**
- [ ] **Step 5: Commit with `feat(search): serve cached results and queue refreshes`.**

### Task 5: Location, cuisine, and recommendation-card experience

**Files:**
- Create: `src/features/search/search-experience.tsx`
- Create: `src/features/search/location-picker.tsx`
- Create: `src/features/search/cuisine-picker.tsx`
- Create: `src/features/search/restaurant-card.tsx`
- Create: `src/app/api/search/route.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Test: `src/features/search/search-experience.test.tsx`
- Test: `src/app/api/search/route.test.ts`

**Interfaces:**
- Consumes: browser geolocation or manual area, optional cuisines, and `POST /api/search`.
- Produces: accessible search controls and cards showing distance, matched cuisine, mention strength, freshness/update time, and public source links.

- [ ] **Step 1: Write failing component tests for granted location, denied location with manual fallback, single/multiple/typed cuisines, loading, empty, and stale-result states.**
- [ ] **Step 2: Run the component tests and verify they fail because the experience components are absent.**
- [ ] **Step 3: Implement the smallest client interaction layer and accessible controls needed to satisfy the tests. Keep ranking and data access server-side.**
- [ ] **Step 4: Write failing route tests for validation errors, successful cached responses, and refresh-queue failure responses that retain results.**
- [ ] **Step 5: Run route tests and verify the missing route causes the expected failures.**
- [ ] **Step 6: Implement `POST /api/search`, selecting the Supabase repository when public environment configuration exists and the seeded memory repository otherwise.**
- [ ] **Step 7: Run page, component, route, and search tests and verify they pass.**
- [ ] **Step 8: Commit with `feat(ui): add nearby restaurant search experience`.**

### Task 6: Supabase authentication and saved searches

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `src/proxy.ts`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/features/auth/auth-panel.tsx`
- Create: `src/features/saved-searches/save-search.ts`
- Create: `src/app/api/saved-searches/route.ts`
- Modify: `src/features/search/search-experience.tsx`
- Test: `src/features/saved-searches/save-search.test.ts`
- Test: `src/app/api/saved-searches/route.test.ts`

**Interfaces:**
- Consumes: Google OAuth or email magic-link authentication and a completed normalized search query.
- Produces: `saveSearch(query, authenticatedUser, repository)` and owner-scoped saved-search API behavior; sign-in is prompted only when Save is chosen.

- [ ] **Step 1: Write failing service tests proving anonymous save requests require sign-in, authenticated saves omit precise coordinates, and account default areas can satisfy searches without a manual area.**
- [ ] **Step 2: Run the save-search tests and verify expected missing-function failures.**
- [ ] **Step 3: Implement the pure save-search boundary and owner ID checks.**
- [ ] **Step 4: Write failing route tests for unauthenticated `401`, owner-scoped insertion, and malformed payload rejection.**
- [ ] **Step 5: Implement current `@supabase/ssr` browser/server/proxy clients, auth callback, Google and email actions, and the protected API route. Apply all response headers supplied by token refresh.**
- [ ] **Step 6: Add Save UI that opens authentication only after the user asks to save; keep public discovery credential-free.**
- [ ] **Step 7: Run all authentication, save, and search tests and verify they pass.**
- [ ] **Step 8: Commit with `feat(auth): add sign-in gated saved searches`.**

### Task 7: Milestone verification and operator documentation

**Files:**
- Create: `README.md`
- Modify: `.env.example`
- Test: all test files

**Interfaces:**
- Consumes: the completed Milestone 1 application.
- Produces: credential setup instructions for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, Google provider configuration, email auth, local Supabase, and Vercel-ready builds.

- [ ] **Step 1: Add setup, local fallback behavior, Supabase migration/seed steps, credential boundaries, test commands, and an explicit statement that Apify is intentionally deferred to Milestone 2.**
- [ ] **Step 2: Run `npm test -- --run`, `npm run lint`, and `npm run build`; fix every error or warning attributable to the project.**
- [ ] **Step 3: Inspect `git diff --check`, `git status --short`, and the final diff against every Milestone 1 requirement.**
- [ ] **Step 4: Commit with `docs: document milestone one setup`.**

## Milestone Boundary

Milestone 1 is locally complete when public users can search seeded or Supabase-backed cached recommendations by location and optional cuisines, each search attempts to queue a refresh without delaying results, authenticated users can save searches through RLS-protected storage, and all tests/lint/build checks pass. Live Supabase authentication cannot be end-to-end verified until project credentials and Google/email provider settings are supplied; the implementation must clearly surface that remaining operator step without embedding secrets.
