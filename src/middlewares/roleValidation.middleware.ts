import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";

// Validation for user assignment
export const validateUserAssignment = [
  body("managerId")
    .isInt({ min: 1 })
    .withMessage("Manager ID must be a positive integer"),
  body("userId")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];

// Validation for role updates
export const validateRoleUpdate = [
  body("role")
    .isIn(["super_admin", "admin", "manager", "user"])
    .withMessage("Role must be one of: super_admin, admin, manager, user"),
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be a valid email address"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];

// Validation for user ID parameter
export const validateUserId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];

// Validation for assignment ID parameter
export const validateAssignmentId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Assignment ID must be a positive integer"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];

// Validation for analytics query parameters
export const validateAnalyticsQuery = [
  query("days")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Days must be between 1 and 365"),
  query("includeInactive")
    .optional()
    .isBoolean()
    .withMessage("includeInactive must be a boolean"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];

// Validation for device info
export const validateDeviceInfo = [
  body("deviceInfo").isObject().withMessage("Device info must be an object"),
  body("deviceInfo.userAgent")
    .optional()
    .isString()
    .withMessage("User agent must be a string"),
  body("deviceInfo.platform")
    .optional()
    .isString()
    .withMessage("Platform must be a string"),
  body("deviceInfo.browser")
    .optional()
    .isString()
    .withMessage("Browser must be a string"),
  body("deviceInfo.device")
    .optional()
    .isString()
    .withMessage("Device must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];

// Role hierarchy validation
export const validateRoleHierarchy = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  const { role } = req.body;

  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Super admins can assign any role
  if (user.role === "super_admin") {
    return next();
  }

  // Admins can assign manager and user roles
  if (user.role === "admin") {
    if (["manager", "user"].includes(role)) {
      return next();
    }
    return res.status(403).json({
      error: "You can only assign manager or user roles",
    });
  }

  // Managers and users cannot assign roles
  return res.status(403).json({
    error: "You do not have permission to assign roles",
  });
};

// Manager assignment validation
export const validateManagerAssignment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  const { managerId } = req.body;

  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Only super admins and admins can assign users to managers
  if (!["super_admin", "admin"].includes(user.role)) {
    return res.status(403).json({
      error: "Only admins can assign users to managers",
    });
  }

  next();
};
