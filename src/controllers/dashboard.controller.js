import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import Payment from "../models/Payment.js";

export const getDashboardStats = async (req, res) => {
  try {
    const gymId = req.gymId;

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    // 1️⃣ Total Members
    const totalMembers = await Member.countDocuments({ gymId });

    // 2️⃣ Active Memberships
    const activeMembers = await Membership.countDocuments({
      gymId,
      status: "active"
    });

    // 3️⃣ Expired Memberships
    const expiredMembers = await Membership.countDocuments({
      gymId,
      status: "expired"
    });

    // 4️⃣ Fully Paid
    const fullyPaidMembers = await Membership.countDocuments({
      gymId,
      paymentStatus: "paid"
    });

    // 5️⃣ Partially Paid
    const partialMembers = await Membership.countDocuments({
      gymId,
      paymentStatus: "partial"
    });

    // 6️⃣ Total Revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { gymId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // 7️⃣ Today Collection
    const todayCollection = await Payment.aggregate([
      {
        $match: {
          gymId,
          createdAt: {
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // 8️⃣ Outstanding Amount
    const outstanding = await Membership.aggregate([
      {
        $match: { gymId }
      },
      {
        $group: {
          _id: null,
          totalFee: { $sum: "$totalFee" },
          totalPaid: { $sum: "$totalPaid" }
        }
      },
      {
        $project: {
          outstanding: { $subtract: ["$totalFee", "$totalPaid"] }
        }
      }
    ]);

    res.json({
      totalMembers,
      activeMembers,
      expiredMembers,
      fullyPaidMembers,
      partialMembers,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayCollection: todayCollection[0]?.total || 0,
      outstandingAmount: outstanding[0]?.outstanding || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

