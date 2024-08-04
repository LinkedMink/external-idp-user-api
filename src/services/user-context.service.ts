import { Injectable, Scope } from "@nestjs/common";
import type { JWTPayload } from "jose";

@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
  private userValue?: JWTPayload;

  get user() {
    if (!this.userValue) {
      throw new Error("The user context hasn't been set by authentication before being accessed");
    }
    return this.userValue;
  }

  set user(value: JWTPayload) {
    if (this.userValue) {
      throw new Error("The user context should only be set once after authentication");
    }
    this.userValue = value;
  }
}
