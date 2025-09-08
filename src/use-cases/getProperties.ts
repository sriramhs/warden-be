import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { WeatherSnapshot } from "../types/weatherSnapshot";
import { getWeatherFilteredResults } from "../services/getWeatherFilteredData";
import { buildPropertyWhere } from "../utils/dbUtils";


// can use redis later
const weatherCache = new Map<string, { data: WeatherSnapshot; expiresAt: number }>();


export const getProperties = async (req: Request, res: Response) => {
  try {
    const searchFilteredResults = await prisma.property.findMany({
      take: 20,
      where: buildPropertyWhere(req),
    });

    const weatherFilteredResults = await getWeatherFilteredResults(req,searchFilteredResults,weatherCache)
    return res.json(weatherFilteredResults);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
