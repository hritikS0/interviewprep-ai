import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRouter from "./modules/auth";
import interviewRouter from "./modules/interview";
import { sendError } from "./utils/response";
import { authLandingTemplate } from "./templates/authLanding";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Routes
app.use("/auth", authRouter);

// Interview Routes
app.use("/api/interviews", interviewRouter);


// Health Check & Auth Redirect Root Route
app.get("/health", (req: Request, res: Response) => {
  // If the client explicitly requests JSON (e.g. backend health check or API fetch), return JSON
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json({ success: true, message: "InterviewAI API is running" });
  }

  // Otherwise, render a beautiful HTML page that can handle client-side hashes
  res.send(authLandingTemplate());
});

// Centralized error handler
app.use((err: Error & { statusCode?: number }, req: Request, res: Response, next: NextFunction) => {
  console.error("💥 Error handled centrally:", err.stack || err.message);
  const statusCode = err.statusCode || 500;
  sendError(res, err.message || "An unexpected error occurred", statusCode);
});

export default app;
