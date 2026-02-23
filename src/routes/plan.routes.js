import express from "express";
import { createPlan, getPlansByGym } from "../controllers/plan.controller.js";
import {protect} from "../middleware/auth.middleware.js";

const router = express.Router();



router.post("/create",protect, createPlan);
router.get("/getAllPlans",protect, getPlansByGym);

export default router;
