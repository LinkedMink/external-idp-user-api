import { Command } from "commander";
import { randomBytes } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { execIfFileNotExist, spawnAsync, writeEjsTemplate } from "./utility";

interface DevSetupCommandOptions {
  passPostgres: string;
  passApp: string;
}

export const devSetupCommand = new Command("dev")
  .description("Initialize configuration")
  .option(
    "-p, --pass-postgres <string>",
    "Password for the 'postgres' user (random generated if not supplied)",
    randomBytes(16).toString("hex")
  )
  .option(
    "-a, --pass-app <string>",
    "Password for the 'external_idp' application user (random generated if not supplied)",
    randomBytes(16).toString("hex")
  )
  .action(async (options: DevSetupCommandOptions) => {
    await Promise.all([
      writeEjsTemplate(".env.ejs", { postgresAppPassword: options.passApp }),
      writeEjsTemplate("config/api-docker.env.ejs", { postgresAppPassword: options.passApp }),
      writeEjsTemplate("config/postgres.env.ejs", { postgresAppPassword: options.passApp }),
    ]);

    console.log("Config files written, start background Docker containers");

    await spawnAsync("docker", ["compose", "up", "-d", "--", "postgres", "redis"]);

    console.log("Write signing private and public key");

    await execIfFileNotExist("config/jws.secp521r1.key", path =>
      spawnAsync("openssl", ["ecparam", "-genkey", "-name", "secp521r1", "-out", path])
    );
    await execIfFileNotExist("config/jws-public.secp521r1.key", path =>
      spawnAsync("openssl", ["pkey", "-pubout", "-in", "config/jws.secp521r1.key", "-out", path])
    );

    console.log("Wait for DB ready to run Prisma migrations");

    // TODO more reliable check for DB up
    await setTimeout(3000);

    await spawnAsync("npx", ["prisma", "migrate", "dev"]);

    console.log("All Done! Execute to start: npm run start");
    process.exit();
  });
