import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { expireMembershipsJob } from "./cron/expireMemberships.js";


const PORT = process.env.PORT || 5000;

expireMembershipsJob(); // 🔥 Start cron job

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
