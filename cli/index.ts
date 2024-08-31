#!/usr/bin/env tsx

import { main } from "@linkedmink/node-cli-utilities";
import { Command } from "commander";
import { userCommands } from "./app-action-commands.js";
import { setupCommand } from "./setup-command.js";

// const cli = new Command(packageJson.name.split("/").pop())
// .version(packageJson.version)

const cli = new Command("external-idp-user-cli")
  .description("Utility functions that can setup data before operating")
  .addCommand(setupCommand)
  .addCommand(userCommands);

void main(cli);
