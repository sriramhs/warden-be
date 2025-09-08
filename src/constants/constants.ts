export const WEATHER_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
export const WEATHER_CONCURRENCY = 10;

export const WEATHER_GROUPS: Record<string, number[]> = {
  clear: [0],
  cloudy: [1, 2, 3],
  drizzle: Array.from({ length: 57 - 51 + 1 }, (_, i) => 51 + i), // 51..57
  rainy: [
    ...Array.from({ length: 67 - 61 + 1 }, (_, i) => 61 + i), // 61..67
    80, 81, 82,
  ],
  snow: [
    ...Array.from({ length: 77 - 71 + 1 }, (_, i) => 71 + i), // 71..77
    85, 86,
  ],
};