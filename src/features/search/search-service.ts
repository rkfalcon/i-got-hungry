import { normalizeSearchQuery } from "./query";
import { rankRestaurants } from "./rank-restaurants";
import type { RecommendationRepository } from "./repository";
import type { SearchResponse } from "./types";

export async function searchRecommendations(input: unknown, dependencies: { repository: RecommendationRepository; now?: Date }): Promise<SearchResponse> {
  const query = normalizeSearchQuery(input as Parameters<typeof normalizeSearchQuery>[0]);
  const now = dependencies.now ?? new Date();
  const cached = await dependencies.repository.listCached(query);
  let refreshStatus: SearchResponse["refreshStatus"] = "queued";
  try { await dependencies.repository.queueRefresh(query); } catch { refreshStatus = "unavailable"; }
  const restaurants = rankRestaurants(cached, query, now);
  const updatedAt = restaurants.reduce<string | null>((latest, restaurant) => !latest || restaurant.latestEvidenceAt > latest ? restaurant.latestEvidenceAt : latest, null);
  return { restaurants, updatedAt, refreshStatus };
}
