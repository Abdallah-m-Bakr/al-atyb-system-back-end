import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { runSeedIfNeeded } from "./services/seed.service";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import { createSocketServer } from "./socket";
import { findAvailablePort } from "./utils/port";

const bootstrap = async () => {
  await connectDb();
  await runSeedIfNeeded();

  const server = http.createServer(app);
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // createSocketServer(server);

  const preferredPort = env.PORT;
  const availablePort = await findAvailablePort(preferredPort);
  const runtimeMode = process.env.NODE_ENV === "production" ? "production" : "local";

  server.listen(availablePort, () => {
    if (availablePort !== preferredPort) {
      console.log(`Preferred port ${preferredPort} is busy, switched to ${availablePort}`);
    }

    console.log(`API server running in ${runtimeMode} mode on port ${availablePort}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
