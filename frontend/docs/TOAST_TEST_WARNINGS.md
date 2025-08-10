# Toast Test Warnings - Future Fix

## Issue

Tests show warning: "An update to ToastProvider inside a test was not wrapped in act(...)"

## Location

- File: `src/features/comunicacoes/hooks/useComunicacoes.test.tsx`
- Test: "should track loading states for mutations"

## Current Status

- All tests (36/36) are passing ✅
- Warning appears in stderr but doesn't fail tests
- Functionality is working correctly in both tests and application

## Future Fix Strategy (When Ready)

### Option 1: Mock the ToastProvider

```typescript
// In test setup
vi.mock("@shared/hooks/useToast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));
```

### Option 2: Wrap Toast Updates in act()

```typescript
// In the test
import { act } from "@testing-library/react";

// Before mutation that triggers toast
act(() => {
  // mutation code that causes toast updates
});
```

### Option 3: Use waitFor for async toast updates

```typescript
import { waitFor } from "@testing-library/react";

await waitFor(() => {
  // expect toast-related assertions
});
```

## Priority

- **Current**: LOW (tests pass, functionality works)
- **Production Impact**: None (warning only in tests)
- **Development Impact**: Minimal (just noise in test output)

## Decision

Leave as-is for now since:

1. Tests are passing
2. No functional issues
3. Warning is just development noise
4. Can be addressed in future test refactoring phase
