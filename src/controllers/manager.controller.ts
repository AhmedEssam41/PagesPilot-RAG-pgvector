import { Request, Response } from "express";
import {
  getManagedUsers,
  getManagerDashboard,
  getManagerHierarchy,
  assignUserToManager,
  removeUserAssignment,
  getAllUserAssignments,
  canManageUser,
  deactivateUser,
  reactivateUser,
  getUserAnalytics,
} from "../services/user.service";

// Get manager's dashboard with overview of managed users
export const getManagerDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const managerId = (req as any).user.id;
    const dashboard = await getManagerDashboard(managerId);
    res.status(200).json({ data: dashboard });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Get all users managed by the current manager
export const getMyManagedUsers = async (req: Request, res: Response) => {
  try {
    const managerId = (req as any).user.id;
    const managedUsers = await getManagedUsers(managerId);
    res.status(200).json({ data: managedUsers });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Get specific managed user details
export const getManagedUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const managerId = (req as any).user.id;

    // Check if manager can access this user
    const canManage = await canManageUser(managerId, parseInt(id));
    if (!canManage) {
      return res.status(403).json({
        error: "You can only access users assigned to you",
      });
    }

    const managedUsers = await getManagedUsers(managerId);
    const user = managedUsers.find((u) => u.user.id === parseInt(id));

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found in your managed users" });
    }

    res.status(200).json({ data: user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Get analytics for a specific managed user
export const getManagedUserAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    const managerId = (req as any).user.id;

    // Check if manager can access this user
    const canManage = await canManageUser(managerId, parseInt(id));
    if (!canManage) {
      return res.status(403).json({
        error: "You can only access analytics for users assigned to you",
      });
    }

    const analytics = await getUserAnalytics(
      parseInt(id),
      parseInt(days as string)
    );
    res.status(200).json({ data: analytics });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Deactivate a managed user
export const deactivateManagedUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const managerId = (req as any).user.id;

    // Check if manager can manage this user
    const canManage = await canManageUser(managerId, parseInt(id));
    if (!canManage) {
      return res.status(403).json({
        error: "You can only manage users assigned to you",
      });
    }

    const user = await deactivateUser(parseInt(id));
    res.status(200).json({
      message: "User deactivated successfully",
      user,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Reactivate a managed user
export const reactivateManagedUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const managerId = (req as any).user.id;

    // Check if manager can manage this user
    const canManage = await canManageUser(managerId, parseInt(id));
    if (!canManage) {
      return res.status(403).json({
        error: "You can only manage users assigned to you",
      });
    }

    const user = await reactivateUser(parseInt(id));
    res.status(200).json({
      message: "User reactivated successfully",
      user,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Get user's management hierarchy (who manages them)
export const getMyManagers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const hierarchy = await getManagerHierarchy(userId);
    res.status(200).json({ data: hierarchy });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Admin-only: Assign user to manager
export const assignUserToManagerController = async (
  req: Request,
  res: Response
) => {
  try {
    const { managerId, userId } = req.body;
    const assignedBy = (req as any).user.id;

    if (!managerId || !userId) {
      return res.status(400).json({
        error: "managerId and userId are required",
      });
    }

    const assignment = await assignUserToManager(managerId, userId, assignedBy);
    res.status(201).json({
      message: "User assigned to manager successfully",
      data: assignment,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Admin-only: Get all user assignments
export const getAllUserAssignmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const assignments = await getAllUserAssignments();
    res.status(200).json({ data: assignments });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Admin-only: Remove user assignment
export const removeUserAssignmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const removedBy = (req as any).user.id;

    const assignment = await removeUserAssignment(parseInt(id), removedBy);
    res.status(200).json({
      message: "User assignment removed successfully",
      data: assignment,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
