import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export const getProperties = async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({ take: 20 });
    return res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
