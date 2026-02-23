import cron from "node-cron";
import Membership from "../models/Membership.js";

export const expireMembershipsJob = () => {

  // Runs daily at 12:00 AM
  cron.schedule("0 0 * * *", async () => {

    console.log("Running Membership Expiry Job...");

    const today = new Date();

    try {

      const result = await Membership.updateMany(
        {
          endDate: { $lt: today },
          status: "active"
        },
        {
          $set: { status: "expired" }
        }
      );

      console.log(`${result.modifiedCount} memberships expired`);

    } catch (error) {
      console.error("Cron Job Error:", error.message);
    }

  });

};
