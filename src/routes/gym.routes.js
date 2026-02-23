import express from "express";
import { createGym } from "../controllers/gym.controller.js";

const router = express.Router();

router.post("/create", createGym);

export default router;
