import Payment from "../models/Payment.js";
import Membership from "../models/Membership.js";

/**
 * 💰 ADD PAYMENT
 */
export const addPayment = async (req, res) => {
  try {
    const { membershipId, amount, paymentMode } = req.body;
    const gymId = req.gymId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    if (membership.gymId.toString() !== gymId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const remaining =
      membership.totalFee - membership.totalPaid;

    if (remaining <= 0) {
      return res.status(400).json({
        message: "Already fully paid",
      });
    }

    if (amount > remaining) {
      return res.status(400).json({
        message: `Only ₹${remaining} pending`,
      });
    }

    // ✅ Create Payment
    const payment = await Payment.create({
      gymId,
      memberId: membership.memberId,
      membershipId,
      amount,
      paymentMode,
    });

    // ✅ Update Membership
    membership.totalPaid += amount;

    if (membership.totalPaid === membership.totalFee) {
      membership.paymentStatus = "paid";
    } else {
      membership.paymentStatus = "partial";
    }

    await membership.save();

    res.status(201).json({
      message: "Payment added",
      payment,
      remainingAmount:
        membership.totalFee - membership.totalPaid,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const gymId = req.gymId;

    const payments = await Payment.find({ gymId })
  .populate("memberId", "name mobile")
  .populate({
    path: "membershipId",
    populate: {
      path: "planId",
      select: "name"
    }
  })
  .sort({ createdAt: -1 });

    res.json(payments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getPaymentsByMember = async (req, res) => {
  try {
    const gymId = req.gymId;
    const { memberId } = req.params;

    const payments = await Payment.find({
      gymId,
      memberId,
    })
      .populate("membershipId")
      .sort({ createdAt: -1 });

    res.json(payments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentsByMembership = async (req, res) => {
  try {
    const gymId = req.gymId;
    const { membershipId } = req.params;

    const payments = await Payment.find({
      gymId,
      membershipId,
    }).sort({ createdAt: -1 });

    res.json(payments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.gymId;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (payment.gymId.toString() !== gymId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 🔥 rollback membership
    const membership = await Membership.findById(
      payment.membershipId
    );

    if (membership) {
      membership.totalPaid -= payment.amount;

      if (membership.totalPaid <= 0) {
        membership.paymentStatus = "unpaid";
      } else {
        membership.paymentStatus = "partial";
      }

      await membership.save();
    }

    await payment.deleteOne();

    res.json({ message: "Payment deleted & adjusted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};