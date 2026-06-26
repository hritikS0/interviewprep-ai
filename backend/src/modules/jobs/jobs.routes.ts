import { Router } from "express";
import { JobsController } from "./jobs.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();
const controller = new JobsController();

router.get("/", authMiddleware, controller.getJobs);

export default router;
