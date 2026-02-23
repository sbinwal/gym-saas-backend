import express from "express";
import { getMonthlyRevenue } from "../controllers/analytics.controller.js";
import { getMonthlyMemberGrowth } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";


const router = express.Router();

router.get("/monthly-revenue", protect, getMonthlyRevenue);
router.get("/member-growth", protect, getMonthlyMemberGrowth);

export default router;
