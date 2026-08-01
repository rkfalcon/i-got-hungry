import type { Restaurant, SearchQuery } from "./types";

export interface RecommendationRepository {
  listCached(query: SearchQuery): Promise<Restaurant[]>;
  queueRefresh(query: SearchQuery): Promise<void>;
}
