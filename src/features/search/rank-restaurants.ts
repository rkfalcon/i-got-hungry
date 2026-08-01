import type { RankedRestaurant, Restaurant, SearchQuery } from "./types";

export function rankRestaurants(restaurants: Restaurant[], query: SearchQuery, now = new Date()): RankedRestaurant[] {
  const required = new Set(query.cuisines);
  return restaurants
    .filter((restaurant) => [...required].every((cuisine) => restaurant.cuisines.includes(cuisine)))
    .map((restaurant) => {
      const ageDays = Math.max(0, (now.getTime() - new Date(restaurant.latestEvidenceAt).getTime()) / 86_400_000);
      const scoreBreakdown = {
        distance: 60 / (1 + Math.max(0, restaurant.distanceKm)),
        cuisine: required.size * 8,
        mentions: Math.log1p(Math.max(0, restaurant.independentMentions)) * 4,
        freshness: Math.max(1, 20 * Math.exp(-ageDays / 45)),
      };
      return { ...restaurant, scoreBreakdown, score: Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0) };
    })
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm || a.name.localeCompare(b.name));
}
