import { Request, Response } from "express";
import { listRoles, updateRolePermissions } from "../services/roles.service";

export const listRolesController = async (_req: Request, res: Response) => {
  const items = await listRoles();
  return res.json({ items });
};

export const updateRolePermissionsController = async (req: Request, res: Response) => {
  try {
    const roleId = req.params.id;
    const permissions = Array.isArray(req.body?.permissions) ? req.body.permissions : [];

    const item = await updateRolePermissions(roleId, permissions);

    if (!item) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};
