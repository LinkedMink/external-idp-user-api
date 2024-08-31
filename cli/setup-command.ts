import {
  execIfFileNotExist,
  getLoggerByUrl,
  getRandomPass,
  spawnAsync,
  writeEjsTemplate,
} from "@linkedmink/node-cli-utilities";
import { Command } from "commander";
import { setTimeout } from "node:timers/promises";

interface SetupCommandOptions {
  passPostgres: string;
  passApp: string;
}

export const setupCommand = new Command("setup")
  .description("Initialize configuration")
  .option(
    "-p, --pass-postgres <string>",
    "Password for the 'postgres' user (random generated if not supplied)",
    getRandomPass()
  )
  .option(
    "-a, --pass-app <string>",
    "Password for the 'external_idp' application user (random generated if not supplied)",
    getRandomPass()
  )
  .action(async (options: SetupCommandOptions) => {
    const logger = getLoggerByUrl(import.meta.url);

    await Promise.all([
      writeEjsTemplate(".env.ejs", { postgresAppPassword: options.passApp }),
      writeEjsTemplate("config/api-docker.env.ejs", { postgresAppPassword: options.passApp }),
      writeEjsTemplate("config/postgres.env.ejs", { postgresAppPassword: options.passApp }),
    ]);

    logger.info("Config files written, start background Docker containers");

    await spawnAsync("docker", ["compose", "up", "-d", "--", "postgres", "valkey"]);

    logger.info("Write signing private and public key");

    await execIfFileNotExist("config/jws.secp521r1.key", path =>
      spawnAsync("openssl", ["ecparam", "-genkey", "-name", "secp521r1", "-out", path])
    );
    await execIfFileNotExist("config/jws-public.secp521r1.key", path =>
      spawnAsync("openssl", ["pkey", "-pubout", "-in", "config/jws.secp521r1.key", "-out", path])
    );

    logger.info("Wait for DB ready to run Prisma migrations");

    // TODO more reliable check for DB up
    await setTimeout(3000);

    await spawnAsync("npx", ["prisma", "migrate", "dev"]);

    logger.info("All Done! Execute to start: npm run start");
  });
