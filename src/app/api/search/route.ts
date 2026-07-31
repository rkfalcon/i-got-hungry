import { NextResponse } from "next/server";
import { MemoryRecommendationRepository } from "@/features/search/memory-repository";
import { SearchValidationError } from "@/features/search/query";
import { searchRecommendations } from "@/features/search/search-service";
import { SupabaseRecommendationRepository } from "@/features/search/supabase-repository";

const repository = SupabaseRecommendationRepository.fromEnvironment() ?? new MemoryRecommendationRepository();

export async function POST(request: Request) {
  try {
    return NextResponse.json(await searchRecommendations(await request.json(), { repository }));
  } catch (error) {
    if (error instanceof SearchValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 500 });
  }
}
