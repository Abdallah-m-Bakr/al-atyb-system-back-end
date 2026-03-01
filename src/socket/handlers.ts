import { Server, Socket } from "socket.io";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import { createMessage } from "../services/chat.service";
import { SocketAuthContext } from "./auth";

interface SendMessagePayload {
  roomId: string;
  text: string;
}

export const attachSocketHandlers = (io: Server, socket: Socket, auth: SocketAuthContext) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // socket.on("join_room", (payload: { roomId: string }) => {
  //   if (payload?.roomId) {
  //     socket.join(payload.roomId);
  //   }
  // });
  //
  // socket.on("leave_room", (payload: { roomId: string }) => {
  //   if (payload?.roomId) {
  //     socket.leave(payload.roomId);
  //   }
  // });
  //
  // socket.on("send_message", async (payload: SendMessagePayload) => {
  //   const text = String(payload?.text || "").trim();
  //
  //   if (!payload?.roomId || !text) {
  //     return;
  //   }
  //
  //   if (!auth.permissions.includes("chat_send_message")) {
  //     socket.emit("socket_error", { message: "Forbidden" });
  //     return;
  //   }
  //
  //   try {
  //     const message = await createMessage({
  //       roomId: payload.roomId,
  //       senderUserId: auth.userId,
  //       senderName: auth.username,
  //       senderRoleKey: auth.roleKey,
  //       text
  //     });
  //
  //     io.to(payload.roomId).emit("new_message", message);
  //   } catch (error) {
  //     socket.emit("socket_error", { message: (error as Error).message });
  //   }
  // });
  void io;
  void socket;
  void auth;
};
