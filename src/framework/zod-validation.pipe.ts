import { PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { ZodSchema, ZodTypeDef } from "zod";

export class ZodValidationPipe<TOutput, TDef extends ZodTypeDef, TInput>
  implements PipeTransform<unknown, TOutput>
{
  constructor(private readonly schema: ZodSchema<TOutput, TDef, TInput>) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }

    return result.data;
  }
}
