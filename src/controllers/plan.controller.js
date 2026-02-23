import Plan from "../models/Plan.js";
import mongoose from "mongoose";

export const createPlan = async (req, res) => {
  try {
    const { name, durationDays, price } = req.body;
    const gymId = req.gymId; // 🔒 FROM TOKEN

    const plan = await Plan.create({
      gymId,
      name,
      durationDays,
      price
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getPlansByGym = async (req, res) => {
  try {
    const gymId = req.gymId; // 🔒 FROM TOKEN

    const plans = await Plan.find({ gymId });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

