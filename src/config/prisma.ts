import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
});

// wrapper بيتصل تلقائياً قبل أي query ويفصل بعدها
const handler: ProxyHandler<typeof prisma> = {
  get(target: any, prop: string) {
    const original = target[prop];

    if (typeof original === "function" && prop.startsWith("$query")) {
      return async (...args: any[]) => {
        await target.$connect();
        try {
          return await original.apply(target, args);
        } finally {
          await target.$disconnect();
        }
      };
    }

    return original;
  },
};

export default new Proxy(prisma, handler) as typeof prisma;
export { Prisma };