import { z } from "zod";

/**
 * Converts Zod schema to JSON Schema for Swagger documentation
 */
export function zodToJsonSchema(schema: z.ZodSchema): any {
  // This is a simplified converter for basic Zod schemas
  // For production, consider using libraries like zod-to-json-schema

  if (schema instanceof z.ZodObject) {
    const properties: any = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(schema.shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodSchema);

      // Check if field is required (not optional)
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      ...(required.length > 0 && { required }),
    };
  }

  if (schema instanceof z.ZodString) {
    const result: any = { type: "string" };

    // Add format for email
    if ((schema as any)._def.checks?.some((c: any) => c.kind === "email")) {
      result.format = "email";
    }

    // Add pattern for regex
    const regexCheck = (schema as any)._def.checks?.find(
      (c: any) => c.kind === "regex"
    );
    if (regexCheck) {
      result.pattern = regexCheck.regex.source;
    }

    // Add min/max length
    const minCheck = (schema as any)._def.checks?.find(
      (c: any) => c.kind === "min"
    );
    const maxCheck = (schema as any)._def.checks?.find(
      (c: any) => c.kind === "max"
    );
    if (minCheck) result.minLength = minCheck.value;
    if (maxCheck) result.maxLength = maxCheck.value;

    return result;
  }

  if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToJsonSchema(schema.element),
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: schema.options,
    };
  }

  // Default fallback
  return { type: "object" };
}
