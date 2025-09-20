import prisma from "../config/prisma";

const createLead = async (
  name: string,
  email: string,
  url: string,
  message: string
) => {
  return prisma.lead.create({
    data: { name, email, url, message },
  });
};

const getAllLeads = async () => {
  return prisma.lead.findMany();
};

export { createLead, getAllLeads };
