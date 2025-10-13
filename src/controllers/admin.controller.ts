import { Request, Response } from "express";
import { createAdmin } from "../services/admin.service";
import { createUser, updateUserRole } from "../services/user.service";
import {
  // setAdminAuthCookies,
  // clearAdminAuthCookies,
  setAuthCookies,
  clearAuthCookies,
} from "../middlewares/auth.middleware";

const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const admin = await createAdmin(name, email, password);
    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// const loginAdmin = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const result = await login(email, password);

//     // Set HTTP-only cookies
//     setAuthCookies(res, result.accessToken, result.refreshToken);

//     res.status(200).json({
//       message: "Admin login successful",
//       admin: {
//         id: result.id,
//         name: result.name,
//         email: result.email,
//         role: result.role,
//       },
//     });
//   } catch (err: any) {
//     res.status(400).json({ error: err.message });
//   }
// };

// const logoutAdmin = async (req: Request, res: Response) => {
//   try {
//     clearAuthCookies(res);
//     res.status(200).json({ message: "Admin logged out successfully" });
//   } catch (err: any) {
//     res.status(400).json({ error: err.message });
//   }
// };

// Create a new manager (admin/super_admin only)
const createManager = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const manager = await createUser(name, email, password, "manager");
    res.status(201).json({
      message: "Manager created successfully",
      manager: {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
        createdAt: manager.createdAt,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export { registerAdmin, createManager };
