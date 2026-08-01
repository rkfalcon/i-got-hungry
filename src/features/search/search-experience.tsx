"use client";

import { FormEvent, useState } from "react";
import type { RankedRestaurant, SearchResponse } from "./types";
import { AuthPanel } from "@/features/auth/auth-panel";

const cuisineOptions = ["Italian", "Pizza", "Thai", "Southern", "Mexican", "Japanese"];
const shortDateFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

function RestaurantCard({ restaurant }: { restaurant: RankedRestaurant }) {
  const freshness = shortDateFormatter.format(new Date(restaurant.latestEvidenceAt));
  return (
    <article className="restaurant-card">
      <div><p className="eyebrow">{restaurant.distanceKm.toFixed(1)} km away</p><h2>{restaurant.name}</h2></div>
      <p>{restaurant.cuisines.join(" · ")}</p>
      <p><strong>{restaurant.independentMentions} independent mentions</strong> · Evidence from {freshness}</p>
      {restaurant.sourceUrls[0] ? <a href={restaurant.sourceUrls[0]} target="_blank" rel="noreferrer">View public Instagram evidence ↗</a> : null}
    </article>
  );
}

export function SearchExperience() {
  const [area, setArea] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [typedCuisine, setTypedCuisine] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [showLocationFallback, setShowLocationFallback] = useState(false);
  const [response, setResponse] = useState<SearchResponse>();
  const [status, setStatus] = useState<"idle" | "locating" | "loading" | "error">("idle");
  const [showAuth, setShowAuth] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const selectedCuisines = [...cuisines, typedCuisine.trim().toLowerCase()].filter(Boolean);

  const toggleCuisine = (cuisine: string) => setCuisines((current) => current.includes(cuisine.toLowerCase()) ? current.filter((item) => item !== cuisine.toLowerCase()) : [...current, cuisine.toLowerCase()]);

  const search = async (input: { area?: string; latitude?: number; longitude?: number; cuisines: string[] }) => {
    setStatus("loading");
    try {
      const result = await fetch("/api/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
      if (!result.ok) { setStatus("error"); return; }
      setResponse(await result.json());
      setStatus("idle");
    } catch { setStatus("error"); }
  };

  const searchCurrentArea = (searchCuisines: string[]) => {
    setLocationMessage("");
    setShowLocationFallback(false);
    if (!navigator.geolocation) {
      setShowLocationFallback(true);
      setLocationMessage("Browser location is unavailable. Enter a city or ZIP code instead.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationMessage("Using your current location.");
        void search({ area: "", latitude: coords.latitude, longitude: coords.longitude, cuisines: searchCuisines });
      },
      () => {
        setStatus("idle");
        setShowLocationFallback(true);
        setLocationMessage("We couldn't access your location. Enter a city or ZIP code instead.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  };

  const submitFallback = (event: FormEvent) => {
    event.preventDefault();
    void search({ area, cuisines: selectedCuisines });
  };

  const save = async () => {
    const result = await fetch("/api/saved-searches", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ area, cuisines: selectedCuisines }) });
    if (result.status === 401 || result.status === 503) { setShowAuth(true); return; }
    setSaveMessage(result.ok ? "Search saved." : "We couldn't save this search.");
  };

  return (
    <div className="search-experience">
      <section className="hero" aria-labelledby="page-title">
        <p className="brand">I Got Hungry</p>
        <h1 id="page-title">Good food is already being talked about.</h1>
        <p className="lede">Find nearby restaurants through fresh public Instagram posts, Reels, and hashtags.</p>
        <button className="primary" type="button" disabled={status === "locating" || status === "loading"} onClick={() => searchCurrentArea([])}>Find Top Food Near Me</button>
        {locationMessage ? <p role="status">{locationMessage}</p> : null}
      </section>
      <section className="search-form" aria-labelledby="cuisine-heading">
        <fieldset><legend id="cuisine-heading">Choose cuisines <span>Select one or more</span></legend><div className="chips">{cuisineOptions.map((cuisine) => <button aria-pressed={cuisines.includes(cuisine.toLowerCase())} className={cuisines.includes(cuisine.toLowerCase()) ? "chip selected" : "chip"} type="button" key={cuisine} onClick={() => toggleCuisine(cuisine)}>{cuisine}</button>)}</div></fieldset>
        <details><summary>Another cuisine</summary><div className="custom-cuisine"><label htmlFor="cuisine">Cuisine</label><input id="cuisine" value={typedCuisine} onChange={(event) => setTypedCuisine(event.target.value)} placeholder="Type a cuisine" /></div></details>
        <button className="primary" type="button" disabled={status === "locating" || status === "loading"} onClick={() => searchCurrentArea(selectedCuisines)}>{status === "locating" ? "Finding your location…" : "Search selected cuisines near me"}</button>
        {showLocationFallback ? <form className="location-fallback" onSubmit={submitFallback}><div><label htmlFor="area">City or ZIP code</label><input id="area" required value={area} onChange={(event) => setArea(event.target.value)} placeholder="Try Brooklyn or 11201" /></div><button className="secondary" type="submit" disabled={status === "loading"}>{status === "loading" ? "Finding food…" : "Search this location"}</button></form> : null}
        {status === "error" ? <p role="alert">Choose a location to search.</p> : null}
        <p className="ranking-note">Top means nearby with strong, recent Instagram attention—not star ratings. Multiple cuisines must all match.</p>
      </section>
      {response ? <section className="results" aria-live="polite"><div><p className="eyebrow">Top nearby</p><h2>{response.restaurants.length ? `${response.restaurants.length} places worth a look` : "No cached matches yet"}</h2>{response.refreshStatus === "unavailable" ? <p>Showing the latest successful recommendations. Refresh is delayed.</p> : null}<button type="button" onClick={save}>Save this search</button>{saveMessage ? <p role="status">{saveMessage}</p> : null}{showAuth ? <AuthPanel /> : null}</div>{response.restaurants.map((restaurant) => <RestaurantCard restaurant={restaurant} key={restaurant.id} />)}</section> : null}
    </div>
  );
}
