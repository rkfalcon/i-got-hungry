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
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>();
  const [locationMessage, setLocationMessage] = useState("");
  const [response, setResponse] = useState<SearchResponse>();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [showAuth, setShowAuth] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const selectedCuisines = [...cuisines, typedCuisine.trim().toLowerCase()].filter(Boolean);

  const useLocation = () => {
    if (!navigator.geolocation) return setLocationMessage("Location is unavailable. Enter a city or neighborhood instead.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setCoordinates({ latitude: coords.latitude, longitude: coords.longitude }); setLocationMessage("Current location ready."); },
      () => setLocationMessage("We couldn't access your location. Enter a city or neighborhood instead."),
    );
  };

  const toggleCuisine = (cuisine: string) => setCuisines((current) => current.includes(cuisine.toLowerCase()) ? current.filter((item) => item !== cuisine.toLowerCase()) : [...current, cuisine.toLowerCase()]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    const result = await fetch("/api/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ area, ...coordinates, cuisines: selectedCuisines }) });
    if (!result.ok) { setStatus("error"); return; }
    setResponse(await result.json());
    setStatus("idle");
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
        <p className="lede">Find nearby restaurants through fresh public Instagram recommendations.</p>
        <button className="primary" type="button" onClick={useLocation}>Find food near me</button>
        {locationMessage ? <p role="status">{locationMessage}</p> : null}
      </section>
      <form onSubmit={submit} className="search-form">
        <div><label htmlFor="area">City or neighborhood</label><input id="area" value={area} onChange={(event) => setArea(event.target.value)} placeholder="Try Brooklyn or Logan Square" /></div>
        <fieldset><legend>What sounds good? <span>Optional</span></legend><div className="chips">{cuisineOptions.map((cuisine) => <button className={cuisines.includes(cuisine.toLowerCase()) ? "chip selected" : "chip"} type="button" key={cuisine} onClick={() => toggleCuisine(cuisine)}>{cuisine}</button>)}</div></fieldset>
        <div><label htmlFor="cuisine">Another cuisine</label><input id="cuisine" value={typedCuisine} onChange={(event) => setTypedCuisine(event.target.value)} placeholder="Type a cuisine" /></div>
        <button className="primary" type="submit" disabled={status === "loading"}>{status === "loading" ? "Finding food…" : "Search this area"}</button>
        {status === "error" ? <p role="alert">Choose a location to search.</p> : null}
      </form>
      {response ? <section className="results" aria-live="polite"><div><p className="eyebrow">Best nearby</p><h2>{response.restaurants.length ? `${response.restaurants.length} places worth a look` : "No cached matches yet"}</h2>{response.refreshStatus === "unavailable" ? <p>Showing the latest successful recommendations. Refresh is delayed.</p> : null}<button type="button" onClick={save}>Save this search</button>{saveMessage ? <p role="status">{saveMessage}</p> : null}{showAuth ? <AuthPanel /> : null}</div>{response.restaurants.map((restaurant) => <RestaurantCard restaurant={restaurant} key={restaurant.id} />)}</section> : null}
    </div>
  );
}
