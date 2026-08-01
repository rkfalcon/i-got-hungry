import type { Restaurant } from "./types";

export const seedRestaurants: Restaurant[] = [
  { id: "lucali", name: "Lucali", area: "Brooklyn", cuisines: ["italian", "pizza"], distanceKm: 1.2, independentMentions: 18, latestEvidenceAt: "2026-07-29T18:00:00Z", sourceUrls: ["https://www.instagram.com/explore/tags/brooklynpizza/"] },
  { id: "ugly-baby", name: "Ugly Baby", area: "Brooklyn", cuisines: ["thai"], distanceKm: 2.1, independentMentions: 12, latestEvidenceAt: "2026-07-25T18:00:00Z", sourceUrls: ["https://www.instagram.com/explore/tags/brooklynthai/"] },
  { id: "peaches", name: "Peaches HotHouse", area: "Brooklyn", cuisines: ["southern", "american"], distanceKm: 4.6, independentMentions: 9, latestEvidenceAt: "2026-07-14T18:00:00Z", sourceUrls: ["https://www.instagram.com/explore/tags/brooklynfood/"] },
];
