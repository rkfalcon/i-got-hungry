import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

it("secures every public milestone table with deliberate RLS policies", () => {
  const directory = join(process.cwd(), "supabase/migrations");
  const migration = readFileSync(join(directory, readdirSync(directory)[0]), "utf8").toLowerCase();
  for (const table of ["profiles", "restaurants", "recommendation_evidence", "refresh_requests", "saved_searches"]) {
    expect(migration).toContain(`alter table public.${table} enable row level security`);
  }
  expect(migration).toContain("(select auth.uid()) = user_id");
  const tableBody = (table: string) => migration.match(new RegExp(`create table public\\.${table} \\(([\\s\\S]*?)\\n\\);`))?.[1] ?? "";
  expect(tableBody("saved_searches")).not.toMatch(/latitude|longitude/);
  expect(tableBody("profiles")).not.toMatch(/latitude|longitude/);
  expect(migration).not.toMatch(/create policy[^;]+on public\.refresh_requests[^;]+to anon/);
});
