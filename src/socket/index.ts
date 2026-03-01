import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { isAllowedOrigin } from "../config/cors";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import { authenticateSocket } from "./auth";
// import { attachSocketHandlers } from "./handlers";

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true
    }
  });

  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // io.use(async (socket, next) => {
  //   try {
  //     const auth = await authenticateSocket(socket);
  //     (socket.data as any).auth = auth;
  //     next();
  //   } catch (error) {
  //     next(error as Error);
  //   }
  // });
  //
  // io.on("connection", (socket) => {
  //   const auth = (socket.data as any).auth;
  //   attachSocketHandlers(io, socket, auth);
  // });

  return io;
};
