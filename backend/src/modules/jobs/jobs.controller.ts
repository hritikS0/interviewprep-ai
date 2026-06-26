import { Request, Response, NextFunction } from "express";
import { JobsService } from "./jobs.service";
import { sendSuccess } from "../../utils/response";

export class JobsController {
  private jobsService: JobsService;

  constructor() {
    this.jobsService = new JobsService();
  }

  getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.query as string || req.query.q as string;
      const jobs = await this.jobsService.getRecommendedJobs(query);
      sendSuccess(res, jobs, 200);
    } catch (error: unknown) {
      next(error);
    }
  };
}
