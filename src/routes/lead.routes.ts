import { Router } from "express";
import { addLead, getLeads } from "../controllers/lead.controller";

const leadRoutes = Router();

leadRoutes.post("/", addLead);
leadRoutes.get("/", getLeads);

export default leadRoutes;
