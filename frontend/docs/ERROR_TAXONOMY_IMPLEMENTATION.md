# Error Taxonomy Implementation

## Overview
Centralized error classification and handling strategy for consistent error management across the application.

## Architecture

### Error Types (`/shared/lib/errors/taxonomy.ts`)
Hierarchical error classification:

**Network/API:**
- `NETWORK` - Connection issues, offline state
- `API_ERROR` - Server errors (5xx)
- `TIMEOUT` - Request timeouts
- `UNAUTHORIZED` - 401 authentication failures
- `FORBIDDEN` - 403 permission issues
- `NOT_FOUND` - 404 resource not found

**Validation/Input:**
- `VALIDATION` - Schema/input validation failures
- `FORM_ERROR` - Form-specific validation

**Business Logic:**
- `BUSINESS_RULE` - Domain rule violations
- `RESOURCE_CONFLICT` - Concurrent modification conflicts

**System/Technical:**
- `RUNTIME` - Unexpected runtime errors
- `CONFIGURATION` - System misconfiguration
- `UNKNOWN` - Unclassified errors

### Error Handling Strategies
Each error type has an associated strategy defining:
- `showToast` - Whether to display toast notification
- `logError` - Whether to log to console/service
- `reportError` - Whether to report to external service
- `retryable` - Whether operation can be retried
- `fallbackAction` - Fallback behavior function

### Error Handler (`/shared/lib/errors/handler.ts`)
Singleton service that:
- Processes `AppError` objects according to their type strategy
- Integrates with toast notification system
- Provides consistent logging and reporting
- Supports external error reporting services (Sentry, LogRocket, etc.)

## Usage

```tsx
// In components
function MyComponent() {
  const errorHandler = useErrorHandler();
  
  const handleError = (error: unknown) => {
    const appError = createAppError(
      ErrorTypes.API_ERROR,
      'FETCH_FAILED', 
      'Failed to load data',
      { details: error, context: { component: 'MyComponent' } }
    );
    errorHandler.handle(appError);
  };
}

// HTTP error classification
const errorType = classifyHttpError(response.status);
```

## Integration Points
- React Query error boundaries
- Form validation error display  
- API service error handling
- Global error boundary fallback
- Toast notification system

## Future Enhancements
- Error retry mechanisms with exponential backoff
- User-friendly error message mapping
- Error reporting service integration
- Error analytics and monitoring
- Offline/network state handling
