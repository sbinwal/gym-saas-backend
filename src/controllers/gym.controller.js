import Gym from "../models/Gym.js";

export const createGym = async (req, res) => {
  try {
    const { name, ownerName, mobile } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Gym name is required" });
    }

    const gym = await Gym.create({
      name,
      ownerName,
      mobile,
      subscriptionPlan: "basic",
      subscriptionExpiry: null,
      isActive: true
    });

    res.status(201).json(gym);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
