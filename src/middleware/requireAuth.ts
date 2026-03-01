import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { resolveEffectivePermissions } from "../utils/permissionResolver";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const payload = verifyAccessToken(token);
    const resolved = await resolveEffectivePermissions(payload.sub);

    req.auth = {
      userId: payload.sub,
      username: resolved.username,
      roleKey: resolved.roleKey,
      permissions: resolved.permissions
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
