import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  getDashboardActivityController,
  getDashboardStatsController,
} from "../controllers/dashboard.controller";

const dashboardRoutes = Router();

dashboardRoutes.get(
  "/activity",
  authenticateToken,
  getDashboardActivityController
);

dashboardRoutes.get("/stats", authenticateToken, getDashboardStatsController);

export default dashboardRoutes;


