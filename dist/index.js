"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5053;
// Middlewar
// Allow CORS from the frontend (default http://localhost:5173) or from FRONTEND_URL env var
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// create static middleware with a cast to avoid a TS typing issue in some configs
const mediaStatic = express_1.default.static(path_1.default.join(__dirname, "../media"));
app.use("/media", mediaStatic);
// Routes
app.use("/auth", authRoutes_1.default);
app.use("/events", eventRoutes_1.default);
app.use("/projects", projectRoutes_1.default);
app.use("/team", teamRoutes_1.default);
app.get("/", (req, res) => {
    res.send("CITC API is running");
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
