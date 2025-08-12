# 🚀 Guia Completo do Template Backend NestJS

## 📋 Resumo Executivo

Este template fornece uma base sólida e completa para aplicações backend usando NestJS com arquitetura limpa, autenticação robusta, sistema de usuários e comunicações. Foi desenvolvido seguindo as melhores práticas da indústria e está pronto para uso em produção.

## ✅ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação Completo
- **JWT Authentication** com access e refresh tokens
- **OAuth2 Integration** (Google, GitHub, Microsoft)
- **Password Security** com bcrypt e validação robusta
- **Session Management** com controle de sessões ativas
- **Password Reset** com tokens seguros
- **Email Verification** para novos usuários

### 👥 Gestão Avançada de Usuários
- **CRUD Completo** com validações
- **Sistema de Roles** (ADMIN, MODERATOR, USER)
- **Perfis de Usuário** com informações detalhadas
- **Suspensão/Ativação** de contas
- **Busca e Filtros** avançados
- **Estatísticas** de usuários

### 📧 Sistema de Comunicações Robusto
- **Email Service** com templates HTML
- **Notificações In-App** com tipos e prioridades
- **Sistema de Templates** com variáveis dinâmicas
- **Múltiplos Canais** (Email, SMS, Push - extensível)
- **Agendamento** de comunicações
- **Retry Logic** para falhas
- **Estatísticas** de entrega

### 🏗️ Arquitetura e Estrutura
- **Clean Architecture** com separação clara de responsabilidades
- **Domain-Driven Design** com módulos bem definidos
- **Repository Pattern** para acesso a dados
- **Service Layer** para lógica de negócio
- **DTO Pattern** para validação de dados
- **Dependency Injection** nativo do NestJS

### 🛡️ Segurança e Qualidade
- **Rate Limiting** configurado
- **CORS** habilitado
- **Helmet** para headers de segurança
- **Input Validation** rigorosa
- **Error Handling** centralizado
- **Logging** estruturado
- **Health Checks** implementados

## 📁 Estrutura Detalhada do Projeto

```
src/
├── app/                           # Configuração principal
│   ├── app.module.ts             # Módulo raiz
│   └── app.controller.ts         # Controller principal
├── modules/                       # Módulos de funcionalidades
│   ├── auth/                     # 🔐 Autenticação
│   │   ├── application/          # Serviços e casos de uso
│   │   │   └── services/         # AuthService, TokenService, etc.
│   │   ├── infrastructure/       # Repositories e providers
│   │   │   ├── repositories/     # AuthRepository, SessionRepository
│   │   │   └── strategies/       # JWT, Local, OAuth strategies
│   │   └── presentation/         # Controllers e DTOs
│   │       ├── controllers/      # AuthController, OAuthController
│   │       ├── dto/              # Login, Register, etc.
│   │       └── guards/           # JwtAuthGuard, LocalAuthGuard
│   ├── users/                    # 👥 Usuários
│   │   ├── application/          # UsersService, UserRoleService
│   │   ├── infrastructure/       # UsersRepository, UserRoleRepository
│   │   └── presentation/         # UsersController, UserProfileController
│   ├── comunicacoes/             # 📧 Comunicações
│   │   ├── application/          # CommunicationService, EmailService
│   │   ├── infrastructure/       # CommunicationRepository, EmailProvider
│   │   └── presentation/         # CommunicationController, NotificationController
│   └── health/                   # ❤️ Health Checks
├── shared/                       # Recursos compartilhados
│   ├── common/                   # Utilitários comuns
│   │   ├── decorators/           # CurrentUser, Permissions, Roles
│   │   ├── filters/              # Exception filters
│   │   ├── guards/               # Guards globais
│   │   ├── interceptors/         # Logging, Transform
│   │   ├── pipes/                # Validation pipes
│   │   └── utils/                # Crypto, Date, String utils
│   ├── config/                   # Configurações
│   │   ├── app.config.ts         # Configuração da app
│   │   ├── auth.config.ts        # Configuração de auth
│   │   └── database.config.ts    # Configuração do DB
│   ├── constants/                # Constantes globais
│   └── database/                 # Configuração do Prisma
│       ├── prisma.service.ts     # Serviço do Prisma
│       └── prisma.module.ts      # Módulo do Prisma
├── prisma/                       # Schema e migrações
│   ├── schema.prisma             # Schema do banco
│   └── migrations/               # Migrações
├── scripts/                      # Scripts utilitários
│   └── seed-database.ts          # Seed inicial
└── main.ts                       # Ponto de entrada
```

## 🗄️ Schema do Banco de Dados

### Entidades Principais

#### User
- **Campos**: id, email, name, password, phone, avatar, isActive, isEmailVerified
- **Relacionamentos**: roles, sessions, notifications, communications

#### Role
- **Campos**: id, name, description, permissions, isActive
- **Relacionamentos**: users (many-to-many)

#### Session
- **Campos**: id, userId, refreshToken, expiresAt, ipAddress, userAgent
- **Relacionamentos**: user

#### Communication
- **Campos**: id, type, status, priority, userId, email, phone, subject, content
- **Relacionamentos**: user, template

#### Notification
- **Campos**: id, type, priority, userId, title, message, isRead, actionUrl
- **Relacionamentos**: user

#### CommunicationTemplate
- **Campos**: id, name, type, subject, content, variables, isActive
- **Relacionamentos**: communications

## 🔧 Configuração e Uso

### 1. Variáveis de Ambiente Essenciais

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_REFRESH_EXPIRES_IN="7d"

# OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourapp.com"

# Redis (opcional)
REDIS_HOST="localhost"
REDIS_PORT=6379

# App
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 2. Comandos de Inicialização

```bash
# 1. Instalar dependências
npm install

# 2. Gerar cliente Prisma
npx prisma generate

# 3. Executar migrações
npx prisma migrate dev

# 4. Seed inicial (opcional)
npm run seed

# 5. Iniciar aplicação
npm run start:dev
```

### 3. Endpoints Principais

#### Autenticação
```
POST /auth/register          # Registro de usuário
POST /auth/login             # Login
POST /auth/refresh           # Refresh token
POST /auth/logout            # Logout
POST /auth/change-password   # Alterar senha
POST /auth/forgot-password   # Esqueci a senha
POST /auth/reset-password    # Reset de senha
GET  /auth/me                # Perfil do usuário
GET  /auth/oauth/google      # OAuth Google
GET  /auth/oauth/github      # OAuth GitHub
```

#### Usuários
```
GET    /users                # Listar usuários
POST   /users                # Criar usuário
GET    /users/:id            # Buscar usuário
PATCH  /users/:id            # Atualizar usuário
DELETE /users/:id            # Deletar usuário
GET    /users/stats          # Estatísticas
POST   /users/:id/roles      # Atribuir role
```

#### Comunicações
```
GET    /communications       # Listar comunicações
POST   /communications       # Criar comunicação
GET    /communications/:id   # Buscar comunicação
POST   /communications/:id/retry  # Reenviar
GET    /communications/stats # Estatísticas

POST   /communications/templates     # Criar template
GET    /communications/templates     # Listar templates
POST   /communications/templates/send # Enviar por template
```

#### Notificações
```
GET    /notifications        # Minhas notificações
POST   /notifications        # Criar notificação
PATCH  /notifications/:id/read    # Marcar como lida
PATCH  /notifications/mark-all-read # Marcar todas como lidas
DELETE /notifications/:id    # Deletar notificação
```

## 🧪 Testes

### Estrutura de Testes
```
test/
├── unit/                    # Testes unitários
├── integration/             # Testes de integração
└── e2e/                    # Testes end-to-end
```

### Comandos de Teste
```bash
npm test                     # Todos os testes
npm run test:watch          # Testes em watch mode
npm run test:cov            # Cobertura de testes
npm run test:e2e            # Testes E2E
```

### Exemplo de Teste
```typescript
describe('AuthService', () => {
  it('should register user successfully', async () => {
    const result = await authService.register({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User'
    });
    
    expect(result.user.email).toBe('test@example.com');
    expect(result.tokens.accessToken).toBeDefined();
  });
});
```

## 🚀 Deploy

### Docker
```bash
# Build
docker build -t my-backend .

# Run
docker run -p 3000:3000 --env-file .env my-backend
```

### Docker Compose
```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d
```

### Plataformas Cloud
- **AWS**: ECS, EKS, Elastic Beanstalk
- **Heroku**: Pronto para deploy
- **DigitalOcean**: App Platform
- **Railway**: Deploy automático
- **Vercel**: Serverless functions

## 🔄 Extensibilidade

### Adicionando Novos Módulos
1. Criar estrutura de pastas seguindo o padrão
2. Implementar services, repositories, controllers
3. Adicionar ao app.module.ts
4. Criar testes

### Adicionando Novos Providers OAuth
1. Instalar strategy do Passport
2. Criar strategy em `auth/infrastructure/strategies/`
3. Adicionar guard correspondente
4. Configurar no AuthModule

### Adicionando Novos Canais de Comunicação
1. Criar provider em `comunicacoes/infrastructure/providers/`
2. Adicionar tipo no enum CommunicationType
3. Implementar lógica no CommunicationService
4. Atualizar templates se necessário

## 📊 Monitoramento e Logs

### Health Checks
- **Endpoint**: `/health`
- **Verifica**: Database, Redis, External APIs
- **Formato**: JSON com status detalhado

### Logs Estruturados
- **Formato**: JSON
- **Níveis**: error, warn, info, debug
- **Contexto**: requestId, userId, module

### Métricas
- **Performance**: Response time, throughput
- **Business**: User registrations, emails sent
- **Technical**: Database connections, memory usage

## 🛡️ Segurança

### Implementações de Segurança
- **Rate Limiting**: 100 req/min por IP
- **CORS**: Configurado para frontend
- **Helmet**: Headers de segurança
- **Input Validation**: Todos os endpoints
- **SQL Injection**: Prevenido pelo Prisma
- **XSS**: Sanitização de inputs
- **CSRF**: Tokens CSRF em forms

### Boas Práticas
- Senhas hasheadas com bcrypt (12 rounds)
- JWT com expiração curta (15min)
- Refresh tokens com rotação
- Logs de auditoria para ações sensíveis
- Validação rigorosa de permissões

## 🎯 Próximos Passos

### Funcionalidades Sugeridas
- [ ] Sistema de cache avançado (Redis)
- [ ] Upload de arquivos (AWS S3)
- [ ] Sistema de logs estruturado (ELK Stack)
- [ ] Métricas e monitoramento (Prometheus)
- [ ] Testes automatizados (CI/CD)
- [ ] Documentação interativa (Storybook)
- [ ] Websockets para real-time
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Event sourcing

### Melhorias de Performance
- [ ] Database indexing otimizado
- [ ] Query optimization
- [ ] Caching strategies
- [ ] CDN integration
- [ ] Load balancing
- [ ] Database sharding

## 📞 Suporte e Contribuição

### Documentação
- **API Docs**: `/api` (Swagger)
- **Code Docs**: Comentários inline
- **Architecture**: Diagramas em `/docs`

### Contribuição
1. Fork o repositório
2. Crie branch para feature
3. Implemente com testes
4. Submeta Pull Request
5. Code review

### Suporte
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Wiki**: Documentação detalhada

---

**🎉 Template pronto para uso em produção!**

Este template foi desenvolvido seguindo as melhores práticas da indústria e está pronto para ser usado como base para aplicações backend robustas e escaláveis.

