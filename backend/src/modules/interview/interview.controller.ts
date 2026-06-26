import { Request, Response, NextFunction } from "express";
import { InterviewService } from "./interview.service";
import { CreateInterviewSchema, SaveAnswerSchema } from "./interview.schema";
import { sendSuccess, sendError } from "../../utils/response";
import { InterviewGenerator } from "../../services/interview-generator";

export class InterviewController {
  private interviewService: InterviewService;
  private interviewGenerator: InterviewGenerator;

  constructor() {
    this.interviewService = new InterviewService();
    this.interviewGenerator = new InterviewGenerator();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const parsed = CreateInterviewSchema.safeParse(req.body);
      if (!parsed.success) {
        const messages = parsed.error.issues.map((i) => i.message).join(", ");
        sendError(res, messages, 422);
        return;
      }

      const result = await this.interviewService.createInterview(
        req.user.userId,
        parsed.data
      );

      res.status(201).json({
        success: true,
        message: "Interview created successfully.",
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const interviews = await this.interviewService.getInterviews(req.user.userId);
      sendSuccess(res, interviews, 200);
    } catch (error: unknown) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const { id } = req.params as { id: string };
      if (!id) {
        sendError(res, "Interview ID is required", 400);
        return;
      }

      const interview = await this.interviewService.getInterviewById(
        id,
        req.user.userId
      );
      sendSuccess(res, interview, 200);
    } catch (error: unknown) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const { id } = req.params as { id: string };
      if (!id) {
        sendError(res, "Interview ID is required", 400);
        return;
      }

      await this.interviewService.deleteInterview(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: "Interview deleted successfully.",
        data: null,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const { id } = req.params as { id: string };
      if (!id) {
        sendError(res, "Interview ID is required", 400);
        return;
      }

      const result = await this.interviewGenerator.generate(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: "Interview plan generated successfully.",
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  saveAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const { id: interviewId } = req.params as { id: string };
      const parsed = SaveAnswerSchema.safeParse(req.body);
      if (!parsed.success) {
        const messages = parsed.error.issues.map((i) => i.message).join(", ");
        sendError(res, messages, 422);
        return;
      }

      const result = await this.interviewService.saveAnswer(
        interviewId,
        req.user.userId,
        parsed.data.questionText,
        parsed.data.answerText
      );

      res.status(200).json({
        success: true,
        message: "Answer saved successfully.",
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  submitInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const { id: interviewId } = req.params as { id: string };
      const result = await this.interviewService.submitAndGradeInterview(
        interviewId,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: "Interview submitted and report generated successfully.",
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}
