import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { isAllowedOrigin } from "./config/cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "alateeb-backend"
  });
});

app.use("/api", routes);
app.use(errorHandler);
