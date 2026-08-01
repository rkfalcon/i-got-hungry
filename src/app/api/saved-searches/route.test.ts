import { createSavedSearchPostHandler } from "./route";

it("returns 401 when a visitor tries to save", async () => {
  const handler = createSavedSearchPostHandler(async () => ({ auth: { getUser: async () => ({ data: { user: null } }) }, from: vi.fn() }));
  const response = await handler(new Request("http://localhost", { method: "POST", body: JSON.stringify({ area: "Brooklyn", cuisines: [] }) }));
  expect(response.status).toBe(401);
});

it("inserts a search for the authenticated owner", async () => {
  const insert = vi.fn().mockResolvedValue({ data: { id: "saved" }, error: null });
  const handler = createSavedSearchPostHandler(async () => ({ auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) }, from: () => ({ insert }) }));
  const response = await handler(new Request("http://localhost", { method: "POST", body: JSON.stringify({ area: "Brooklyn", latitude: 40.7, longitude: -74, cuisines: ["Italian"] }) }));
  expect(response.status).toBe(201);
  expect(insert).toHaveBeenCalledWith({ user_id: "user-1", area: "Brooklyn", cuisines: ["italian"] });
});
