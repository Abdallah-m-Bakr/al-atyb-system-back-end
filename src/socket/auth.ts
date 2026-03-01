import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { resolveEffectivePermissions } from "../utils/permissionResolver";

export interface SocketAuthContext {
  userId: string;
  username: string;
  roleKey: string;
  permissions: string[];
}

export const authenticateSocket = async (socket: Socket): Promise<SocketAuthContext> => {
  const token = String(socket.handshake.auth?.token || "");

  if (!token) {
    throw new Error("Unauthorized socket");
  }

  const payload = verifyAccessToken(token);
  const resolved = await resolveEffectivePermissions(payload.sub);

  return {
    userId: payload.sub,
    username: resolved.username,
    roleKey: resolved.roleKey,
    permissions: resolved.permissions
  };
};
