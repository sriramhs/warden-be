import { Prisma } from "@prisma/client";
import { WEATHER_CONCURRENCY, WEATHER_GROUPS } from "../constants/constants";
import keyFor, { cacheGet, cacheSet } from "../utils/cacheUtils";
import { WeatherSnapshot } from "../types/weatherSnapshot";
import {
  buildCoords,
  buildFilters,
  buildWeatherCodes,
  combineResults,
  filterWeather,
} from "../utils/weatherUtils";

async function fetchFromApiAndCache(
  lat: number,
  lon: number,
  key: string,
  weatherCache: any
): Promise<void> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
    lat
  )}&longitude=${encodeURIComponent(
    lon
  )}&current=temperature_2m,relative_humidity_2m,weather_code&forecast_days=1`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`open-meteo ${resp.status}`);
    }
    const json = await resp.json();

    const temperature = json?.current?.temperature_2m ?? null;
    const humidity = json?.current?.relative_humidity_2m ?? null;
    const weathercode = json?.current?.weather_code ?? null;

    const snapshot: WeatherSnapshot = {
      temperature,
      humidity,
      weathercode,
      fetchedAt: Date.now(),
    };

    cacheSet(key, snapshot, weatherCache);
  } catch (err) {
    const snapshot: WeatherSnapshot = {
      temperature: null,
      humidity: null,
      weathercode: null,
      fetchedAt: Date.now(),
    };
    cacheSet(key, snapshot, weatherCache);
  }
}

async function fetchWeatherBatchDedup(
  coords: { lat: number; lon: number }[],
  weatherCache: any
): Promise<WeatherSnapshot[]> {
  const keys = coords.map(({ lat, lon }) => keyFor(lat, lon));

  const indicesByKey = new Map<string, number[]>();
  coords.forEach((_, idx) => {
    const k = keys[idx];
    const arr = indicesByKey.get(k);
    if (arr) arr.push(idx);
    else indicesByKey.set(k, [idx]);
  });

  const uniqueKeys = Array.from(indicesByKey.keys());
  const missingKeys: { key: string; lat: number; lon: number }[] = [];

  const repLatLon = new Map<string, { lat: number; lon: number }>();
  uniqueKeys.forEach((k, idx) => {
    const firstIdx = indicesByKey.get(k)![0];
    repLatLon.set(k, coords[firstIdx]);
  });

  for (const k of uniqueKeys) {
    const cached = cacheGet(k, weatherCache);
    if (!cached) {
      const { lat, lon } = repLatLon.get(k)!;
      missingKeys.push({ key: k, lat, lon });
    }
  }

  if (missingKeys.length > 0) {
    let idx = 0;
    const workers: Promise<void>[] = [];
    const numWorkers = Math.min(WEATHER_CONCURRENCY, missingKeys.length);

    async function worker() {
      while (true) {
        const i = idx++;
        if (i >= missingKeys.length) break;
        const { key, lat, lon } = missingKeys[i];
        await fetchFromApiAndCache(lat, lon, key, weatherCache);
      }
    }

    for (let w = 0; w < numWorkers; w++) workers.push(worker());
    await Promise.all(workers);
  }

  const results: WeatherSnapshot[] = coords.map((c, i) => {
    const k = keys[i];
    const cached = cacheGet(k, weatherCache);
    if (cached) return cached;
    return {
      temperature: null,
      humidity: null,
      weathercode: null,
      fetchedAt: Date.now(),
    };
  });

  return results;
}

export async function getWeatherFilteredResults(
  req: any,
  searchFilteredResults: {
    tags: Prisma.JsonValue | null;
    state: string | null;
    city: string | null;
    name: string;
    id: number;
    country: string | null;
    lat: number | null;
    lng: number | null;
    geohash5: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[],
  weatherCache: any
) {
  const { tempMin, tempMax, humMin, humMax, conditionsRaw, codesRaw } =
    buildFilters(req);

  let weatherCodes: number[] | undefined = undefined;

  buildWeatherCodes(conditionsRaw, weatherCodes, codesRaw);

  const coords = buildCoords(searchFilteredResults);
  const weatherSnapshots = await fetchWeatherBatchDedup(coords, weatherCache);

  const combined = combineResults(searchFilteredResults, weatherSnapshots);

  const filtered = filterWeather({
    combined,
    tempMin,
    tempMax,
    humMin,
    humMax,
    weatherCodes,
  });

  return filtered;
}
