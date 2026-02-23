import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";

/**
 * ADD MEMBER
 * Payment may or may not be received
 */
export const addMember = async (req, res) => {
  const { name, mobile } = req.body;
  const gymId = req.gymId;

  const member = await Member.create({
    gymId,
    name,
    mobile,
    status: "active"
  });

  res.status(201).json(member);
};

export const createMembership = async (req, res) => {
  try {
    const { memberId, planId, startDate } = req.body;
    const gymId = req.gymId;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + plan.durationDays);

    const membership = await Membership.create({
      memberId,
      gymId,
      planId,
      startDate: start,
      endDate: expiry,

      totalFee: plan.price,
      totalPaid: 0,              // 🔥 VERY IMPORTANT
      paymentStatus: "unpaid",   // 🔥 VERY IMPORTANT
      status: "active"
    });

    res.status(201).json(membership);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const renewMembership = async (req, res) => {
  try {
    const { memberId, planId } = req.body;
    const gymId = req.gymId;

    const plan = await Plan.findById(planId);
    if (!plan)
      return res.status(404).json({ message: "Plan not found" });

    // 🔍 Get last membership
    const lastMembership = await Membership
      .findOne({ memberId, gymId })
      .sort({ endDate: -1 });

    let startDate = new Date();
    let pendingAmount = 0;

    if (lastMembership) {

      // 🟡 carry forward due
      pendingAmount =
        lastMembership.totalFee - lastMembership.totalPaid;

      // 🟢 if still active, start after expiry
      if (lastMembership.endDate > new Date()) {
        startDate = lastMembership.endDate;
      }
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const newMembership = await Membership.create({
      memberId,
      gymId,
      planId,
      startDate,
      endDate,
      totalFee: pendingAmount + plan.price,
      totalPaid: 0,
      paymentStatus: pendingAmount > 0 ? "partial" : "unpaid",
      status: "active"
    });

    res.status(201).json({
      message: "Membership renewed with pending dues",
      newMembership
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/member.controller.js

export const getAllMembers = async (req, res) => {
  try {
    const gymId = req.gymId;

    const memberships = await Membership.find({ gymId })
      .populate("memberId planId")
      .sort({ createdAt: -1 });

    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUnpaidMembers = async (req, res) => {
  try {
    const gymId = req.gymId;

    const members = await Membership.find({
      gymId,
      paymentStatus: "unpaid"
    }).populate("memberId planId");

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPartiallyPaidMembers = async (req, res) => {
  try {
    const gymId = req.gymId;

    const members = await Membership.find({
      gymId,
      paymentStatus: "partial"
    }).populate("memberId planId");

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPaidMembers = async (req, res) => {
  try {
    const gymId = req.gymId;

    const members = await Membership.find({
      gymId,
      paymentStatus: "paid"
    }).populate("memberId planId");

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { membershipId, amount, paymentMode } = req.body;
    const gymId = req.gymId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    if (membership.gymId.toString() !== gymId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🧠 Remaining amount after renewal carry-forward
    const remainingAmount =
      membership.totalFee - membership.totalPaid;

    if (remainingAmount <= 0) {
      return res.status(400).json({
        message: "Membership already fully paid"
      });
    }

    if (amount > remainingAmount) {
      return res.status(400).json({
        message: `Only ₹${remainingAmount} is pending`
      });
    }

    // 💰 Create payment record
    await Payment.create({
      gymId,
      memberId: membership.memberId,
      membershipId,
      amount,
      paymentMode
    });

    // ➕ Update paid amount
    membership.totalPaid += amount;

    // 📊 Update status
    if (membership.totalPaid === membership.totalFee) {
      membership.paymentStatus = "paid";
    }
    else {
      membership.paymentStatus = "partial";
    }

    await membership.save();

    res.json({
      message: "Payment added successfully",
      remainingAmount:
        membership.totalFee - membership.totalPaid,
      membership
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getActiveMembers = async (req, res) => {
  try {
    const gymId = req.gymId;
    const today = new Date();

    const members = await Membership.find({
      gymId,
      endDate: { $gte: today },
      status: "active"
    }).populate("memberId planId");

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpiredMembers = async (req, res) => {
  try {
    const gymId = req.gymId;
    const today = new Date();

    const members = await Membership.find({
      gymId,
      endDate: { $lt: today }
    }).populate("memberId planId");

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpiringMembers = async (req, res) => {
  try {
    const gymId = req.gymId;
    const { days = 5 } = req.query;

    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + Number(days));

    const members = await Membership.find({
      gymId,
      endDate: { $gte: today, $lte: future }
    }).populate("memberId planId");

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMemberMembershipHistory = async (req, res) => {
  try {
    const { memberId } = req.params;
    const gymId = req.gymId;

    const memberships = await Membership.find({
      memberId,
      gymId
    })
      .populate("planId", "name durationDays price")
      .sort({ startDate: -1 });

    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOutstandingDues = async (req, res) => {
  try {
    const gymId = req.gymId;

    const memberships = await Membership.find({
      gymId,
      status: "active"
    })
    .populate("memberId", "name mobile")
    .populate("planId", "name price");

    const result = memberships.map(m => {
      const remaining = m.totalFee - m.totalPaid;

      return {
        memberId: m.memberId._id,
        name: m.memberId.name,
        mobile: m.memberId.mobile,
        plan: m.planId.name,
        totalFee: m.totalFee,
        totalPaid: m.totalPaid,
        remainingAmount: remaining,
        paymentStatus: m.paymentStatus,
        endDate: m.endDate
      };
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMemberLedger = async (req, res) => {
  try {
    const gymId = req.gymId;
    const { memberId } = req.params;

    const memberships = await Membership.find({
      gymId,
      memberId
    }).populate("planId", "name");

    const payments = await Payment.find({
      gymId,
      memberId
    }).sort({ createdAt: -1 });

    res.json({
      memberships,
      payments
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





