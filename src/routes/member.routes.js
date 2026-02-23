import express from "express";
import {
  addMember,
  getExpiringMembers,
  getUnpaidMembers,
  addPayment,
  createMembership,
  getAllMembers,
  getPartiallyPaidMembers,
  getPaidMembers,
  getActiveMembers,
  getExpiredMembers,
  renewMembership,
  getMemberMembershipHistory,
  getOutstandingDues,
  getMemberLedger
} from "../controllers/member.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create",protect, addMember);
router.post("/membership/create",protect, createMembership);
router.post("/membership/renewMembership",protect, renewMembership);
router.get("/getAllMembers",protect, getAllMembers);
router.get("/getUnpaidMembers",protect, getUnpaidMembers);
router.get("/getPartialPaidMembers",protect, getPartiallyPaidMembers);
router.get("/getPaidMembers",protect, getPaidMembers);
router.get("/getActiveMembers",protect, getActiveMembers);
router.get("/getExpiredMembers",protect, getExpiredMembers);
router.get("/getExpiringMembers?days=5",protect, getExpiringMembers);
router.post("/addPayment",protect, addPayment);
router.get("/membershipHistory/:memberId", protect, getMemberMembershipHistory);
router.get("/ledger/:memberId", protect, getMemberLedger);
router.get("/dues", protect, getOutstandingDues);






export default router;
