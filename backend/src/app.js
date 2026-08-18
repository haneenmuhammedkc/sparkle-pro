import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { successResponse } from "./utils/apiResponse.js";
import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

import authRoutes from './modules/auth/auth.routes.js';
import businessRoutes from './modules/onboarding/onboarding.routes.js';
import jobRoutes from './modules/jobs/jobs.routes.js';
import publicTrackRoutes from './modules/jobs/public-track.routes.js';
import customerRoutes from './modules/customers/customers.routes.js';
import staffRoutes from './modules/staff/staff.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';

const app = express();

// Security Middleware
app.use(helmet());

// Cookie Parser Middleware
app.use(cookieParser());

// Environment-Aware CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server) in development
      if (!origin && process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Policy Rejection: Origin ${origin} is not allowed.`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Health Check
app.get("/api/health", (req, res) => {
  return successResponse(res, 200, "SparklePro API is running", {
    status: "healthy",
  });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Owner Business & Setup Routes
app.use("/api/owner", businessRoutes);

// Owner Jobs & Booking Routes
app.use("/api/owner/jobs", jobRoutes);

// Owner Customer Management Routes
app.use("/api/owner/customers", customerRoutes);

// Owner Staff Management Routes
app.use("/api/owner/staff", staffRoutes);

// Owner Analytics Routes
app.use("/api/owner/analytics", analyticsRoutes);

// Owner Settings Routes
app.use("/api/owner", settingsRoutes);

// Public Vehicle Tracking Routes
app.use("/api/public", publicTrackRoutes);

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

export default app;