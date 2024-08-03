#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { Command } from "commander";
import { AppModule } from "./app.module";
import { UserService } from "./services/user.service";
import { Claims } from "./config/user.const";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const addUser = new Command("user")
    .description("Add an admin user that can create/update other users")
    .argument("<username>", "The name to find this user by")
    .argument("<password>", "The password to authenticate")
    .action(async (username: string, password: string) => {
      const userService = app.get(UserService);
      await userService.create({
        username,
        password,
        isLocked: false,
        claims: {
          [Claims.USER_ADMIN]: String(true),
        },
      });
    });

  const cli = new Command("external-idp-user-cli").addCommand(addUser, { isDefault: true });
  await cli.parseAsync();

  await app.close();
}

void bootstrap();
