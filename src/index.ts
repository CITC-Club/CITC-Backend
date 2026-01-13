import express from "express";

import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import projectRoutes from "./routes/projectRoutes";
import teamRoutes from "./routes/teamRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5053;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan("dev"));
app.use(express.json());
// create static middleware with a cast to avoid a TS typing issue in some configs
const mediaStatic = (express as any).static(path.join(__dirname, "../media"));
app.use("/media", mediaStatic);

// Routes
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/projects", projectRoutes);
app.use("/team", teamRoutes);

app.get("/", (req, res) => {
  res.send("CITC API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
