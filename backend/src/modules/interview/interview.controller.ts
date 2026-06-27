import { Request, Response, NextFunction } from "express";
import { InterviewService } from "./interview.service";
import { CreateInterviewSchema, SaveAnswerSchema } from "./interview.schema";
import { sendSuccess, sendError } from "../../utils/response";
import { InterviewGenerator } from "../../services/interview-generator";
import { env } from "../../config/env";

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

  transcribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const audioBuffer = req.body;
      if (!audioBuffer || audioBuffer.length === 0) {
        sendError(res, "No audio data received", 400);
        return;
      }

      let apiKey = env.GROQ_KEY;
      let url = "https://api.groq.com/openai/v1/audio/transcriptions";
      let model = "whisper-large-v3";
      let providerName = "Groq ASR";

      if (!apiKey) {
        // Fallback to NVIDIA NIM
        apiKey = env.SPEECHRECOGNITION_KEY;
        if (!apiKey) {
          sendError(res, "No speech recognition API key configured on the server", 500);
          return;
        }
        const asrBaseUrl = env.SPEECHRECOGNITION_URL || "https://ai.api.nvidia.com/v1";
        url = `${asrBaseUrl.replace(/\/$/, "")}/audio/transcriptions`;
        model = "openai/whisper-large-v3";
        providerName = "NVIDIA ASR";
      }

      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: "audio/webm" });
      formData.append("file", blob, "audio.webm");
      formData.append("model", model);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "Unknown error");
        throw new Error(`${providerName} API failed with status ${response.status}: ${errText}`);
      }

      const data: any = await response.json();
      const text = data?.text || "";

      res.status(200).json({
        success: true,
        text,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}
