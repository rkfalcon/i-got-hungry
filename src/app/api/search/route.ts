import { NextResponse } from "next/server";
import { MemoryRecommendationRepository } from "@/features/search/memory-repository";
import { SearchValidationError } from "@/features/search/query";
import { searchRecommendations } from "@/features/search/search-service";
import { SupabaseRecommendationRepository } from "@/features/search/supabase-repository";
import type { RecommendationRepository } from "@/features/search/repository";
import { createClient } from "@/lib/supabase/server";

const repository = SupabaseRecommendationRepository.fromEnvironment() ?? new MemoryRecommendationRepository();

async function getAccountDefaultArea() {
  try {
    const client = await createClient();
    if (!client) return null;
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    const { data } = await client.from("profiles").select("default_area").eq("user_id", user.id).maybeSingle();
    return data?.default_area ?? null;
  } catch { return null; }
}

export function createSearchPostHandler(searchRepository: RecommendationRepository, defaultArea: () => Promise<string | null>) {
  return async function handler(request: Request) {
    try {
      const input = await request.json() as { area?: string; latitude?: number; longitude?: number; cuisines?: string[] };
      const hasLocation = Boolean(input.area?.trim()) || (typeof input.latitude === "number" && typeof input.longitude === "number");
      const resolvedInput = hasLocation ? input : { ...input, area: await defaultArea() ?? undefined };
      return NextResponse.json(await searchRecommendations(resolvedInput, { repository: searchRepository }));
    } catch (error) {
      if (error instanceof SearchValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 500 });
    }
  };
}

export const POST = createSearchPostHandler(repository, getAccountDefaultArea);
