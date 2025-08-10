# Proposta de Estrutura de Pastas - Template Backend

**Autor:** Manus AI  
**Data:** 10 de Agosto de 2025  
**Versão:** 1.0

## Visão Geral

Esta proposta define a organização de pastas para o template-backend, seguindo princípios de Clean Architecture e Domain-Driven Design. A estrutura foi projetada para maximizar manutenibilidade, facilitar navegação e promover separação clara de responsabilidades.

## Estrutura Completa Proposta

```
template-default/
├── backend/                     # Nova pasta para backend
│   ├── src/                     # Código fonte principal
│   │   ├── app/                 # Configuração da aplicação
│   │   │   ├── app.module.ts    # Módulo raiz NestJS
│   │   │   ├── app.controller.ts # Health check controller
│   │   │   ├── app.service.ts   # Serviços globais
│   │   │   └── main.ts          # Entry point da aplicação
│   │   ├── shared/              # Recursos compartilhados
│   │   │   ├── common/          # Utilitários comuns
│   │   │   │   ├── decorators/  # Decorators customizados
│   │   │   │   │   ├── auth.decorator.ts
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   └── api-response.decorator.ts
│   │   │   │   ├── filters/     # Exception filters
│   │   │   │   │   ├── http-exception.filter.ts
│   │   │   │   │   ├── validation-exception.filter.ts
│   │   │   │   │   └── all-exceptions.filter.ts
│   │   │   │   ├── guards/      # Guards de autenticação
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   └── rate-limit.guard.ts
│   │   │   │   ├── interceptors/ # Interceptors globais
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   ├── transform.interceptor.ts
│   │   │   │   │   └── cache.interceptor.ts
│   │   │   │   ├── pipes/       # Pipes de validação
│   │   │   │   │   ├── validation.pipe.ts
│   │   │   │   │   ├── parse-int.pipe.ts
│   │   │   │   │   └── trim.pipe.ts
│   │   │   │   └── utils/       # Funções utilitárias
│   │   │   │       ├── crypto.util.ts
│   │   │   │       ├── date.util.ts
│   │   │   │       └── string.util.ts
│   │   │   ├── config/          # Configurações
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── auth.config.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   └── swagger.config.ts
│   │   │   ├── constants/       # Constantes globais
│   │   │   │   ├── app.constants.ts
│   │   │   │   ├── auth.constants.ts
│   │   │   │   └── error.constants.ts
│   │   │   ├── types/           # Tipos TypeScript globais
│   │   │   │   ├── common.types.ts
│   │   │   │   ├── auth.types.ts
│   │   │   │   └── api.types.ts
│   │   │   └── schemas/         # Schemas Zod compartilhados
│   │   │       ├── common.schema.ts
│   │   │       ├── auth.schema.ts
│   │   │       └── pagination.schema.ts
│   │   ├── modules/             # Módulos de domínio
│   │   │   ├── auth/            # Módulo de autenticação
│   │   │   │   ├── application/ # Casos de uso
│   │   │   │   │   ├── commands/ # Commands (write operations)
│   │   │   │   │   │   ├── login.command.ts
│   │   │   │   │   │   ├── register.command.ts
│   │   │   │   │   │   ├── refresh-token.command.ts
│   │   │   │   │   │   └── logout.command.ts
│   │   │   │   │   ├── queries/  # Queries (read operations)
│   │   │   │   │   │   ├── get-user-profile.query.ts
│   │   │   │   │   │   ├── validate-token.query.ts
│   │   │   │   │   │   └── get-user-permissions.query.ts
│   │   │   │   │   └── handlers/ # Event handlers
│   │   │   │   │       ├── user-registered.handler.ts
│   │   │   │   │       ├── login-attempt.handler.ts
│   │   │   │   │       └── password-reset.handler.ts
│   │   │   │   ├── domain/      # Lógica de domínio
│   │   │   │   │   ├── entities/ # Entities
│   │   │   │   │   │   ├── user.entity.ts
│   │   │   │   │   │   ├── role.entity.ts
│   │   │   │   │   │   └── permission.entity.ts
│   │   │   │   │   ├── value-objects/ # Value objects
│   │   │   │   │   │   ├── email.vo.ts
│   │   │   │   │   │   ├── password.vo.ts
│   │   │   │   │   │   └── user-id.vo.ts
│   │   │   │   │   ├── repositories/ # Repository interfaces
│   │   │   │   │   │   ├── user.repository.interface.ts
│   │   │   │   │   │   ├── role.repository.interface.ts
│   │   │   │   │   │   └── session.repository.interface.ts
│   │   │   │   │   ├── services/ # Domain services
│   │   │   │   │   │   ├── password-hashing.service.ts
│   │   │   │   │   │   ├── token.service.ts
│   │   │   │   │   │   └── permission.service.ts
│   │   │   │   │   └── events/  # Domain events
│   │   │   │   │       ├── user-registered.event.ts
│   │   │   │   │       ├── user-logged-in.event.ts
│   │   │   │   │       └── password-changed.event.ts
│   │   │   │   ├── infrastructure/ # Implementações técnicas
│   │   │   │   │   ├── repositories/ # Repository implementations
│   │   │   │   │   │   ├── prisma-user.repository.ts
│   │   │   │   │   │   ├── prisma-role.repository.ts
│   │   │   │   │   │   └── redis-session.repository.ts
│   │   │   │   │   ├── services/ # External services
│   │   │   │   │   │   ├── oauth2.service.ts
│   │   │   │   │   │   ├── email.service.ts
│   │   │   │   │   │   └── sms.service.ts
│   │   │   │   │   └── config/  # Module configuration
│   │   │   │   │       ├── jwt.config.ts
│   │   │   │   │       └── oauth.config.ts
│   │   │   │   ├── presentation/ # Controllers e DTOs
│   │   │   │   │   ├── controllers/ # HTTP controllers
│   │   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   │   ├── oauth.controller.ts
│   │   │   │   │   │   └── profile.controller.ts
│   │   │   │   │   ├── dto/     # Data transfer objects
│   │   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   │   │   └── user-profile.dto.ts
│   │   │   │   │   └── guards/  # Module-specific guards
│   │   │   │   │       ├── local-auth.guard.ts
│   │   │   │   │       └── oauth.guard.ts
│   │   │   │   └── auth.module.ts # Module definition
│   │   │   ├── users/           # Módulo de usuários
│   │   │   │   ├── application/
│   │   │   │   │   ├── commands/
│   │   │   │   │   │   ├── create-user.command.ts
│   │   │   │   │   │   ├── update-user.command.ts
│   │   │   │   │   │   └── delete-user.command.ts
│   │   │   │   │   ├── queries/
│   │   │   │   │   │   ├── get-user.query.ts
│   │   │   │   │   │   ├── list-users.query.ts
│   │   │   │   │   │   └── search-users.query.ts
│   │   │   │   │   └── handlers/
│   │   │   │   │       ├── user-created.handler.ts
│   │   │   │   │       └── user-updated.handler.ts
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── user-profile.entity.ts
│   │   │   │   │   ├── value-objects/
│   │   │   │   │   │   ├── full-name.vo.ts
│   │   │   │   │   │   └── phone-number.vo.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── user-profile.repository.interface.ts
│   │   │   │   │   └── events/
│   │   │   │   │       ├── user-profile-created.event.ts
│   │   │   │   │       └── user-profile-updated.event.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── prisma-user-profile.repository.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── avatar-upload.service.ts
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── users.controller.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-user.dto.ts
│   │   │   │   │       ├── update-user.dto.ts
│   │   │   │   │       └── user-response.dto.ts
│   │   │   │   └── users.module.ts
│   │   │   ├── comunicacoes/    # Módulo de comunicações
│   │   │   │   ├── application/
│   │   │   │   │   ├── commands/
│   │   │   │   │   │   ├── create-comunicacao.command.ts
│   │   │   │   │   │   ├── update-comunicacao.command.ts
│   │   │   │   │   │   └── delete-comunicacao.command.ts
│   │   │   │   │   ├── queries/
│   │   │   │   │   │   ├── get-comunicacao.query.ts
│   │   │   │   │   │   ├── list-comunicacoes.query.ts
│   │   │   │   │   │   └── search-comunicacoes.query.ts
│   │   │   │   │   └── handlers/
│   │   │   │   │       ├── comunicacao-created.handler.ts
│   │   │   │   │       └── comunicacao-updated.handler.ts
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── comunicacao.entity.ts
│   │   │   │   │   ├── value-objects/
│   │   │   │   │   │   ├── titulo.vo.ts
│   │   │   │   │   │   └── conteudo.vo.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── comunicacao.repository.interface.ts
│   │   │   │   │   └── events/
│   │   │   │   │       ├── comunicacao-created.event.ts
│   │   │   │   │       └── comunicacao-published.event.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── prisma-comunicacao.repository.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── notification.service.ts
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── comunicacoes.controller.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-comunicacao.dto.ts
│   │   │   │   │       ├── update-comunicacao.dto.ts
│   │   │   │   │       └── comunicacao-response.dto.ts
│   │   │   │   └── comunicacoes.module.ts
│   │   │   └── health/          # Módulo de health checks
│   │   │       ├── presentation/
│   │   │       │   └── controllers/
│   │   │       │       └── health.controller.ts
│   │   │       └── health.module.ts
│   │   └── database/            # Configuração de banco
│   │       ├── migrations/      # Prisma migrations
│   │       ├── seeds/           # Database seeds
│   │       │   ├── users.seed.ts
│   │       │   ├── roles.seed.ts
│   │       │   └── comunicacoes.seed.ts
│   │       └── schema.prisma    # Prisma schema
│   ├── test/                    # Testes
│   │   ├── unit/                # Testes unitários
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   └── comunicacoes/
│   │   ├── integration/         # Testes de integração
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   └── comunicacoes/
│   │   ├── e2e/                 # Testes end-to-end
│   │   │   ├── auth.e2e-spec.ts
│   │   │   ├── users.e2e-spec.ts
│   │   │   └── comunicacoes.e2e-spec.ts
│   │   └── fixtures/            # Dados de teste
│   │       ├── users.fixture.ts
│   │       └── comunicacoes.fixture.ts
│   ├── docs/                    # Documentação
│   │   ├── api/                 # Documentação de API
│   │   │   ├── openapi.yaml
│   │   │   └── postman-collection.json
│   │   ├── architecture/        # Documentação de arquitetura
│   │   │   ├── decisions/       # ADRs (Architecture Decision Records)
│   │   │   └── diagrams/        # Diagramas técnicos
│   │   └── deployment/          # Guias de deploy
│   │       ├── aws.md
│   │       ├── docker.md
│   │       └── local.md
│   ├── scripts/                 # Scripts utilitários
│   │   ├── build.sh
│   │   ├── deploy.sh
│   │   ├── seed-database.ts
│   │   └── generate-types.ts
│   ├── docker/                  # Configurações Docker
│   │   ├── Dockerfile.dev
│   │   ├── Dockerfile.prod
│   │   └── docker-compose.override.yml
│   ├── .github/                 # GitHub Actions
│   │   └── workflows/           # CI/CD workflows
│   │       ├── ci.yml
│   │       ├── cd.yml
│   │       ├── security-scan.yml
│   │       └── dependency-update.yml
│   ├── package.json             # Dependências e scripts
│   ├── tsconfig.json           # Configuração TypeScript
│   ├── nest-cli.json           # Configuração NestJS
│   ├── docker-compose.yml      # Docker Compose
│   ├── Dockerfile              # Container definition
│   ├── .env.example            # Exemplo de variáveis de ambiente
│   ├── .gitignore              # Arquivos ignorados
│   └── README.md               # Documentação principal
├── frontend/                    # Frontend existente (mantido)
├── .github/                     # GitHub Actions existente (mantido)
├── automation/                  # Scripts de automação existente (mantido)
├── docs-automation/             # Documentação de automação existente (mantido)
├── .gitignore                   # Atualizado para incluir backend
├── DOCUMENTATION_SYSTEM.md     # Documentação existente (mantido)
└── README.md                    # Atualizado para incluir backend
```

## Rationale das Decisões

### Separação Frontend/Backend

A criação de uma pasta `backend/` separada mantém clara separação entre frontend e backend, permitindo:
- Desenvolvimento independente de cada parte
- Pipelines de CI/CD específicos
- Versionamento independente
- Deploy separado quando necessário

### Organização por Domínio

Cada módulo (`auth`, `users`, `comunicacoes`) segue a mesma estrutura interna:
- **application/**: Casos de uso e orquestração
- **domain/**: Lógica de negócio pura
- **infrastructure/**: Implementações técnicas
- **presentation/**: Interface HTTP

Esta organização facilita:
- Navegação consistente entre módulos
- Manutenção por equipes especializadas
- Extração futura como microserviços
- Testes isolados por contexto

### Separação Commands/Queries

Dentro de `application/`, commands e queries são separados seguindo CQRS:
- **commands/**: Operações que modificam estado
- **queries/**: Operações que apenas leem dados
- **handlers/**: Processamento de eventos de domínio

### Shared Resources

A pasta `shared/` contém recursos utilizados por múltiplos módulos:
- **common/**: Utilitários técnicos (guards, interceptors, etc.)
- **config/**: Configurações globais
- **types/**: Tipos TypeScript compartilhados
- **schemas/**: Schemas Zod reutilizáveis

### Estrutura de Testes

Testes são organizados por tipo e espelham a estrutura de código:
- **unit/**: Testes de unidades isoladas
- **integration/**: Testes de integração entre componentes
- **e2e/**: Testes de fluxos completos
- **fixtures/**: Dados de teste reutilizáveis

### Documentação Estruturada

Documentação é organizada por audiência:
- **api/**: Para desenvolvedores frontend
- **architecture/**: Para desenvolvedores backend
- **deployment/**: Para DevOps e infraestrutura

## Benefícios da Estrutura Proposta

### Manutenibilidade

- Separação clara de responsabilidades
- Código organizado por contexto de negócio
- Dependências explícitas entre camadas
- Facilidade para localizar e modificar funcionalidades

### Escalabilidade

- Módulos independentes podem ser extraídos como microserviços
- Estrutura suporta crescimento de equipe
- Permite desenvolvimento paralelo de funcionalidades
- Facilita onboarding de novos desenvolvedores

### Testabilidade

- Cada camada pode ser testada isoladamente
- Mocks são facilitados pela inversão de dependências
- Estrutura de testes espelha estrutura de código
- Fixtures reutilizáveis reduzem duplicação

### Compatibilidade

- Mantém compatibilidade com frontend existente
- Aproveita infraestrutura de CI/CD atual
- Permite migração gradual de funcionalidades
- Suporta versionamento independente

## Migração e Implementação

### Fase 1: Estrutura Base
1. Criar pasta `backend/` com estrutura básica
2. Configurar NestJS com módulos principais
3. Setup de banco de dados com Prisma
4. Configuração básica de autenticação

### Fase 2: Módulos de Domínio
1. Implementar módulo de autenticação
2. Implementar módulo de usuários
3. Implementar módulo de comunicações
4. Configurar relacionamentos entre módulos

### Fase 3: Infraestrutura
1. Setup de observabilidade
2. Configuração de segurança
3. Implementação de cache
4. Setup de CI/CD

### Fase 4: Documentação e Testes
1. Documentação de API (OpenAPI)
2. Testes unitários e de integração
3. Testes end-to-end
4. Documentação técnica completa

Esta estrutura fornece base sólida para desenvolvimento de um backend robusto, mantendo flexibilidade para evolução futura e integração perfeita com o frontend existente.

