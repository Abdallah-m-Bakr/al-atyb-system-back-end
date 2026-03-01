import { Request, Response } from "express";
import { getDefinitions, updateDefinitions } from "../services/settings.service";

export const getDefinitionsController = async (_req: Request, res: Response) => {
  const items = await getDefinitions();
  return res.json({ items });
};

export const updateDefinitionsController = async (req: Request, res: Response) => {
  const categories = Array.isArray(req.body?.categories) ? req.body.categories : req.body || [];
  const items = await updateDefinitions(categories);
  return res.json({ items });
};
