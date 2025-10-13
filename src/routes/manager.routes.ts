import { Router } from "express";
import {
  getManagerDashboardController,
  getMyManagedUsers,
  getManagedUserById,
  getManagedUserAnalytics,
  deactivateManagedUser,
  reactivateManagedUser,
  getMyManagers,
  assignUserToManagerController,
  getAllUserAssignmentsController,
  removeUserAssignmentController,
} from "../controllers/manager.controller";
import {
  authenticateToken,
  requireManagerOrAdmin,
  requireAdmin,
  requireManagerAccess,
} from "../middlewares/auth.middleware";
import {
  validateUserAssignment,
  validateUserId,
  validateAssignmentId,
  validateAnalyticsQuery,
  validateDeviceInfo,
  validateManagerAssignment,
} from "../middlewares/roleValidation.middleware";
import { managerLimiter } from "../middlewares/rateLimit.middleware";
import { validateUserRegistration } from "../middlewares/validation.middleware";
import { registerUser } from "../controllers/user.controller";

const managerRoutes = Router();

// All manager routes require authentication
managerRoutes.use(authenticateToken);

// user creation (admin/super_admin/manager only)
managerRoutes.post(
  "/create-user",
  managerLimiter,
  validateUserRegistration,
  registerUser
);

// Manager dashboard and overview
managerRoutes.get("/dashboard", managerLimiter, getManagerDashboardController);
managerRoutes.get(
  "/my-users",
  managerLimiter,
  validateAnalyticsQuery,
  getMyManagedUsers
);
managerRoutes.get("/my-managers", managerLimiter, getMyManagers);

// Specific user management (with access control)
managerRoutes.get(
  "/my-users/:id",
  managerLimiter,
  validateUserId,
  requireManagerAccess,
  getManagedUserById
);
managerRoutes.get(
  "/my-users/:id/analytics",
  managerLimiter,
  validateUserId,
  validateAnalyticsQuery,
  requireManagerAccess,
  getManagedUserAnalytics
);
managerRoutes.patch(
  "/my-users/:id/deactivate",
  managerLimiter,
  validateUserId,
  requireManagerAccess,
  deactivateManagedUser
);
managerRoutes.patch(
  "/my-users/:id/reactivate",
  managerLimiter,
  validateUserId,
  requireManagerAccess,
  reactivateManagedUser
);

// Admin-only: User assignment management
managerRoutes.post(
  "/assign-user",
  managerLimiter,
  validateUserAssignment,
  validateManagerAssignment,
  assignUserToManagerController
);
managerRoutes.get(
  "/assignments",
  managerLimiter,
  requireAdmin,
  getAllUserAssignmentsController
);
managerRoutes.delete(
  "/assignments/:id",
  managerLimiter,
  validateAssignmentId,
  requireAdmin,
  removeUserAssignmentController
);

export default managerRoutes;
