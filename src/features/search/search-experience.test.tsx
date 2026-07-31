import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SearchExperience } from "./search-experience";

it("uses manual location and optional multiple cuisines to show cached cards", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ restaurants: [{ id: "1", name: "Lucali", area: "Brooklyn", cuisines: ["italian", "pizza"], distanceKm: 1.2, independentMentions: 8, latestEvidenceAt: "2026-07-30T00:00:00Z", sourceUrls: ["https://instagram.com/p/example"], score: 10, scoreBreakdown: {} }], updatedAt: "2026-07-30T00:00:00Z", refreshStatus: "queued" }) }));
  render(<SearchExperience />);
  fireEvent.change(screen.getByLabelText(/city or neighborhood/i), { target: { value: "Brooklyn" } });
  fireEvent.click(screen.getByRole("button", { name: "Italian" }));
  fireEvent.click(screen.getByRole("button", { name: "Pizza" }));
  fireEvent.click(screen.getByRole("button", { name: /search this area/i }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "Lucali" })).toBeVisible());
  expect(fetch).toHaveBeenCalledWith("/api/search", expect.objectContaining({ method: "POST" }));
});

it("keeps manual search available when location permission is denied", async () => {
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: (_ok: unknown, denied: (error: Error) => void) => denied(new Error("denied")) } });
  render(<SearchExperience />);
  fireEvent.click(screen.getByRole("button", { name: /find food near me/i }));
  expect(await screen.findByText(/couldn.t access your location/i)).toBeVisible();
  expect(screen.getByLabelText(/city or neighborhood/i)).toBeEnabled();
});
