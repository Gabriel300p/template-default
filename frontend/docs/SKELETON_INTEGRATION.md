# Skeleton Integration Guide

## Available Skeleton Components

### Modal Skeletons (`/shared/components/dialogs/ModalSkeletons.tsx`)

- `ModalComunicacaoSkeleton`: For communication form modals
- `ModalDeleteConfirmSkeleton`: For confirmation dialogs

### Error Skeletons (`/shared/components/errors/ErrorSkeletons.tsx`)

- `ErrorBoundarySkeleton`: For error boundary loading states
- `ToastSkeleton`: For toast notification loading

### Navigation Skeletons (`/shared/components/navigation/NavigationSkeletons.tsx`)

- `TopBarSkeleton`: For header/toolbar loading
- `SidebarSkeleton`: For sidebar navigation loading
- `BreadcrumbSkeleton`: For breadcrumb trail loading

## Usage Examples

### Modal Loading States

```typescript
import { ModalComunicacaoSkeleton } from '@shared/components/dialogs/ModalSkeletons';

// Show skeleton while modal data is loading
{isModalOpen && (
  <Dialog>
    {isLoading ? (
      <ModalComunicacaoSkeleton />
    ) : (
      <ModalComunicacao data={modalData} />
    )}
  </Dialog>
)}
```

### Navigation Loading States

```typescript
import { TopBarSkeleton, SidebarSkeleton } from '@shared/components/navigation/NavigationSkeletons';

// Show skeleton while user data or navigation data loads
<div className="layout">
  {isUserLoading ? <TopBarSkeleton /> : <TopBar user={user} />}
  {isNavLoading ? <SidebarSkeleton /> : <Sidebar items={navItems} />}
</div>
```

### Error Loading States

```typescript
import { ErrorBoundarySkeleton } from '@shared/components/errors/ErrorSkeletons';

// Show skeleton while error handling is initializing
{errorState === 'initializing' ? (
  <ErrorBoundarySkeleton />
) : (
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
)}
```

## Integration Priority

### Phase 1: Critical Pages

1. Main dashboard/home page
2. Communication listing page
3. Modal dialogs (already in /shared)

### Phase 2: Navigation

1. Top navigation bar
2. Sidebar navigation
3. Breadcrumb trails

### Phase 3: Error States

1. Error boundary integration
2. Toast notification loading
3. Loading error states

## Best Practices

1. **Consistent Timing**: Use same loading duration across similar components
2. **Animation Sync**: Skeleton animations should match component mount timing
3. **Accessibility**: Include proper ARIA labels for loading states
4. **Fallback**: Always have skeleton as fallback for slow loading
5. **Responsive**: Skeletons should match responsive breakpoints of actual components

## Next Steps

1. Identify pages that need skeleton integration
2. Implement loading state management
3. Replace generic loading spinners with specific skeletons
4. Test skeleton behavior across different loading scenarios
5. Document component-specific skeleton usage patterns
