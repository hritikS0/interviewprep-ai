import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRouter from "./modules/auth";
import { sendError } from "./utils/response";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Routes
app.use("/auth", authRouter);

// Health Check Root Route
app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "InterviewAI API is running" });
});

// Centralized error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("💥 Error handled centrally:", err.stack || err.message);
  sendError(res, err.message || "An unexpected error occurred", 500);
});

export default app;
