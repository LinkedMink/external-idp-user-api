import type { HttpStatus } from "@nestjs/common";

export type StatusCodeErrorDto = {
  message: string;
  statusCode: HttpStatus;
};

export type ValidationErrorDto = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};
