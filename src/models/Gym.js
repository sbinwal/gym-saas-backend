import mongoose from "mongoose";

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerName: String,
    mobile: String,

    // 🔐 AUTH
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },

    // 💳 SUBSCRIPTION
    subscriptionPlan: {
      type: String,
      enum: ["basic", "pro", "enterprise"],
      default: "basic"
    },
    subscriptionExpiry: Date,

    // ⚙️ STATUS
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Gym", gymSchema);
