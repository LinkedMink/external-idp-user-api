import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

export default defineConfig({
  datasource: {
    db: {
      url: connectionString,
      adapter: new PrismaPg({ connectionString }),
    },
  },
});
