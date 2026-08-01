export type Coordinates = { latitude: number; longitude: number };

export type SearchQuery = {
  area?: string;
  coordinates?: Coordinates;
  cuisines: string[];
};

export type Restaurant = {
  id: string;
  name: string;
  area: string;
  cuisines: string[];
  distanceKm: number;
  independentMentions: number;
  latestEvidenceAt: string;
  sourceUrls: string[];
};

export type RankedRestaurant = Restaurant & {
  score: number;
  scoreBreakdown: { distance: number; cuisine: number; mentions: number; freshness: number };
};

export type SearchResponse = {
  restaurants: RankedRestaurant[];
  updatedAt: string | null;
  refreshStatus: "queued" | "unavailable";
};
