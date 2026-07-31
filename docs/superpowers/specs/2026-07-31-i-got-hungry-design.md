# I Got Hungry — Product Design

## Purpose

I Got Hungry is a public web app for finding nearby restaurant recommendations
from public Instagram posts, Reels, hashtags, and place signals. It will also
be available as a published ChatGPT plugin so users can discover and use the
same recommendation experience in ChatGPT.

The first release favors fast discovery: users receive the best available
results immediately while data refreshes in the background.

## First-release user experience

1. A visitor opens the app and sees a single primary action: **Find food near
   me**.
2. The app asks for location permission. A visible alternative lets the visitor
   enter a city or neighborhood instead.
3. The visitor can optionally choose one or more cuisine chips or enter a
   specific cuisine.
4. The app immediately shows cached restaurant recommendations for the chosen
   area, ordered by distance and recommendation strength.
5. Each restaurant card includes distance, matched cuisine, Instagram mention
   strength, freshness, and links to the public source posts when available.
6. Every search queues a targeted background refresh. The refreshed ranking is
   available to the next search without forcing the visitor to wait.
7. Google or email sign-in through Supabase is requested only when the visitor
   saves a search. Saved searches belong to the account.

Current location is used when permission is granted. Otherwise, the app falls
back to the account's saved default area. Any search may override both with a
manual city or neighborhood.

## Recommendation data flow

1. The server converts an area and selected cuisines into public Instagram
   location, hashtag, keyword, and selected-profile search targets.
2. A background job calls the chosen Apify Instagram actor with those targets.
   The Apify token stays server-side.
3. Apify completes the run and exposes the returned public posts and Reels in
   its dataset. A webhook or scheduled worker retrieves completed results.
4. The ingestion service extracts restaurant names, cuisine clues, location
   clues, timestamps, source links, and mention signals. It deduplicates
   records and associates them with normalized nearby restaurant records.
5. Supabase stores normalized restaurants, recommendation evidence, refresh
   state, user profiles, default areas, and saved searches.
6. The search service reads this stored data and ranks restaurants by:
   - distance from the searched area;
   - match against all selected cuisines;
   - volume of independent Instagram mentions;
   - freshness of new posts, Reels, and hashtag evidence; and
   - retained older evidence at a lower weight.

The application does not send a latitude/longitude to Apify as a complete
restaurant-finding instruction. It derives Instagram-friendly search targets
from the user's selected area, then uses location again to match and rank
candidate restaurants.

## Architecture

- **Standalone application:** one web app deployed on Vercel.
- **Application backend:** protected server endpoints and scheduled jobs handle
  Apify calls, normalization, ranking, and refresh orchestration.
- **Data and identity:** Supabase provides authentication, PostgreSQL data,
  access policies, and saved-search storage. Google sign-in is primary, with
  email sign-in available as a fallback.
- **ChatGPT integration:** a ChatGPT plugin exposes the same search and
  recommendation capabilities through a small MCP server, with optional rich
  result UI. It has its own metadata, privacy disclosures, authentication,
  testing, submission, and directory review, while sharing the recommendation
  service with the website.

## Reliability and privacy

- Search results never wait for a scrape; a refresh is queued after each
  search.
- If a refresh fails or is delayed, the latest successful recommendations stay
  available and display their update time.
- If location permission is declined, manual place search remains fully usable.
- Persist only information needed for recommendation quality and source
  explanation. Treat precise location as sensitive, use it for the current
  search with explicit permission, and make the account default area editable.
- Keep all provider credentials on the server and use rate limits, refresh
  quotas, and deduplication to manage scraping cost and reliability.

## Verification

The implementation must test:

- location permission, manual-location, and saved-default flows;
- optional single- and multi-cuisine filtering;
- popularity, freshness, distance, and older-evidence ranking behavior;
- sign-in and saved searches;
- background refresh success, delay, and failure states;
- private server-side handling of Apify credentials; and
- the ChatGPT plugin's tool, authentication, UI, and submission readiness.

## Delivery sequence

1. Create the public GitHub repository and local project workspace.
2. Build the standalone web app, Supabase schema and authentication, and the
   cached recommendation search service.
3. Add Apify ingestion, background refresh, ranking, and observability.
4. Build, test, package, and submit the ChatGPT plugin for directory review.
5. Deploy the web app to Vercel and configure the production Supabase and
   Apify credentials.
