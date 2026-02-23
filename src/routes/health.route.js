import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "Gym SaaS API",
    time: new Date()
  });
});

export default router;
