import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RecommendationRepository } from "./repository";
import type { Restaurant, SearchQuery } from "./types";

type RestaurantRow = { id: string; name: string; area: string; latitude: number | null; longitude: number | null; cuisines: string[] };
type EvidenceRow = { restaurant_id: string; source_url: string; published_at: string; source_profile: string | null };

function distanceKm(query: SearchQuery, row: RestaurantRow) {
  if (!query.coordinates || row.latitude == null || row.longitude == null) return 0;
  const toRadians = (value: number) => value * Math.PI / 180;
  const dLat = toRadians(row.latitude - query.coordinates.latitude);
  const dLon = toRadians(row.longitude - query.coordinates.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(query.coordinates.latitude)) * Math.cos(toRadians(row.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class SupabaseRecommendationRepository implements RecommendationRepository {
  constructor(private readonly client: SupabaseClient) {}

  static fromEnvironment() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    return url && secret ? new SupabaseRecommendationRepository(createClient(url, secret, { auth: { persistSession: false } })) : null;
  }

  async listCached(query: SearchQuery): Promise<Restaurant[]> {
    let request = this.client.from("restaurants").select("id,name,area,latitude,longitude,cuisines");
    if (query.area) request = request.ilike("area", `%${query.area}%`);
    const { data: rows, error } = await request;
    if (error) throw error;
    const ids = (rows as RestaurantRow[]).map(({ id }) => id);
    const { data: evidence, error: evidenceError } = ids.length ? await this.client.from("recommendation_evidence").select("restaurant_id,source_url,published_at,source_profile").in("restaurant_id", ids) : { data: [], error: null };
    if (evidenceError) throw evidenceError;
    return (rows as RestaurantRow[]).map((row) => {
      const matches = (evidence as EvidenceRow[]).filter((item) => item.restaurant_id === row.id);
      return { id: row.id, name: row.name, area: row.area, cuisines: row.cuisines, distanceKm: distanceKm(query, row), independentMentions: new Set(matches.map((item) => item.source_profile ?? item.source_url)).size, latestEvidenceAt: matches.map((item) => item.published_at).sort().at(-1) ?? new Date(0).toISOString(), sourceUrls: matches.map((item) => item.source_url) };
    });
  }

  async queueRefresh(query: SearchQuery) {
    const { error } = await this.client.from("refresh_requests").insert({ area: query.area ?? "current location", cuisines: query.cuisines });
    if (error) throw error;
  }
}
