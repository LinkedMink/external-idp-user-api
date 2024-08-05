import { Command } from "commander";
import { randomBytes } from "node:crypto";
import { writeFile, stat } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
import { spawnAsync } from "./utility";

const DOT_ENV_PATH = ".env";
const dotEnvTemplate = (postgresAppPassword: string) => `# ${DOT_ENV_PATH}
NODE_ENV=development
# NODE_EXTRA_CA_CERTS=config/ca.secp384r1.crt
# DEBUG=*

LOGGING='{
  "level": "debug"
}'

PASSWORD='{
  "saltBytes": 16,
  "hashBytes": 32
}'

SIGNING='{
  "signingAlgorithm": "ES512",
  "signingKeyFilePath": "./config/jws.secp521r1.key",
  "issuer": "api.linkedmink.net",
  "audience": "client.linkedmink.net",
  "expireInMinutes": 120
}'
DATABASE_URL=postgresql://external_idp:${postgresAppPassword}@localhost:5432/external_idp?schema=external_idp
CACHE='{
  "redis": {
    "url": "redis://localhost:6379"
  }
}'

INSPECT_TYPE=inspect-brk
`;

const POSTGRES_DOT_ENV_PATH = "config/postgres.env";
const postgresDotEnvTemplate = (
  postgresPassword: string,
  postgresAppPassword: string
) => `# ${POSTGRES_DOT_ENV_PATH}
POSTGRES_PASSWORD=${postgresPassword}
POSTGRES_APP_PASSWORD=${postgresAppPassword}
`;

const DOCKER_DOT_ENV_PATH = "config/api-docker.env";
const dockerDotEnvTemplate = (postgresAppPassword: string) => `# ${DOCKER_DOT_ENV_PATH}
# NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca.secp384r1.crt

SIGNING='{
  "signingAlgorithm": "ES512",
  "signingKeyFilePath": "/run/secrets/jws.secp521r1.key",
  "issuer": "api.linkedmink.net",
  "audience": "client.linkedmink.net",
  "expireInMinutes": 120
}'
DATABASE_URL=postgresql://external_idp:${postgresAppPassword}@postgres:5432/external_idp?schema=external_idp
CACHE='{
  "redis": {
    "url": "redis://redis:6379"
  }
}'
`;

const execIfFileNotExist = async (path: string, exec: (path: string) => Promise<void>) => {
  try {
    await stat(path);
    console.log(`Config exist, skip: ${path}`);
  } catch {
    console.log(`Config not found, exec: ${path}`);
    await exec(path);
  }
};

export interface DevSetupCommandOptions {
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
      execIfFileNotExist(DOT_ENV_PATH, path =>
        writeFile(path, dotEnvTemplate(options.passApp), "utf8")
      ),
      execIfFileNotExist(POSTGRES_DOT_ENV_PATH, path =>
        writeFile(path, postgresDotEnvTemplate(options.passPostgres, options.passApp), "utf8")
      ),
      execIfFileNotExist(DOCKER_DOT_ENV_PATH, path =>
        writeFile(path, dockerDotEnvTemplate(options.passApp), "utf8")
      ),
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
