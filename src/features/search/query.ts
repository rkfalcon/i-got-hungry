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
  const hasLatitude = typeof input.latitude === "number";
  const hasLongitude = typeof input.longitude === "number";
  if (hasLatitude !== hasLongitude) throw new SearchValidationError("Location coordinates are incomplete.");
  const hasCoordinates = hasLatitude && hasLongitude;
  if (hasCoordinates) {
    const latitude = input.latitude as number;
    const longitude = input.longitude as number;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new SearchValidationError("Location coordinates are invalid.");
    }
  }
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
