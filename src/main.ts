#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // TODO
    logger: ["log", "error", "warn", "debug", "verbose", "fatal"],
  });
  await app.listen(3000);
}
void bootstrap();
