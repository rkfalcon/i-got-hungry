import { createSearchPostHandler, POST } from "./route";
import { MemoryRecommendationRepository } from "@/features/search/memory-repository";

it("returns cached recommendations for a valid search", async () => {
  const response = await POST(new Request("http://localhost/api/search", { method: "POST", body: JSON.stringify({ area: "Brooklyn", cuisines: ["pizza"] }) }));
  expect(response.status).toBe(200);
  expect((await response.json()).restaurants[0].name).toBe("Lucali");
});

it("rejects a search without a location", async () => {
  const response = await POST(new Request("http://localhost/api/search", { method: "POST", body: JSON.stringify({ cuisines: [] }) }));
  expect(response.status).toBe(400);
});

it("uses an authenticated account's default area when no location is supplied", async () => {
  const handler = createSearchPostHandler(new MemoryRecommendationRepository(), async () => "Brooklyn");
  const response = await handler(new Request("http://localhost/api/search", { method: "POST", body: JSON.stringify({ cuisines: ["thai"] }) }));
  expect(response.status).toBe(200);
  expect((await response.json()).restaurants[0].name).toBe("Ugly Baby");
});
