import { Request, Response } from "express";
import { env } from "../config/env";
import {
  changeCurrentCredentials,
  getCurrentUser,
  loginWithCredentials,
  refreshAccessToken,
  revokeRefreshSession
} from "../services/auth.service";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  path: "/"
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    const result = await loginWithCredentials({
      username,
      password,
      accessTtl: env.ACCESS_TOKEN_TTL,
      refreshTtl: env.REFRESH_TOKEN_TTL,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || ""
    });

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);

    return res.json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const result = await refreshAccessToken({
      refreshToken,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || ""
    });

    return res.json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await revokeRefreshSession(refreshToken);
  }

  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  return res.json({ success: true });
};

export const meController = async (req: Request, res: Response) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getCurrentUser(req.auth.userId);
    return res.json({ user });
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
};

export const changeCredentialsController = async (req: Request, res: Response) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentPassword = String(req.body?.currentPassword || "").trim();
    const newUsernameRaw = req.body?.newUsername;
    const newPasswordRaw = req.body?.newPassword;

    if (!currentPassword) {
      return res.status(400).json({ message: "currentPassword is required" });
    }

    const newUsername =
      typeof newUsernameRaw === "string" && newUsernameRaw.trim()
        ? newUsernameRaw.trim()
        : undefined;

    if (newUsernameRaw !== undefined && !newUsername) {
      return res.status(400).json({ message: "newUsername cannot be empty" });
    }

    const newPassword =
      typeof newPasswordRaw === "string" && newPasswordRaw.length > 0
        ? newPasswordRaw
        : undefined;

    if (newPasswordRaw !== undefined && (!newPassword || newPassword.length < 6)) {
      return res.status(400).json({ message: "newPassword must be at least 6 characters" });
    }

    const user = await changeCurrentCredentials({
      userId: req.auth.userId,
      currentPassword,
      newUsername,
      newPassword
    });

    return res.json({ user });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};
