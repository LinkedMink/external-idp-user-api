import { ConflictException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ValidationErrorDto } from "../dto/errors.dto";

/**
 * @see https://www.prisma.io/docs/orm/reference/error-reference#error-codes
 */
const PrismaErrorCode = {
  UNIQUE_CONSTRAINT: "P2002",
  NOT_FOUND: "P2025",
};

export type DbErrorHandler = (error: Prisma.PrismaClientKnownRequestError) => void;

export function handleNotFound(error: Prisma.PrismaClientKnownRequestError) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PrismaErrorCode.NOT_FOUND
  ) {
    throw new NotFoundException();
  }
}

export function handleDuplicateRecord(error: Prisma.PrismaClientKnownRequestError) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PrismaErrorCode.UNIQUE_CONSTRAINT
  ) {
    const message = `Can't create duplicate record${error.meta?.model ? ` ${error.meta.model as string}` : ""}`;
    const errorResult: ValidationErrorDto = {
      formErrors: [message],
      fieldErrors: {},
    };
    throw new ConflictException(errorResult);
  }
}

export async function resolveOrHandleDbError<T>(
  resultPromise: Promise<T>,
  ...errorHandlers: [DbErrorHandler, ...DbErrorHandler[]]
) {
  try {
    return await resultPromise;
  } catch (error) {
    errorHandlers.forEach(handler => handler(error));
    throw error;
  }
}
