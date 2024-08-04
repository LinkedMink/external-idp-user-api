import { PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe<TOutput> implements PipeTransform<unknown, TOutput> {
  constructor(private readonly schema: ZodSchema<TOutput>) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }

    return result.data;
  }
}
