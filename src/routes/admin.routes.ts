import { Router } from "express";
import { loginAdmin, registerAdmin } from "../controllers/admin.controller";

const adminRoutes = Router();

adminRoutes.post("/register", registerAdmin);
adminRoutes.post("/login", loginAdmin);

export default adminRoutes;
