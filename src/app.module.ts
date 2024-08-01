import { Module } from "@nestjs/common";
import { AppController } from "./controllers/app.controller";
import { PasswordService } from "./services/password.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [PasswordService],
})
export class AppModule {}
