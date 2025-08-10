import type { ZodErrorMap, ZodIssue } from 'zod';
import { z } from 'zod';

// Pass-through global error map (placeholder for future global i18n)
export const zodI18nErrorMap: ZodErrorMap = (_issue: ZodIssue, ctx) => ({ message: ctx.defaultError });
z.setErrorMap(zodI18nErrorMap);
