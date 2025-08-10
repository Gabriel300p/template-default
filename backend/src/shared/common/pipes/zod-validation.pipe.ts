import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.path.reduce((obj, key) => obj?.[key], value),
        }));

        this.logger.warn('Validation failed', {
          errors: formattedErrors,
          input: value,
          metadata,
        });

        throw new BadRequestException({
          error: 'Dados de entrada inválidos',
          message: 'Falha na validação dos dados',
          statusCode: 400,
          details: formattedErrors,
        });
      }
      throw error;
    }
  }
}

/**
 * Factory function to create a Zod validation pipe
 * 
 * @param schema - Zod schema to validate against
 * @returns ZodValidationPipe instance
 * 
 * @example
 * ```typescript
 * @Post('users')
 * @UsePipes(createZodPipe(CreateUserSchema))
 * createUser(@Body() createUserDto: CreateUserDto) {
 *   return this.usersService.create(createUserDto);
 * }
 * ```
 */
export const createZodPipe = (schema: ZodSchema) => new ZodValidationPipe(schema);

