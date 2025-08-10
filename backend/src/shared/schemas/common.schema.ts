import { z } from 'zod';

// UUID validation schema
export const UUIDSchema = z.string().uuid('ID deve ser um UUID válido');

// Pagination query schema
export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, 'Página deve ser maior que 0'),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, 'Limite deve estar entre 1 e 100'),
});

// Search query schema
export const SearchQuerySchema = z.object({
  search: z.string().optional(),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Date range query schema
export const DateRangeQuerySchema = z.object({
  dataInicio: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Data inicial inválida'),
  dataFim: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Data final inválida'),
});

// Combined query schema for listings
export const ListQuerySchema = PaginationQuerySchema.merge(SearchQuerySchema).merge(
  DateRangeQuerySchema,
);

// Pagination metadata schema
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Generic paginated response schema
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  path: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
        value: z.any().optional(),
      }),
    )
    .optional(),
});

// Success message response schema
export const MessageResponseSchema = z.object({
  message: z.string(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
});

// Health check response schema
export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  uptime: z.number().positive(),
  version: z.string(),
});

// Detailed health check response schema
export const DetailedHealthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  uptime: z.number().positive(),
  version: z.string(),
  components: z.object({
    database: z.object({
      status: z.enum(['healthy', 'unhealthy']),
      responseTime: z.number().optional(),
    }),
    redis: z.object({
      status: z.enum(['healthy', 'unhealthy']),
      responseTime: z.number().optional(),
    }),
    external_apis: z.object({
      status: z.enum(['healthy', 'unhealthy']),
      services: z
        .array(
          z.object({
            name: z.string(),
            status: z.enum(['healthy', 'unhealthy']),
            responseTime: z.number().optional(),
          }),
        )
        .optional(),
    }),
  }),
});

// File upload schema
export const FileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().int().positive(),
  buffer: z.instanceof(Buffer).optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

// Generic ID parameter schema
export const IdParamSchema = z.object({
  id: UUIDSchema,
});

// Sort options schema
export const SortOptionsSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// Filter options schema
export const FilterOptionsSchema = z.record(z.string(), z.any());

// Type exports
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
export type ListQuery = z.infer<typeof ListQuerySchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type DetailedHealthResponse = z.infer<typeof DetailedHealthResponseSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
export type SortOptions = z.infer<typeof SortOptionsSchema>;
export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

// Helper function to create paginated response type
export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

