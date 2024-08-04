#!/usr/bin/env ts-node

import { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command } from "commander";
import { AppModule } from "./app.module";
import { Claims, ClaimsAccessLevel } from "./config/user.const";
import { UserService } from "./services/user.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppAction = (app: INestApplicationContext, ...args: any[]) => Promise<void>;

const appAction =
  (action: AppAction) =>
  async (...args: unknown[]) => {
    const app = await NestFactory.createApplicationContext(AppModule);
    action(app, ...args);
    await app.close();
  };

async function main() {
  const addUser = new Command("add")
    .description("Add an admin user that can create/update other users")
    .argument("<username>", "The name to find this user by")
    .argument("<password>", "The password to authenticate")
    .action(
      appAction(async (app: INestApplicationContext, username: string, password: string) => {
        const userService = app.get(UserService);
        await userService.create({
          username,
          password,
          isLocked: false,
          claims: {
            [Claims.USERS]: ClaimsAccessLevel.ADMIN,
          },
        });
      })
    );

  const deleteUser = new Command("delete")
    .description("Delete a user")
    .argument("<username>", "The name to find this user by")
    .action(
      appAction(async (app: INestApplicationContext, username: string) => {
        const userService = app.get(UserService);
        const user = await userService.findByUsername(username);
        if (!user) {
          throw new Error(`No user exist with name: ${username}`);
        }

        await userService.deleteById(user.id);
      })
    );

  const cli = new Command("npx external-idp-user-cli")
    .description("Utility functions that can setup data before operating")
    .addCommand(addUser)
    .addCommand(deleteUser);
  await cli.parseAsync();
}

void main();
