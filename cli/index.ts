#!/usr/bin/env ts-node

import { Command } from "commander";
import { addUserCommand, deleteUserCommand } from "./app-action-commands";
import { devSetupCommand } from "./dev-setup-command";

async function main() {
  const userCommands = new Command("user")
    .description("Commands to manipulate user records")
    .addCommand(addUserCommand)
    .addCommand(deleteUserCommand);

  const cli = new Command("npx external-idp-user-cli")
    .description("Utility functions that can setup data before operating")
    .addCommand(devSetupCommand)
    .addCommand(userCommands);

  await cli.parseAsync();
  process.exit();
}

void main();
