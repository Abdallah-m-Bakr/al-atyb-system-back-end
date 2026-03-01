import { NextFunction, Request, Response } from "express";
import { PermissionKey } from "../constants/permissions";

export const requirePermission = (permission: PermissionKey) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const perms = req.auth?.permissions || [];

    if (!perms.includes(permission)) {
      return res.status(403).json({ message: "Forbidden", missingPermission: permission });
    }

    return next();
  };
};
