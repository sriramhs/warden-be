import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";
import keyFor, { cacheGet, cacheSet } from "../utils/cacheUtils";
import { WeatherSnapshot } from "../types/weatherSnapshot";
import { clamp } from "../utils/mathUtils";
import { WEATHER_CONCURRENCY } from "../constants/constants";
import { getWeatherFilteredResults } from "../services/getWeatherFilteredData";
import { buildPropertyWhere } from "../utils/dbUtils";





// simple in-memory cache. For production swap with Redis.
const weatherCache = new Map<string, { data: WeatherSnapshot; expiresAt: number }>();







export const getProperties = async (req: Request, res: Response) => {
  try {
    const searchFilteredResults = await prisma.property.findMany({
      take: 20,
      where: buildPropertyWhere(req),
    });

    const weatherFilteredResults = await getWeatherFilteredResults(req,searchFilteredResults,weatherCache)
    console.log(weatherFilteredResults,"dsfdsfsd")
    return res.json(weatherFilteredResults);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
