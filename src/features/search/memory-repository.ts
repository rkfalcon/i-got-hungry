import type { RecommendationRepository } from "./repository";
import { seedRestaurants } from "./seed-data";
import type { Restaurant, SearchQuery } from "./types";

export class MemoryRecommendationRepository implements RecommendationRepository {
  readonly refreshes: SearchQuery[] = [];
  constructor(private readonly restaurants: Restaurant[] = seedRestaurants) {}

  async listCached(query: SearchQuery) {
    const area = query.area?.toLowerCase();
    return this.restaurants.filter((restaurant) => !area || restaurant.area.toLowerCase().includes(area) || area.includes(restaurant.area.toLowerCase()));
  }

  async queueRefresh(query: SearchQuery) { this.refreshes.push(query); }
}
