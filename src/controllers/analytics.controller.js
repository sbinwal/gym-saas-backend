import Payment from "../models/Payment.js";

export const getMonthlyRevenue = async (req, res) => {
  try {
    const gymId = req.gymId;

    const revenue = await Payment.aggregate([
      {
        $match: { gymId }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$amount" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // Convert month number → name
    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formattedRevenue = revenue.map(r => ({
      year: r._id.year,
      month: monthNames[r._id.month],
      revenue: r.totalRevenue
    }));

    res.json(formattedRevenue);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyMemberGrowth = async (req, res) => {
  try {
    const gymId = req.gymId;

    const growth = await Member.aggregate([
      {
        $match: { gymId }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalMembers: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formattedGrowth = growth.map(g => ({
      year: g._id.year,
      month: monthNames[g._id.month],
      membersJoined: g.totalMembers
    }));

    res.json(formattedGrowth);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

