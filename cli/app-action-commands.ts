import { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command } from "commander";
import { Claims, ClaimsAccessLevel } from "../src/config/user.const.js";
import { UserService } from "../src/services/user.service.js";
import { CliModule } from "./cli.module.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppAction = (app: INestApplicationContext, ...args: any[]) => Promise<void>;

const appAction =
  (action: AppAction) =>
  async (...args: unknown[]) => {
    const app = await NestFactory.createApplicationContext(CliModule);
    await action(app, ...args);
    await app.close();
  };

const addUserCommand = new Command("add")
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

const deleteUserCommand = new Command("delete")
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

export const userCommands = new Command("user")
  .description("Commands to manipulate user records")
  .addCommand(addUserCommand)
  .addCommand(deleteUserCommand);
