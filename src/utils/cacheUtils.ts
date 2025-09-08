import { WEATHER_CACHE_TTL_MS } from "../constants/constants";
import { WeatherSnapshot } from "../types/weatherSnapshot";

export default function keyFor(lat: number, lon: number) {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

export function cacheGet(key: string,weatherCache : Map<string, { data: WeatherSnapshot; expiresAt: number }>): WeatherSnapshot | undefined {
  const entry = weatherCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    weatherCache.delete(key);
    return undefined;
  }
  return entry.data;
}
export function cacheSet(key: string, data: WeatherSnapshot ,weatherCache : Map<string, { data: WeatherSnapshot; expiresAt: number }>) {
  weatherCache.set(key, { data, expiresAt: Date.now() + WEATHER_CACHE_TTL_MS });
}