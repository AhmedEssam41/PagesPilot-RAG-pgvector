import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const createAdmin = async (email: string, password: string) => {
  const hashed = await bcrypt.hash(password, 10);

  //check if admin already exists
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin) throw new Error("Admin already exists");
  return prisma.admin.create({
    data: { email, password: hashed },
  });
};

const login = async (email: string, password: string) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new Error("Admin not found");
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return { ...admin, token };
};

export { createAdmin, login };
