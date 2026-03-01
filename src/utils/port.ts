import net from "net";

const canListenOnPort = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => {
        resolve(true);
      });
    });

    // Match Node's default host resolution used by http.Server.listen(port).
    server.listen(port);
  });
};

export const findAvailablePort = async (preferredPort: number, maxOffset = 100): Promise<number> => {
  const normalizedPreferred = Number.isFinite(preferredPort) && preferredPort > 0 ? preferredPort : 4000;

  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const candidate = normalizedPreferred + offset;
    const available = await canListenOnPort(candidate);
    if (available) return candidate;
  }

  return normalizedPreferred;
};
