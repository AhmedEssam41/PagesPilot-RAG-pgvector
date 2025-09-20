import { Request, Response } from "express";
import { createAdmin, login } from "../services/admin.service";

const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await createAdmin(email, password);
    res.status(201).json(admin);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await login(email, password);
    res.status(200).json(admin);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
export { registerAdmin, loginAdmin };
