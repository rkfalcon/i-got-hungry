import { normalizeSearchQuery, SearchValidationError } from "./query";

describe("normalizeSearchQuery", () => {
  it("rejects a query with neither an area nor coordinates", () => {
    expect(() => normalizeSearchQuery({ area: " ", cuisines: [] })).toThrow(SearchValidationError);
  });

  it("normalizes and deduplicates cuisines", () => {
    expect(normalizeSearchQuery({ area: " Brooklyn ", cuisines: ["Italian", " italian ", "Thai"] })).toEqual({
      area: "Brooklyn",
      cuisines: ["italian", "thai"],
    });
  });

  it("accepts transient coordinates", () => {
    expect(normalizeSearchQuery({ latitude: 40.7, longitude: -74, cuisines: [] })).toEqual({
      coordinates: { latitude: 40.7, longitude: -74 },
      cuisines: [],
    });
  });
});
