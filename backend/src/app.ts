import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRouter from "./modules/auth";
import interviewRouter from "./modules/interview";
import { sendError } from "./utils/response";

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

// Health Check Root Route
app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "InterviewAI API is running" });
});

// Centralized error handler
app.use((err: Error & { statusCode?: number }, req: Request, res: Response, next: NextFunction) => {
  console.error("💥 Error handled centrally:", err.stack || err.message);
  const statusCode = err.statusCode || 500;
  sendError(res, err.message || "An unexpected error occurred", statusCode);
});

export default app;
