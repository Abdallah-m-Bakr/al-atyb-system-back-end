import { Request, Response } from "express";
import { getDefinitions, updateDefinitions } from "../services/settings.service";
import { parseSettingsDefinitionsPayload } from "../validation/requestValidation";

export const getDefinitionsController = async (_req: Request, res: Response) => {
  const items = await getDefinitions();
  return res.json({ items });
};

export const updateDefinitionsController = async (req: Request, res: Response) => {
  try {
    const rawCategories = Array.isArray(req.body?.categories) ? req.body.categories : req.body || [];
    const categories = parseSettingsDefinitionsPayload(rawCategories);
    const items = await updateDefinitions(categories);
    return res.json({ items });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};
