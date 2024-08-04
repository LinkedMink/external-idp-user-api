export interface StatusCodeErrorDto {
  message: string;
  statusCode: number;
}

export interface ValidationErrorDto {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}
