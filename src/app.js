import express from "express";
import cors from "cors";
import memberRoutes from "./routes/member.routes.js";
import gymRoutes from "./routes/gym.routes.js"
import planRoutes from "./routes/plan.routes.js"
import authRoutes from "./routes/auth.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import analyticsRoutes from "./routes/analytics.routes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_, res) => {
  res.json({ status: "OK" });
});
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);





export default app;
