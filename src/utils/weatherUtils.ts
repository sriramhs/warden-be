import { WEATHER_GROUPS } from "../constants/constants";
import { clamp } from "./mathUtils";

export function buildFilters(req: any) {
  const tempMinRaw = req.query.temp_min
    ? Number(req.query.temp_min)
    : undefined;
  const tempMaxRaw = req.query.temp_max
    ? Number(req.query.temp_max)
    : undefined;
  const humMinRaw = req.query.hum_min ? Number(req.query.hum_min) : undefined;
  const humMaxRaw = req.query.hum_max ? Number(req.query.hum_max) : undefined;

  const tempMin =
    typeof tempMinRaw === "number" && !Number.isNaN(tempMinRaw)
      ? clamp(tempMinRaw, -20, 50)
      : undefined;
  const tempMax =
    typeof tempMaxRaw === "number" && !Number.isNaN(tempMaxRaw)
      ? clamp(tempMaxRaw, -20, 50)
      : undefined;
  const humMin =
    typeof humMinRaw === "number" && !Number.isNaN(humMinRaw)
      ? clamp(humMinRaw, 0, 100)
      : undefined;
  const humMax =
    typeof humMaxRaw === "number" && !Number.isNaN(humMaxRaw)
      ? clamp(humMaxRaw, 0, 100)
      : undefined;

  const conditionsRaw =
    typeof req.query.conditions === "string" ? req.query.conditions : undefined;
  const codesRaw =
    typeof req.query.weather_codes === "string"
      ? req.query.weather_codes
      : undefined;

  return { tempMin, tempMax, humMin, humMax, conditionsRaw, codesRaw };
}

export function filterWeather({
  combined,
  tempMin,
  tempMax,
  humMin,
  humMax,
  weatherCodes,
}: any) {
  combined.filter((item: { weather: any }) => {
    const w = item.weather;

    const hasAnyWeatherFilter =
      tempMin !== undefined ||
      tempMax !== undefined ||
      humMin !== undefined ||
      humMax !== undefined ||
      (weatherCodes && weatherCodes.length > 0);

    if (
      hasAnyWeatherFilter &&
      w.temperature === null &&
      w.humidity === null &&
      w.weathercode === null
    ) {
      return false;
    }

    if (
      tempMin !== undefined &&
      (w.temperature === null || w.temperature < tempMin)
    )
      return false;
    if (
      tempMax !== undefined &&
      (w.temperature === null || w.temperature > tempMax)
    )
      return false;

    if (humMin !== undefined && (w.humidity === null || w.humidity < humMin))
      return false;
    if (humMax !== undefined && (w.humidity === null || w.humidity > humMax))
      return false;

    if (weatherCodes && weatherCodes.length > 0) {
      if (w.weathercode === null) return false;
      if (!weatherCodes.includes(w.weathercode)) return false;
    }

    return true;
  });

  return combined
}

export function combineResults(searchFilteredResults:any,weatherSnapshots:any){

return  searchFilteredResults.map((p:any, idx:number) => {
      const s = weatherSnapshots[idx];
      return {
        property: p,
        weather: s,
      };
    });
}

export function buildCoords (searchFilteredResults:any){ return searchFilteredResults.map((p:any) => {
      return { lat: Number(p.lat), lon: Number(p.lng) };
    });}

    export function buildWeatherCodes (conditionsRaw:any,weatherCodes:any ,codesRaw:any) {
      if (conditionsRaw) {
            const parts = conditionsRaw.split(",").map((p: string) => p.trim().toLowerCase()).filter(Boolean);
            const codes: number[] = [];
            for (const p of parts) {
              if (WEATHER_GROUPS[p]) {
                codes.push(...WEATHER_GROUPS[p]);
              }
            }
            if (codes.length > 0) weatherCodes = Array.from(new Set(codes));
          }
      
          if (!weatherCodes && codesRaw) {
            const parts = codesRaw.split(",").map((s: string) => Number(s.trim())).filter((n: unknown) => !Number.isNaN(n));
            if (parts.length > 0) weatherCodes = Array.from(new Set(parts));
          }
    }