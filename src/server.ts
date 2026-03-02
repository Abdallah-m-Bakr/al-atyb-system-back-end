import http from "http";
import { app } from "./app";
import { connectDb } from "./config/db";
import { resetDatabaseForDemo, runSeedIfNeeded } from "./services/seed.service";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import { createSocketServer } from "./socket";

const bootstrap = async () => {
  await connectDb();

  if (process.env.NODE_ENV === "production") {
    await resetDatabaseForDemo();
  } else {
    await runSeedIfNeeded();
  }

  const server = http.createServer(app);
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // createSocketServer(server);

  const port = Number(process.env.PORT) || 4000;
  const runtimeMode = process.env.NODE_ENV === "production" ? "production" : "local";

  server.listen(port, () => {
    console.log(`API server running in ${runtimeMode} mode on port ${port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
