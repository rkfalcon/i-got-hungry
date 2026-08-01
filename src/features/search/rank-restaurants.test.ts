import { rankRestaurants } from "./rank-restaurants";
import type { Restaurant } from "./types";

const base: Restaurant = {
  id: "a", name: "Near", area: "Brooklyn", cuisines: ["italian", "pizza"], distanceKm: 1,
  independentMentions: 3, latestEvidenceAt: "2026-07-30T12:00:00Z", sourceUrls: ["https://instagram.com/p/a"],
};

it("filters on every selected cuisine and ranks distance, mentions, and freshness", () => {
  const results = rankRestaurants([
    base,
    { ...base, id: "b", name: "Far", distanceKm: 8, independentMentions: 20 },
    { ...base, id: "c", name: "Wrong", cuisines: ["thai"] },
  ], { area: "Brooklyn", cuisines: ["italian", "pizza"] }, new Date("2026-07-31T12:00:00Z"));
  expect(results.map(({ name }) => name)).toEqual(["Near", "Far"]);
  expect(results[0].scoreBreakdown.distance).toBeGreaterThan(results[1].scoreBreakdown.distance);
});

it("retains old evidence with a lower positive freshness weight", () => {
  const [result] = rankRestaurants([{ ...base, latestEvidenceAt: "2025-07-31T12:00:00Z" }], { area: "Brooklyn", cuisines: [] }, new Date("2026-07-31T12:00:00Z"));
  expect(result.scoreBreakdown.freshness).toBeGreaterThan(0);
  expect(result.scoreBreakdown.freshness).toBeLessThan(5);
});
