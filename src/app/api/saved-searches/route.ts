import { NextResponse } from "next/server";
import { AuthenticationRequiredError, saveSearch } from "@/features/saved-searches/save-search";
import { createClient } from "@/lib/supabase/server";

type ClientLike = {
  auth: { getUser(): Promise<{ data: { user: { id: string } | null } }> };
  from(table: string): { insert(value: unknown): PromiseLike<{ data: unknown; error: { message: string } | null }> };
};

export function createSavedSearchPostHandler(getClient: () => Promise<ClientLike | null>) {
  return async function handler(request: Request) {
    try {
      const client = await getClient();
      if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
      const { data: { user } } = await client.auth.getUser();
      const result = await saveSearch(await request.json(), user, {
        insert: async ({ userId, area, cuisines }) => {
          const { data, error } = await client.from("saved_searches").insert({ user_id: userId, area, cuisines });
          if (error) throw new Error(error.message);
          return data;
        },
      });
      return NextResponse.json(result ?? { saved: true }, { status: 201 });
    } catch (error) {
      if (error instanceof AuthenticationRequiredError) return NextResponse.json({ error: error.message }, { status: 401 });
      return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save search." }, { status: 400 });
    }
  };
}

export const POST = createSavedSearchPostHandler(createClient as () => Promise<ClientLike | null>);
