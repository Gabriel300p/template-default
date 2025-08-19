# records - Documentação Técnica

> **Para Desenvolvedores** | Última atualização: 15/08/2025

## 📋 Visão Geral Técnica

A feature "records" implementa uma série de componentes React/TypeScript que permitem a manipulação de registros, incluindo visualização, edição e exclusão. A arquitetura é baseada em hooks e componentes funcionais, proporcionando uma experiência de usuário fluida e responsiva.

### **Localização:**
```
/src/features/records
```

## 🏗️ Arquitetura de Componentes

### **RecordDeleteModal** - Modal para confirmação de exclusão de registro
```typescript
// Props Interface REAL
interface RecordDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  record: BaseRecord | null;
}

// Hooks REALMENTE Utilizados
useTranslation;
useState;
```

### **RecordModal** - Modal para criação e edição de registros
```typescript
// Props Interface REAL
interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RecordForm) => Promise<void>;
  record: BaseRecord | null;
  isEditing: boolean;
}

// Hooks REALMENTE Utilizados
useTranslation;
useEffect;
useMemo;
useForm;
```

### **RecordSkeletons** - Esqueleto de carregamento para registros
```typescript
// Dependências
@shared/components/ui/skeleton;
framer-motion;
```

### **recordColumns** - Definição das colunas da tabela de registros
```typescript
// Props Interface REAL
interface RecordColumnsProps {
  onEdit: (record: BaseRecord) => void;
  onDelete: (record: BaseRecord) => void;
}

// Dependências
@shared/components/icons;
@shared/components/ui/button;
date-fns;
date-fns/locale;
@/app/i18n/init;
@shared/components/ui/table-sort;
```

### **RecordDataTable** - Tabela de dados de registros
```typescript
// Hooks REALMENTE Utilizados
useState;
useMemo;
useReactTable;
```

### **RecordsToolbar** - Toolbar para filtragem e contagem de registros
```typescript
// Props Interface REAL
interface RecordsToolbarProps {
  autores: string[];
  totalCount: number;
}

// Hooks REALMENTE Utilizados
useRecordFilters;
useTranslation;
useMemo;
```

## 🔧 Schemas de Validação

Não foram identificados schemas de validação Zod no código fornecido.

## 🎯 Hooks Customizados

### **useRecordFilters** - Hook customizado para gerenciamento de filtros de registros.

## 📦 Dependências Principais

- @shared/components/icons
- @shared/components/ui/button
- @shared/components/ui/dialog
- react
- react-i18next
- @hookform/resolvers/zod
- @shared/components/ui/input
- @shared/components/ui/select
- @shared/components/ui/textarea
- react-hook-form
- @shared/components/ui/skeleton
- framer-motion
- date-fns
- date-fns/locale
- @/app/i18n/init
- @shared/components/ui/table-sort
- @shared/components/ui/OptimizedTable
- @shared/components/ui/pagination
- @tanstack/react-table
- @shared/components/filters
- lucide-react

## 🚀 Como Implementar

Para implementar a feature "records", importe os componentes necessários e utilize os hooks para gerenciar o estado e a lógica de negócios. Certifique-se de passar as props corretas para cada componente, conforme definido nas interfaces.

## ⚙️ Configurações

Não foram identificadas configurações específicas no código fornecido.

## 🧪 Estratégias de Teste

Os testes devem incluir:
- Testes de unidade para cada componente, garantindo que as props sejam passadas corretamente e que os hooks funcionem como esperado.
- Testes de integração para verificar a interação entre os componentes, especialmente nas funcionalidades de edição e exclusão de registros.

## 🔍 Performance & Otimizações

Não foram identificadas otimizações específicas implementadas no código fornecido.

## 📝 Notas para Desenvolvedores

- As validações de formulários devem ser implementadas conforme as regras de negócio definidas.
- Considere a adição de feedback visual para operações assíncronas, como salvamento e exclusão de registros.
- Limitações e TODOs devem ser documentados conforme surgirem durante o desenvolvimento.