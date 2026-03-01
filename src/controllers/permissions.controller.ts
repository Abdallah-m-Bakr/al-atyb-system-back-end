import { Request, Response } from "express";
import { PERMISSIONS } from "../constants/permissions";

export const permissionsController = async (_req: Request, res: Response) => {
  return res.json({ items: PERMISSIONS });
};
