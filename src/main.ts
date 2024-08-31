#!/usr/bin/env node

import { ConsoleLogger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ["log", "error", "warn", "debug", "verbose", "fatal"],
  });
  app.useLogger(await app.resolve(ConsoleLogger));
  await app.listen(process.env.LISTEN_PORT ?? 58080);
}
void bootstrap();
