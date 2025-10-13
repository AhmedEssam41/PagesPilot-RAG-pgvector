import { Router } from "express";
import { getCurrentUser } from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const userRoutes = Router();

// Public routes with rate limiting and validation

// Protected routes
// userRoutes.get("/me", authenticateToken, getCurrentUser);

export default userRoutes;
