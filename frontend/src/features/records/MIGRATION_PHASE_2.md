# Records Feature Rename - Phase 2

## Overview

Moving source files from `comunicacoes` to `records` while maintaining backwards compatibility.

## Phase 2: Source File Migration

### Components Migration

1. **Table Components** (`components/table/`)
   - `DataTable.tsx` → Keep optimized version with animations
   - `columns.tsx` → Update column definitions for generic records
   - `VirtualizedTable.tsx` → Already updated

2. **Dialog Components** (`components/dialogs/`)
   - `ModalComunicacao.tsx` → `ModalRecord.tsx` (generic entity modal)
   - `ModalDeleteConfirm.tsx` → Keep generic delete confirmation

3. **Toolbar Components** (`components/toolbar/`)
   - `ComunicacoesToolbar.tsx` → `RecordsToolbar.tsx` (generic filters)

### Service Layer Migration

1. **API Services** (`services/`)
   - `comunicacao.service.ts` → `record.service.ts` (generic CRUD)
   - Update endpoints to use generic `/records` path

### Schema Migration

1. **Type Definitions** (`schemas/`)
   - `comunicacao.schemas.ts` → `record.schemas.ts` (generic record types)
   - Keep communication-specific extensions

### Hook Migration

1. **Data Hooks** (`hooks/`)
   - `useComunicacoes.ts` → `useRecords.ts` (generic CRUD operations)
   - `useSearch.ts` → Keep generic search functionality

### Route Migration

1. **Page Components** (`pages/`)
   - `ComunicacoesPage.tsx` → `RecordsPage.tsx` (generic list page)

### Backward Compatibility Strategy

- Bridge exports in `/features/records/index.ts`
- Re-export all moved components with original names
- Gradual route migration with redirects
- Maintain existing API endpoints during transition

### Migration Checklist

- [ ] Move schema definitions
- [ ] Update service layer with generic endpoints
- [ ] Migrate hook implementations
- [ ] Update component naming and props
- [ ] Update i18n keys to use generic record terminology
- [ ] Update route definitions
- [ ] Add backward compatibility exports
- [ ] Update tests with new component names
- [ ] Update documentation references

### Next Steps

After Phase 2 completion:

- Phase 3: Route and API endpoint updates
- Phase 4: Remove comunicacoes-specific references
- Phase 5: Complete backward compatibility removal
