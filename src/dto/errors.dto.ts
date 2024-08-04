import type { HttpStatus } from "@nestjs/common";

export interface StatusCodeErrorDto {
  message: string;
  statusCode: HttpStatus;
}

export interface ValidationErrorDto {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}
