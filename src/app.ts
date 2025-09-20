import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes";
import leadRoutes from "./routes/lead.routes";
// import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
// app.use("/api/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/leads", leadRoutes);
export default app;
