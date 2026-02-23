import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym" },
    name: String,
    durationDays: Number,
    price: Number
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
