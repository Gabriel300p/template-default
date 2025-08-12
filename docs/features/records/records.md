# Records

> Documentação da feature records

**Última atualização:** 12/08/2025

📊 **Estatísticas:**
- Componentes: 6
- Páginas: 0
- Hooks: 3

---

## Visão Geral

A feature records fornece funcionalidades essenciais para o sistema.

### Objetivo
Gerenciar e organizar funcionalidades específicas do sistema.

## Componentes

Esta feature contém 6 componente(s).

### RecordDeleteModal

**Tipo:** react

Componente react com 4 propriedade(s) e 2 hook(s).

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|------------|
| isOpen | boolean | Sim | - |
| onClose | () => void | Sim | - |
| onConfirm | () => Promise<void> | Sim | - |
| record | BaseRecord | null | Não | - |

**Hooks utilizados:**
- `useTranslation` (library)
- `useState` (built-in)

**Elementos UI detectados:**
- button: high% de confiança
- modal: high% de confiança
- alert: low% de confiança

### RecordModal

**Tipo:** react

Componente react com 5 propriedade(s) e 4 hook(s).

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|------------|
| isOpen | boolean | Sim | - |
| onClose | () => void | Sim | - |
| onSave | (data: RecordForm) => Promise<void> | Sim | - |
| record | BaseRecord | null | Não | - |
| isEditing | boolean | Não | - |

**Hooks utilizados:**
- `useTranslation` (library)
- `useEffect` (built-in)
- `useMemo` (built-in)
- `useForm` (library)

**Elementos UI detectados:**
- button: high% de confiança
- modal: high% de confiança
- form: high% de confiança
- table: medium% de confiança
- input: high% de confiança
- select: high% de confiança
- alert: high% de confiança
- modal-form: high% de confiança
- action-table: medium% de confiança
- crud-interface: medium% de confiança

### RecordSkeletons

**Tipo:** react

Componente react.

**Elementos UI detectados:**
- filter: very-low% de confiança
- modal: low% de confiança
- table: high% de confiança
- filterable-table: high% de confiança

### recordColumns

**Tipo:** react

Componente react com 2 propriedade(s).

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|------------|
| onEdit | (record: BaseRecord) => void | Sim | - |
| onDelete | (record: BaseRecord) => void | Sim | - |

**Elementos UI detectados:**
- button: high% de confiança
- form: low% de confiança
- table: high% de confiança
- action-table: medium% de confiança
- crud-interface: medium% de confiança

### RecordDataTable

**Tipo:** react

Componente react e 3 hook(s).

**Hooks utilizados:**
- `useState` (built-in)
- `useMemo` (built-in)
- `useReactTable` (custom)

**Elementos UI detectados:**
- table: high% de confiança

### RecordsToolbar

**Tipo:** react

Componente react com 2 propriedade(s) e 3 hook(s).

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|------------|
| autores | string[] | Sim | - |
| totalCount | number | Não | - |

**Hooks utilizados:**
- `useRecordFilters` (custom)
- `useTranslation` (library)
- `useMemo` (built-in)

**Elementos UI detectados:**
- filter: high% de confiança
- form: low% de confiança
- table: very-low% de confiança
- input: medium% de confiança
- filterable-table: high% de confiança

## Hooks Customizados

Esta feature implementa 3 hook(s) customizado(s).

### useRecordFilters

🎯 Query parsers for URL persistence 🎯 Transform filters to more usable format 🎯 Check if any filters are active 🎯 Filter function for records Search filter (título, autor, tipo, descrição) Tipo filter Autor filter Date range filter (dataCriacao) 🎯 Reset all filters 🎯 Individual filter setters

**Exemplo de uso:**
```tsx
const result = useRecordFilters();
```

### useRecordModals

State Actions

**Exemplo de uso:**
```tsx
const result = useRecordModals();
```

### useRecords

Hook customizado useRecords

**Exemplo de uso:**
```tsx
const result = useRecords();
```

## Serviços

Esta feature utiliza 1 serviço(s).

### record.service

Serviço responsável por record.service

## Tipos e Interfaces

Esta feature utiliza tipos TypeScript padrão.

## Arquitetura

## Estrutura da Feature

### Componentes (6)
- **UI Components:** 6
- **Layout Components:** 0
- **Form Components:** 2

### Hooks (3)
- **Estado:** 3
- **Efeitos:** 0

### Padrões Utilizados
- **Componentização:** Separação clara de responsabilidades
- **Hooks Pattern:** Estado e lógica encapsulados
- **TypeScript:** Tipagem forte para maior confiabilidade



## Exemplos de Uso

### Exemplos Básicos
Exemplo básico de uso da feature records

### Exemplos Avançados
Exemplos avançados para casos complexos

### Integração
Como integrar records com outras features

## Testes

### Testes Unitários
Exemplos de testes unitários para records

### Testes de Integração
Testes de integração recomendados

### Testes E2E
Cenários end-to-end para validação

