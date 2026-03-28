import express from "express";
import {
  addPayment,
  getAllPayments,
  getPaymentsByMember,
  getPaymentsByMembership,
  deletePayment,
} from "../controllers/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 💰 Add payment
router.post("/add", protect, addPayment);

// 📊 Get payments
router.get("/", protect, getAllPayments);
router.get("/member/:memberId", protect, getPaymentsByMember);
router.get("/membership/:membershipId", protect, getPaymentsByMembership);

// 🗑️ Delete payment (optional)
router.delete("/:id", protect, deletePayment);

export default router;