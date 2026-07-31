import { AuthenticationRequiredError, saveSearch } from "./save-search";

it("requires authentication before saving", async () => {
  await expect(saveSearch({ area: "Brooklyn", latitude: 40.7, longitude: -74, cuisines: [] }, null, { insert: vi.fn() })).rejects.toBeInstanceOf(AuthenticationRequiredError);
});

it("saves only an area and cuisines for the authenticated owner", async () => {
  const insert = vi.fn().mockResolvedValue({ id: "saved-1" });
  await saveSearch({ area: "Brooklyn", latitude: 40.7, longitude: -74, cuisines: ["Italian"] }, { id: "user-1" }, { insert });
  expect(insert).toHaveBeenCalledWith({ userId: "user-1", area: "Brooklyn", cuisines: ["italian"] });
});
