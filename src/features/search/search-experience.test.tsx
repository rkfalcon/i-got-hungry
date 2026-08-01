import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SearchExperience } from "./search-experience";

const successfulSearch = {
  ok: true,
  json: async () => ({ restaurants: [{ id: "1", name: "Lucali", area: "Brooklyn", cuisines: ["italian", "pizza"], distanceKm: 1.2, independentMentions: 8, latestEvidenceAt: "2026-07-30T00:00:00Z", sourceUrls: ["https://instagram.com/p/example"], score: 10, scoreBreakdown: {} }], updatedAt: "2026-07-30T00:00:00Z", refreshStatus: "queued" }),
};

function requestBody(fetchMock: ReturnType<typeof vi.fn>) {
  return JSON.parse(fetchMock.mock.calls[0][1].body as string);
}

it("searches top food with current coordinates from the primary action", async () => {
  const fetchMock = vi.fn().mockResolvedValue(successfulSearch);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: (success: PositionCallback) => success({ coords: { latitude: 40.7, longitude: -74 } } as GeolocationPosition) } });
  render(<SearchExperience />);

  fireEvent.click(screen.getByRole("button", { name: "Find Top Food Near Me" }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  expect(requestBody(fetchMock)).toEqual({ area: "", latitude: 40.7, longitude: -74, cuisines: [] });
  expect(await screen.findByRole("heading", { name: "Lucali" })).toBeVisible();
});

it("uses AND semantics for multiple cuisines when searching the current area", async () => {
  const fetchMock = vi.fn().mockResolvedValue(successfulSearch);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: (success: PositionCallback) => success({ coords: { latitude: 41.9, longitude: -87.6 } } as GeolocationPosition) } });
  render(<SearchExperience />);

  fireEvent.click(screen.getByRole("button", { name: "Italian" }));
  fireEvent.click(screen.getByRole("button", { name: "Pizza" }));
  fireEvent.click(screen.getByRole("button", { name: /search selected cuisines near me/i }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  expect(requestBody(fetchMock)).toEqual({ area: "", latitude: 41.9, longitude: -87.6, cuisines: ["italian", "pizza"] });
});

it("reveals city or ZIP fallback when location permission is denied", async () => {
  const fetchMock = vi.fn().mockResolvedValue(successfulSearch);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: (_ok: unknown, denied: (error: Error) => void) => denied(new Error("denied")) } });
  render(<SearchExperience />);

  expect(screen.queryByLabelText(/city or zip code/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Find Top Food Near Me" }));

  expect(await screen.findByText(/enter a city or zip code/i)).toBeVisible();
  fireEvent.change(screen.getByLabelText(/city or zip code/i), { target: { value: "11201" } });
  fireEvent.click(screen.getByRole("button", { name: /search this location/i }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  expect(requestBody(fetchMock)).toEqual({ area: "11201", cuisines: [] });
});

it("reveals city or ZIP fallback when browser location is unavailable", async () => {
  vi.stubGlobal("navigator", {});
  render(<SearchExperience />);

  fireEvent.click(screen.getByRole("button", { name: /search selected cuisines near me/i }));

  expect(await screen.findByLabelText(/city or zip code/i)).toBeEnabled();
});
