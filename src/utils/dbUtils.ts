import { Prisma } from "@prisma/client";

export function buildPropertyWhere(
  req: any
): Prisma.PropertyWhereInput | undefined {

   const { searchText } = req.query;

  if (typeof searchText !== "string") {
    return undefined;
  }
   const terms = searchText
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (terms.length === 0) {
    return undefined;
  }

   const andBlocks = terms.map((query) => ({
    OR: [
      { name: { contains: query } },
      { city: { contains: query } },
      { state: { contains: query } },
      { tags: { array_contains: query } }, 
    ],
  }));


  return {
    AND: andBlocks,
  };
}