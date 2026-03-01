import { NextFunction, Request, Response } from "express";
import { PermissionKey } from "../constants/permissions";

export const requireAnyPermission = (permissions: PermissionKey[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions = req.auth?.permissions || [];

    const allowed = permissions.some((permission) => userPermissions.includes(permission));

    if (!allowed) {
      return res.status(403).json({ message: "Forbidden", missingAnyOf: permissions });
    }

    return next();
  };
};
