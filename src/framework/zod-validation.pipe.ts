import { PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { ZodType, treeifyError } from "zod";

export class ZodValidationPipe<TOutput, TInput> implements PipeTransform<unknown, TOutput> {
  constructor(private readonly schema: ZodType<TOutput, TInput>) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(treeifyError(result.error));
    }

    return result.data;
  }
}
