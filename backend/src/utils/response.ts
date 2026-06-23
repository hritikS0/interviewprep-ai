import { Response } from "express";

export const sendSuccess = (res: Response, data: unknown, status = 200): Response => {
  return res.status(status).json({
    success: true,
    data,
  });
};

export const sendError = (res: Response, message: string, status = 500): Response => {
  return res.status(status).json({
    success: false,
    message,
  });
};
