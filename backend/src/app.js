import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import authRouter from "./modules/auth/index.js";
import paymentRouter from "./modules/payment/index.js";
import adminRouter from "./modules/admin/index.js";
import memberRouter from "./modules/member/index.js";
import uploadRouter from "./modules/upload/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// Restrict CORS to known frontend domains, supporting multiple development ports
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve uploads directory statically (pointing to root uploads/)
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Mount routes
app.use("/api/auth", authRouter);
app.use("/api/auth/payment", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/members", memberRouter);
app.use("/api/uploads", uploadRouter);

export default app;
