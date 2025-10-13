import { Request, Response } from "express";
import { createLead, getAllLeads } from "../services/lead.service";
import prisma from "../config/prisma";

const addLead = async (req: Request, res: Response) => {
  try {
    const { name, email, url, message } = req.body;
    const lead = await createLead({ name, email, url, message });
    res.status(201).json(lead);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await getAllLeads();
    res.status(200).json(leads);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export { addLead, getLeads };
