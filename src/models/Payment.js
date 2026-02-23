// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true
    },

    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card"],
      default: "cash"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
