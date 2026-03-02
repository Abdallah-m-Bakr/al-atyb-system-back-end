import { UserModel } from "../models/User";
import { comparePassword, hashPassword, hashRefreshToken } from "../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { randomSessionId } from "../utils/credentials";
import { resolveEffectivePermissions } from "../utils/permissionResolver";
import { toAuthUserResponse } from "../utils/sanitize";

const parseTtlToMs = (ttl: string): number => {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) return 30 * 24 * 60 * 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "s") return value * 1000;
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
};

export const loginWithCredentials = async (params: {
  username: string;
  password: string;
  accessTtl: string;
  refreshTtl: string;
  userAgent: string;
  ip: string;
}) => {
  const user = await UserModel.findOne({ username: params.username }).lean();

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status !== "Active") {
    throw new Error("Account is suspended");
  }

  const passwordOk = await comparePassword(params.password, user.passwordHash);
  if (!passwordOk) {
    throw new Error("Invalid credentials");
  }

  const resolved = await resolveEffectivePermissions(user._id.toString());
  const sessionId = randomSessionId();

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    username: user.username,
    roleKey: resolved.roleKey
  });

  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    sid: sessionId
  });

  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseTtlToMs(params.refreshTtl));

  await UserModel.updateOne(
    { _id: user._id },
    {
      $push: {
        sessions: {
          sessionId,
          refreshTokenHash,
          expiresAt,
          userAgent: params.userAgent,
          ip: params.ip,
          revokedAt: null
        }
      }
    }
  );

  return {
    accessToken,
    refreshToken,
    user: toAuthUserResponse(user, resolved.roleKey, resolved.permissions)
  };
};

export const refreshAccessToken = async (params: {
  refreshToken: string;
  userAgent: string;
  ip: string;
}) => {
  const payload = verifyRefreshToken(params.refreshToken);
  const user = await UserModel.findById(payload.sub);

  if (!user) {
    throw new Error("Invalid refresh token");
  }

  const session = user.sessions.find((item: any) => item.sessionId === payload.sid);

  if (!session || session.revokedAt || new Date(session.expiresAt).getTime() < Date.now()) {
    throw new Error("Refresh session expired or revoked");
  }

  const incomingHash = hashRefreshToken(params.refreshToken);
  if (session.refreshTokenHash !== incomingHash) {
    throw new Error("Invalid refresh token");
  }

  const resolved = await resolveEffectivePermissions(user._id.toString());

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    username: user.username,
    roleKey: resolved.roleKey
  });

  return {
    accessToken,
    user: toAuthUserResponse(user.toObject(), resolved.roleKey, resolved.permissions)
  };
};

export const revokeRefreshSession = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await UserModel.updateOne(
      { _id: payload.sub, "sessions.sessionId": payload.sid },
      { $set: { "sessions.$.revokedAt": new Date() } }
    );
  } catch {
    // noop
  }
};

export const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findById(userId).lean();

  if (!user) {
    throw new Error("User not found");
  }

  const resolved = await resolveEffectivePermissions(userId);

  return toAuthUserResponse(user, resolved.roleKey, resolved.permissions);
};

export const changeCurrentCredentials = async (params: {
  userId: string;
  currentPassword: string;
  newUsername?: string;
  newPassword?: string;
}) => {
  const user = await UserModel.findById(params.userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  const passwordOk = await comparePassword(params.currentPassword, user.passwordHash);
  if (!passwordOk) {
    throw new Error("Current password is incorrect");
  }

  const updatePayload: Record<string, unknown> = {};

  if (params.newUsername?.trim()) {
    updatePayload.username = params.newUsername.trim();
  }

  if (params.newPassword) {
    updatePayload.passwordHash = await hashPassword(params.newPassword);
  }

  if (Object.keys(updatePayload).length > 0) {
    await UserModel.updateOne({ _id: params.userId }, { $set: updatePayload });
  }

  const updatedUser = await UserModel.findById(params.userId).lean();
  if (!updatedUser) {
    throw new Error("User not found");
  }

  const resolved = await resolveEffectivePermissions(params.userId);
  return toAuthUserResponse(updatedUser, resolved.roleKey, resolved.permissions);
};
