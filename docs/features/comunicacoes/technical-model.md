# Comunicações - Documentação Técnica

> **Para Desenvolvedores** | Última atualização: 12/08/2025

## 📋 Visão Geral Técnica

A feature **Comunicações** implementa um sistema CRUD completo para gerenciamento de comunicações internas, utilizando React 18 + TypeScript com arquitetura de componentes modulares e validação robusta via Zod.

### **Localização:**
```
frontend/src/features/comunicacoes/
├── components/
│   ├── dialogs/         # Modais de criação/edição
│   ├── table/           # Tabela de dados
│   ├── toolbar/         # Filtros e busca
│   └── skeletons/       # Loading states
├── hooks/              # Lógica de estado
├── schemas/            # Validação Zod
├── pages/              # Página principal
└── i18n/              # Internacionalização
```

## 🏗️ Arquitetura de Componentes

### **Componentes Principais (5)**

#### 1. **ModalComunicacao** - Modal de CRUD
```typescript
// Props Interface
interface ModalComunicacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ComunicacaoForm) => Promise<void>;
  comunicacao?: Comunicacao | null;
  isEditing?: boolean;
}

// Hooks Utilizados
- useForm<ComunicacaoForm>    // React Hook Form
- useTranslation("records")   // i18n
- useEffect                   // Sincronização de estado
- useMemo                     // Valores padrão otimizados
```

#### 2. **ComunicacoesToolbar** - Sistema de Filtros
```typescript
// Props Interface
interface ComunicacoesToolbarProps {
  autores: string[];
  totalCount?: number;
}

// Filtros Implementados
| Filtro | Tipo | Componente | Opções |
|--------|------|------------|---------|
| Busca | Texto | TextFilter | Placeholder: "Buscar por título..." |
| Tipo | Select | Filter | ["Comunicado", "Aviso", "Notícia"] |
| Autor | Select | Filter | Lista dinâmica baseada em dados |
| Data | Range | DatePickerImproved | Seleção de período |

// State Management
- useFilters() // Hook customizado para estado dos filtros
```

#### 3. **DataTable** - Tabela Responsiva
```typescript
// Features
- Paginação automática
- Ordenação por coluna
- Ações inline (Editar/Deletar)
- Loading states
- Empty states

// Hooks
- useReactTable    // TanStack Table
- useState         // Estado local
- useMemo          // Configuração de colunas
```

#### 4. **ModalDeleteConfirm** - Confirmação de Exclusão
```typescript
interface ModalDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  comunicacao: Comunicacao | null;
}
```

#### 5. **CommunicationSkeletons** - Loading States
```typescript
// Componentes de loading:
- CommunicationTableSkeleton  // Tabela
- FilterToolbarSkeleton      // Toolbar
```

## 🔧 Schemas de Validação (Zod)

### **ComunicacaoForm Schema**
```typescript
const comunicacaoFormSchema = z.object({
  titulo: z.string()
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres")
    .trim(),
  autor: z.string()
    .min(2, "Mínimo 2 caracteres") 
    .max(50, "Máximo 50 caracteres")
    .trim(),
  tipo: z.enum(["Comunicado", "Aviso", "Notícia"]),
  descricao: z.string()
    .min(10, "Mínimo 10 caracteres")
    .max(1000, "Máximo 1000 caracteres")
});

// Tipos TypeScript gerados
type ComunicacaoForm = z.infer<typeof comunicacaoFormSchema>;
```

## 🎯 Hooks Customizados

### **useModals()** - Gerenciamento de Estados dos Modais
```typescript
export function useModals() {
  return {
    isAddModalOpen: boolean,
    isEditModalOpen: boolean, 
    isDeleteModalOpen: boolean,
    selectedComunicacao: Comunicacao | null,
    openAddModal: () => void,
    openEditModal: (comunicacao: Comunicacao) => void,
    openDeleteModal: (comunicacao: Comunicacao) => void,
    closeAllModals: () => void,
  };
}
```

### **useFilters()** - Estado dos Filtros
```typescript
export function useFilters() {
  return {
    filters: {
      search: string,
      tipo: string | null,
      autor: string | null,
      dateRange: DateRange | null,
    },
    hasActiveFilters: boolean,
    setSearch: (value: string) => void,
    setTipo: (value: string | null) => void,
    setAutor: (value: string | null) => void,
    setDateRange: (range: DateRange | null) => void,
    resetFilters: () => void,
  };
}
```

### **useComunicacoes()** - Data Fetching & Mutations
```typescript
// Implementa:
- Listagem com paginação
- Criação de comunicação
- Edição de comunicação  
- Exclusão de comunicação
- Cache e invalidação
```

## 📦 Dependências Principais

### **Runtime**
```json
{
  "react-hook-form": "^7.x",      // Formulários
  "@hookform/resolvers": "^3.x",  // Validação
  "zod": "^3.x",                  // Schema validation
  "@tanstack/react-table": "^8.x", // Tabela
  "react-i18next": "^13.x",       // Internacionalização
  "lucide-react": "^0.x",         // Ícones
  "framer-motion": "^10.x"        // Animações
}
```

### **Design System**
```typescript
// Componentes compartilhados utilizados:
- Dialog, DialogContent, DialogHeader, DialogFooter
- Button, Input, Textarea, Select
- Table, TableHeader, TableRow, TableCell
- Card, CardHeader, CardContent
```

## 🚀 Como Implementar

### **1. Setup Básico**
```typescript
// 1. Criar estrutura de pastas
mkdir -p src/features/comunicacoes/{components,hooks,schemas,pages}

// 2. Instalar dependências
npm install react-hook-form @hookform/resolvers zod @tanstack/react-table

// 3. Configurar schemas
export const comunicacaoFormSchema = z.object({...});
```

### **2. Implementar Componentes**
```typescript
// ModalComunicacao.tsx
export const ModalComunicacao = memo(function ModalComunicacao(props) {
  const { register, handleSubmit, formState } = useForm<ComunicacaoForm>({
    resolver: zodResolver(comunicacaoFormSchema),
    mode: "onChange"
  });
  
  // Implementação...
});
```

### **3. Configurar Roteamento**
```typescript
// App.tsx ou Router
<Route path="/comunicacoes" element={<ComunicacoesPage />} />
```

## ⚙️ Configurações

### **Filtros Customizáveis**
```typescript
// ComunicacoesToolbar.tsx
const tipoOptions: FilterOption[] = [
  {
    label: "Comunicado",
    value: "Comunicado", 
    icon: <FilterIcon className="h-4 w-4 text-blue-500" />
  },
  // ... outros tipos
];
```

### **Validação i18n**
```typescript
// zodErrorMap.ts
export const applyComunicacoesErrorMap = (schema) => 
  schema.setErrorMap((issue, ctx) => ({
    message: t(`validation.${issue.code}`, { 
      min: issue.minimum,
      max: issue.maximum 
    })
  }));
```

## 🧪 Estratégias de Teste

### **Unit Tests**
```typescript
// ModalComunicacao.test.tsx
describe('ModalComunicacao', () => {
  it('should validate form correctly', () => {
    const result = comunicacaoFormSchema.safeParse({
      titulo: '', // Deve falhar
      autor: 'João',
      tipo: 'Comunicado',
      descricao: 'Descrição válida'
    });
    
    expect(result.success).toBe(false);
  });
});
```

### **Integration Tests**
```typescript
// ComunicacoesPage.test.tsx  
it('should create communication successfully', async () => {
  render(<ComunicacoesPage />);
  
  // Abrir modal
  await user.click(screen.getByText('Nova Comunicação'));
  
  // Preencher form
  await user.type(screen.getByLabelText('Título'), 'Teste');
  
  // Submeter
  await user.click(screen.getByText('Salvar'));
  
  // Verificar resultado
  expect(screen.getByText('Comunicação criada')).toBeInTheDocument();
});
```

## 🔍 Performance & Otimizações

### **Memoization**
```typescript
// Componentes memoizados
export const ModalComunicacao = memo(function ModalComunicacao() {...});

// Valores computados
const tipoOptions = useMemo(() => [...], [t]);
```

### **Lazy Loading**
```typescript
// LazyDataTable para grandes volumes
const LazyDataTable = lazy(() => import('./LazyDataTable'));
```

### **Debounced Search**
```typescript
// useFilters.ts
const debouncedSetSearch = useCallback(
  debounce((value: string) => setSearch(value), 300),
  []
);
```

## 📝 Notas para Desenvolvedores

### **⚠️ Considerações Importantes**
- **Form State**: Modal reseta form automaticamente no `useEffect`
- **Validation**: Validação em tempo real (`mode: "onChange"`)
- **Memory Leaks**: Componente é memoizado para evitar re-renders desnecessários
- **Accessibility**: Todos os inputs têm labels corretos e aria-attributes

### **🔄 TODOs/Melhorias**
- [ ] Implementar paginação server-side para grandes volumes
- [ ] Adicionar upload de anexos nas comunicações  
- [ ] Implementar notificações push para novas comunicações
- [ ] Cache otimizado com React Query/SWR
- [ ] Testes E2E com Playwright

### **🚨 Limitações Atuais**
- Paginação apenas client-side (máximo 1000 registros)
- Filtros não persistem entre navegações
- Sem suporte a rich-text no campo descrição
- Sem histórico de alterações
