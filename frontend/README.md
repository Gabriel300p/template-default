# 🎓 Centro Educacional Alfa

Sistema de gestão educacional moderno e escalável, desenvolvido com as melhores práticas de frontend.

## 🚀 Tecnologias

- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **TanStack Query** - Gerenciamento de estado server
- **Zustand** - Gerenciamento de estado client
- **React Hook Form + Zod** - Formulários e validação
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes base
- **Framer Motion** - Animações
- **Vitest + Testing Library** - Testes

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Configuração da aplicação
│   ├── providers/         # Providers globais (React Query, etc)
│   └── store/            # Stores Zustand
├── shared/               # Recursos compartilhados
│   ├── api/              # Cliente API e configurações
│   ├── components/       # Componentes reutilizáveis
│   ├── constants/        # Constantes da aplicação
│   ├── hooks/           # Hooks customizados
│   ├── schemas/         # Schemas Zod para validação
│   └── types/           # Tipos TypeScript globais
├── features/            # Features organizadas por domínio
│   ├── auth/           # Autenticação
│   └── comunicacoes/   # Módulo de comunicações
└── components/         # Componentes UI base (legado)
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento
pnpm build            # Build para produção
pnpm preview          # Preview do build

# Qualidade de código
pnpm lint             # Executa ESLint
pnpm lint:fix         # Corrige problemas automaticamente
pnpm type-check       # Verifica tipos TypeScript

# Testes
pnpm test             # Roda testes em modo watch
pnpm test:run         # Executa todos os testes
pnpm test:coverage    # Gera relatório de cobertura
```

## 🏗️ Arquitetura e Padrões

### Gerenciamento de Estado

- **Zustand** para estado global da aplicação
- **TanStack Query** para estado do servidor (cache, sincronização)
- **React Hook Form** para estado de formulários

### Validação

- **Zod** para validação de schemas
- Validação tanto no frontend quanto preparada para backend

### Componentização

- Componentes organizados por responsabilidade
- Separação clara entre componentes de UI e componentes de negócio
- Uso de composition pattern

### Performance

- **Code splitting** com lazy loading
- **Bundle splitting** otimizado
- Memoização estratégica de componentes
- Debounce em operações de busca

### 📱 Interface Responsiva

- **Design Adaptativo**: Interface otimizada para desktop, tablet e mobile
- **Componentes Reutilizáveis**: Sistema de design consistente
- **Experiência de Usuário**: Interface intuitiva e acessível

## 🛠️ Tecnologias Utilizadas

### Core

- **React 19.1.0**: Biblioteca principal para construção da interface
- **TypeScript**: Tipagem estática para maior segurança e produtividade
- **Vite 7.0.4**: Build tool moderna e rápida

### Estilização

- **TailwindCSS 4.1.11**: Framework CSS utilitário para estilização
- **Radix UI**: Componentes acessíveis e customizáveis
- **Phosphorn Icons**: Biblioteca de ícones

### Gerenciamento de Estado

- **React Query 5.83.0**: Gerenciamento de estado do servidor e cache
- **React Hooks**: Gerenciamento de estado local

### Roteamento

- **React Router DOM 7.7.1**: Navegação entre páginas

### Outras Bibliotecas

- **React Table 8.21.3**: Tabelas interativas e responsivas
- **Date-fns**: Manipulação e formatação de datas

## 🏗️ Arquitetura da Aplicação

### Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes básicos de UI
│   ├── layout/          # Componentes de layout
│   └── common/          # Componentes comuns
├── pages/               # Páginas da aplicação
│   ├── comunicacoes/    # Módulo de comunicações
│   │   ├── components/  # Componentes específicos
│   │   ├── hooks/       # Hooks customizados
│   │   └── services/    # Serviços e dados
│   └── LoginPage.tsx    # Página de login
├── types/               # Definições de tipos TypeScript
├── lib/                 # Utilitários e configurações
└── assets/              # Recursos estáticos
```

### Padrões Arquiteturais

- **Feature-Based Architecture**: Organização por funcionalidades
- **Component Composition**: Componentes reutilizáveis e compostos
- **Custom Hooks**: Lógica de negócio encapsulada
- **Service Layer**: Camada de serviços para integração com dados

## 🚀 Setup Inicial

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Gabriel300p/challenge-3-centro-educacional-alfa.git

# Navegue até o diretório
cd challenge-3-centro-educacional-alfa

# Instale as dependências
npm install

# Execute o projeto em modo de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev      # Executa em modo de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Visualiza build de produção
npm run lint     # Executa linting do código
```

## 💻 Guia de Uso

### 1. Acesso ao Sistema

- Acesse a aplicação através da rota `/login`
- Use as credenciais de professor para fazer login
- Após autenticação, você será redirecionado para a página de comunicações

### 2. Visualização de Comunicações

- A página principal exibe todas as comunicações em formato de tabela
- Use o campo de busca para filtrar por título, autor, tipo ou descrição
- Visualize informações como título, autor, tipo, datas de criação e atualização

### 3. Criação de Comunicações

- Clique no botão "Nova Comunicação"
- Preencha os campos obrigatórios: título, autor, tipo e descrição
- Clique em "Adicionar" para salvar

### 4. Edição de Comunicações

- Clique no ícone de edição na linha da comunicação desejada
- Modifique os campos necessários
- Clique em "Editar" para salvar as alterações

### 5. Exclusão de Comunicações

- Clique no ícone de exclusão na linha da comunicação desejada
- Confirme a exclusão no modal de confirmação

## 🎨 Sistema de Design

### Paleta de Cores

- **Primária**: Tons de azul para elementos principais
- **Secundária**: Cinza para elementos neutros
- **Status**: Verde, amarelo e vermelho para estados específicos

### Tipografia

- **Fonte Principal - Inter**: Sistema padrão otimizada para legibilidade
- **Hierarquia**: Diferentes pesos e tamanhos para organização visual

### Componentes

- **Botões**: Variações de tamanho e estilo
- **Formulários**: Campos consistentes e validação visual
- **Tabelas**: Layout responsivo com ordenação e paginação
- **Modais**: Sobreposições para ações importantes

### Operações CRUD

- **GET /comunicacoes**: Buscar todas as comunicações
- **POST /comunicacoes**: Criar nova comunicação
- **PUT /comunicacoes/:id**: Atualizar comunicação existente
- **DELETE /comunicacoes/:id**: Excluir comunicação

### Gerenciamento de Estado

- Utilização do React Query para cache e sincronização
- Estados de loading, error e success
- Invalidação automática após mutações

## 📱 Responsividade

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações por Dispositivo

- **Mobile**: Layout em coluna única, navegação simplificada
- **Tablet**: Layout híbrido, tabelas com scroll horizontal
- **Desktop**: Layout completo, todas as funcionalidades visíveis

## 🔒 Segurança e Autenticação

### Controle de Acesso

- Rotas protegidas para funcionalidades administrativas
- Validação de autenticação em componentes sensíveis
- Redirecionamento automático para login quando necessário

### Validação de Dados

- Validação de formulários no frontend
- Sanitização de entradas do usuário
- Feedback visual para erros de validação

## 🧪 Testes e Qualidade

### Ferramentas de Qualidade

- **ESLint**: Análise estática de código
- **TypeScript**: Verificação de tipos
- **Prettier**: Formatação consistente de código

### Boas Práticas

- Componentização adequada
- Hooks customizados para lógica reutilizável
- Tipagem forte com TypeScript
- Convenções de nomenclatura consistentes

## 🚀 Deploy e Produção

### Build de Produção

```bash
npm run build
```

### Otimizações

- Code splitting automático
- Compressão de assets
- Otimização de imagens
- Minificação de código

## 📝 Considerações Técnicas

### Performance

- Lazy loading de componentes
- Memoização de componentes pesados
- Otimização de re-renders
- Cache inteligente com React Query

### Acessibilidade

- Componentes Radix UI com acessibilidade nativa
- Labels apropriados em formulários
- Navegação por teclado
- Contraste adequado de cores

### Manutenibilidade

- Código modular e reutilizável
- Documentação inline
- Estrutura de pastas organizada
- Separação clara de responsabilidades

## 👥 Equipe de Desenvolvimento

Este projeto foi desenvolvido como parte do Tech Challenge da Pós-Tech Frontend Engineering, focando na criação de uma solução robusta e escalável para o gerenciamento de comunicações educacionais.

## 📄 Licença

Este projeto é desenvolvido para fins educacionais como parte do programa de Pós-Graduação em Full Stack Development.
