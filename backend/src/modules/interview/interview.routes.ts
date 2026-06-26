import { Router } from "express";
import { InterviewController } from "./interview.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();
const controller = new InterviewController();

router.post("/", authMiddleware, controller.create);
router.post("/:id/generate", authMiddleware, controller.generate);
router.post("/:id/answers", authMiddleware, controller.saveAnswer);
router.post("/:id/submit", authMiddleware, controller.submitInterview);
router.get("/", authMiddleware, controller.getAll);
router.get("/:id", authMiddleware, controller.getById);
router.delete("/:id", authMiddleware, controller.delete);

export default router;
