import { normalizeSearchQuery } from "@/features/search/query";

export class AuthenticationRequiredError extends Error {}

type SavedSearchRepository = { insert(input: { userId: string; area: string; cuisines: string[] }): Promise<unknown> };

export async function saveSearch(input: unknown, user: { id: string } | null, repository: SavedSearchRepository) {
  if (!user) throw new AuthenticationRequiredError("Sign in to save this search.");
  const query = normalizeSearchQuery(input as Parameters<typeof normalizeSearchQuery>[0]);
  if (!query.area) throw new Error("Choose a named area before saving this search.");
  return repository.insert({ userId: user.id, area: query.area, cuisines: query.cuisines });
}
