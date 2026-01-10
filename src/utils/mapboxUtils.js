export async function fetchSuggestions(query, isCoord = false) {
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const endpoint = isCoord
    ? `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${accessToken}`
    : `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${accessToken}&autocomplete=true&limit=5`;

  const res = await fetch(endpoint);
  const data = await res.json();
  return data.features;
}
