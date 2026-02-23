import Gym from "../models/Gym.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerGym = async (req, res) => {
  try {
    const { name, email, password, ownerName, mobile } = req.body;

    const existing = await Gym.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Gym already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const gym = await Gym.create({
      name,
      email,
      password: hashedPassword,
      ownerName,
      mobile
    });

    res.status(201).json({ message: "Gym registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginGym = async (req, res) => {
  try {
    const { email, password } = req.body;

    const gym = await Gym.findOne({ email });
    if (!gym) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, gym.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { gymId: gym._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      gym: {
        id: gym._id,
        name: gym.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

