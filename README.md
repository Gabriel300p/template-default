# 🏗️ Template Default - Starter Genérico

# 🚀 Template Default

> **Template moderno full-stack** para desenvolvimento ágil de aplicações web

![License](https://img.shields.io/badge/license-MIT-green)
![Frontend](https://img.shields.io/badge/frontend-React_18.2-blue)
![Backend](https://img.shields.io/badge/backend-NestJS_10-red) 
![Database](https://img.shields.io/badge/database-PostgreSQL_16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tests](https://img.shields.io/badge/tests-36%2F36_passing-brightgreen)

---

## 📋 **Visão Geral**

Este template foi criado para **maximizar a produtividade** no desenvolvimento de aplicações modernas, oferecendo uma base sólida com as melhores práticas do mercado.

### 🎯 **Para quem é este template:**
- ✅ **Desenvolvedores** que querem um starter robusto
- ✅ **Equipes** que precisam de consistência e qualidade
- ✅ **Assistentes de IA** com documentação otimizada
- ✅ **Projetos** que exigem escalabilidade desde o início

## ✨ **Features Principais**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-green)](https://vitejs.dev)
[![TanStack](https://img.shields.io/badge/TanStack-Query%20%26%20Router-orange)](https://tanstack.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.0-purple)](https://framer.com/motion)

---

## 🎯 **Visão Geral**

Este template foi projetado para ser um **starter genérico e reutilizável** que pode ser usado por desenvolvedores humanos e assistentes de IA para criar aplicações modernas rapidamente.

### ✨ **Características Principais**

- 🏗️ **Arquitetura Feature-based** - Organização modular e escalável
- 🎨 **Sistema de Animações Completo** - Framer Motion com componentes reutilizáveis
- 🌐 **Internacionalização (i18n)** - PT-BR e EN-US com fallback automático
- 📝 **Records Genéricos** - CRUD completo adaptável para qualquer domínio
- 🎯 **TypeScript Strict** - Máxima confiabilidade e produtividade
- ⚡ **Performance Otimizada** - Lazy loading, code splitting, virtualization
- 🧪 **Testing Ready** - Vitest + Testing Library configurado
- 🚀 **CI/CD Completo** - GitHub Actions com deploy automatizado

---

## 🚀 **Quick Start**

### 📋 Pré-requisitos
- Node.js 18+ 
- npm ou pnpm
- Git

### 🔧 Instalação

```bash
# Clone o template
git clone https://github.com/Gabriel300p/template-default.git
cd template-default

# Frontend
cd frontend
npm install
npm run dev

# Backend (opcional)
cd ../backend  
npm install
npm run dev
```

### 🌐 Acesso
- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:3000 (se executado)

---

## 📁 **Estrutura do Projeto**

```
template-default/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── app/          # Configuração da aplicação
│   │   ├── features/     # Features organizadas por domínio
│   │   │   ├── records/  # Feature genérica de registros (CRUD)
│   │   │   └── comunicacoes/ # Feature legacy (será removida)
│   │   ├── shared/       # Componentes, hooks e utilitários compartilhados
│   │   │   ├── components/  # UI components
│   │   │   ├── lib/        # Utilitários e configurações
│   │   │   ├── hooks/      # Hooks customizados
│   │   │   └── animations/ # Sistema de animações
│   │   ├── routes/       # Roteamento com TanStack Router
│   │   └── i18n/         # Internacionalização
│   └── docs/             # Documentação específica do frontend
├── backend/              # NestJS + TypeScript (opcional)
├── docs/                 # Documentação geral consolidada
├── automation/           # Scripts de automação
└── docs-automation/      # Automação de documentação
```

---

## 🎨 **Funcionalidades Implementadas**

### 📝 **Records System**
Sistema genérico de CRUD adaptável para qualquer tipo de registro:
- ✅ Listagem com filtros avançados
- ✅ Criação/Edição com validação
- ✅ Deleção com confirmação
- ✅ Pesquisa em tempo real
- ✅ Paginação e ordenação
- ✅ Estados de loading com skeletons

### 🎬 **Animation System**
Sistema completo de animações baseado em Framer Motion:
- ✅ Componentes AnimatedBox, AnimatedList
- ✅ Variantes predefinidas (fadeIn, slideIn, scaleIn)
- ✅ Animações de tabela e modal
- ✅ Hook useInView para scroll-triggered animations
- ✅ Demo interativo em `/`

### 🗓️ **Modern Calendar**
Calendário redesenhado com UX moderna:
- ✅ Presets inteligentes (Hoje, Ontem, Últimos 7 dias)
- ✅ 3 variantes (default, compact, floating)
- ✅ Animações suaves e estados hover
- ✅ Modo single e range
- ✅ Auto-apply configurável

### 🌐 **Internationalization**
Sistema i18n completo:
- ✅ Suporte PT-BR e EN-US
- ✅ Fallback automático
- ✅ Strings externalizadas em features
- ✅ Zod error messages localizadas
- ✅ LanguageSwitcher integrado

---

## 🛠️ **Comandos Disponíveis**

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run test         # Executar testes
npm run test:ui      # Interface de testes
npm run type-check   # Verificação TypeScript
npm run lint         # ESLint
npm run format       # Prettier
```

### Backend
```bash
npm run start:dev    # Desenvolvimento
npm run build        # Build para produção
npm run test         # Executar testes
npm run test:e2e     # Testes E2E
```

---

## 📚 **Documentação**

A documentação está organizada de forma hierárquica para facilitar a navegação:

### 🎯 **Início Rápido**
- [README.md](README.md) - Visão geral e quickstart
- [Guia do Desenvolvedor](./docs/development/DEVELOPER_GUIDE.md) - Documentação técnica completa

### 🤖 **Para Assistentes de IA**
- [Guia de IA](./docs/ai-guides/AI_DEVELOPMENT_GUIDE.md) - Instruções específicas para assistentes de IA
- [Arquitetura do Sistema](./docs/architecture/SYSTEM_ARCHITECTURE.md) - Visão técnica detalhada

### 🏗️ **Arquitetura e Planejamento**
- [Arquitetura do Sistema](./docs/architecture/SYSTEM_ARCHITECTURE.md) - Documentação técnica completa
- [Contratos de API](./docs/architecture/api-contracts.md) - Especificações de API
- [Planejamento do Projeto](./docs/project-planning/) - Análises e roadmaps

### 💻 **Frontend**
- [Sistema de Animações](./docs/frontend/animations/) - Documentação das animações
- [Estratégias de Otimização](./docs/frontend/optimization/) - Performance e otimizações
- [Features Específicas](./docs/frontend/features/) - Documentação de funcionalidades
- [Testes](./docs/frontend/testing/) - Estratégias e relatórios de teste
- [CI/CD](./docs/frontend/ci-cd/) - Configurações de integração contínua

### ⚙️ **Backend**
- [Documentação do Backend](./backend/README.md) - Guia específico do backend
- [API Documentation](./backend/docs/api/) - Documentação das APIs
- [Arquitetura Backend](./backend/docs/architecture/) - Estrutura do backend

### 📋 **Features e Funcionalidades**
- [Records Feature](./docs/features/RECORDS_FEATURE.md) - Sistema principal de registros
- [Sistema de Documentação](./docs/system/documentation-system.md) - Como usar a documentação

---

## 🤖 **Para Assistentes de IA**

Este template foi especialmente preparado para ser usado por assistentes de IA:

### ✅ **Pontos Fortes**
- Estrutura clara e consistente
- Documentação abrangente
- Padrões bem definidos
- Tipos TypeScript rigorosos
- Exemplos práticos abundantes

### 🎯 **Como Usar**
1. **Analise** a estrutura em `/docs/ai-guides/`
2. **Entenda** os padrões em `/docs/development/`
3. **Explore** as features em `/docs/features/`
4. **Adapte** os componentes genéricos para casos específicos
5. **Teste** sempre com `npm run type-check` e `npm test`

---

## 🤝 **Contribuição**

### 🔄 **Workflow**
1. Fork o projeto
2. Crie uma branch feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### 📝 **Padrões**
- Commits seguem [Conventional Commits](https://conventionalcommits.org)
- PRs devem passar em todos os testes
- Documentação deve ser atualizada quando necessário

---

## 📄 **Licença**

MIT License - veja [LICENSE](./LICENSE) para detalhes.

---

## 🎉 **Status do Projeto**

- ✅ **Frontend Base** - Completo e funcional
- ✅ **Records System** - Implementado e testado
- ✅ **Animation System** - Completo com demo
- ✅ **Modern Calendar** - Redesignado e integrado
- ✅ **Internationalization** - PT-BR e EN-US funcionais
- ✅ **Documentation** - Reorganizada e atualizada
- 🔄 **Backend Integration** - Em desenvolvimento
- 📋 **Feature Extensions** - Roadmap definido

---

<div align="center">
  <p><strong>Criado com ❤️ para a comunidade de desenvolvimento</strong></p>
  <p><em>Template genérico, reutilizável e otimizado para humanos e IA</em></p>
</div>
