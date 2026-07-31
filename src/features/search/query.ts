import type { SearchQuery } from "./types";

export class SearchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchValidationError";
  }
}

type SearchInput = { area?: unknown; latitude?: unknown; longitude?: unknown; cuisines?: unknown };

export function normalizeSearchQuery(input: SearchInput): SearchQuery {
  const area = typeof input.area === "string" ? input.area.trim() : "";
  const hasCoordinates = typeof input.latitude === "number" && typeof input.longitude === "number";
  if (!area && !hasCoordinates) throw new SearchValidationError("Choose your location or enter a city or neighborhood.");

  const cuisines = Array.isArray(input.cuisines)
    ? [...new Set(input.cuisines.filter((value): value is string => typeof value === "string").map((value) => value.trim().toLowerCase()).filter(Boolean))]
    : [];

  return {
    ...(area ? { area } : {}),
    ...(hasCoordinates ? { coordinates: { latitude: input.latitude as number, longitude: input.longitude as number } } : {}),
    cuisines,
  };
}
