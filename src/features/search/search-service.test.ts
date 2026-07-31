import { searchRecommendations } from "./search-service";
import type { RecommendationRepository } from "./repository";

const restaurant = { id: "1", name: "Lucali", area: "Brooklyn", cuisines: ["italian", "pizza"], distanceKm: 1.2, independentMentions: 8, latestEvidenceAt: "2026-07-30T00:00:00Z", sourceUrls: ["https://instagram.com/p/example"] };

it("returns cached results and queues a targeted refresh", async () => {
  const queueRefresh = vi.fn().mockResolvedValue(undefined);
  const repository: RecommendationRepository = { listCached: vi.fn().mockResolvedValue([restaurant]), queueRefresh };
  const result = await searchRecommendations({ area: "Brooklyn", cuisines: ["Italian"] }, { repository, now: new Date("2026-07-31T00:00:00Z") });
  expect(result.restaurants[0].name).toBe("Lucali");
  expect(result.refreshStatus).toBe("queued");
  expect(queueRefresh).toHaveBeenCalledWith({ area: "Brooklyn", cuisines: ["italian"] });
  expect(JSON.stringify(result)).not.toMatch(/service.role|secret/i);
});

it("keeps cached results when refresh queueing fails", async () => {
  const repository: RecommendationRepository = { listCached: vi.fn().mockResolvedValue([restaurant]), queueRefresh: vi.fn().mockRejectedValue(new Error("offline")) };
  const result = await searchRecommendations({ area: "Brooklyn", cuisines: [] }, { repository, now: new Date("2026-07-31T00:00:00Z") });
  expect(result.restaurants).toHaveLength(1);
  expect(result.refreshStatus).toBe("unavailable");
});
