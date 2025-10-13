import { Router } from "express";
import {
  getCurrentUser,
  loginUserController,
  registerUser,
} from "../controllers/user.controller";
import {
  authenticateToken,
  logout,
  refreshToken,
} from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";
import {
  validateUserLogin,
  validateUserRegistration,
} from "../middlewares/validation.middleware";

const authRoutes = Router();

authRoutes.post(
  "/register",
  authLimiter,
  validateUserRegistration,
  registerUser
);
authRoutes.post("/login", authLimiter, validateUserLogin, loginUserController);

// Token management routes
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/logout", logout);

authRoutes.get("/me", authenticateToken, getCurrentUser);

export default authRoutes;
