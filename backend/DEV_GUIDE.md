# Guia de Desenvolvimento - Template Backend

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
6. [Autenticação e Autorização](#autenticação-e-autorização)
7. [Banco de Dados](#banco-de-dados)
8. [Testes](#testes)
9. [Deploy](#deploy)
10. [Troubleshooting](#troubleshooting)

## Visão Geral

Este template backend foi desenvolvido seguindo as melhores práticas de desenvolvimento moderno, implementando Clean Architecture, Domain-Driven Design (DDD) e princípios SOLID. O projeto utiliza NestJS como framework principal, Prisma como ORM, PostgreSQL como banco de dados e Redis para cache.

### Características Principais

- **Arquitetura Limpa**: Separação clara entre camadas de domínio, aplicação, infraestrutura e apresentação
- **Segurança Robusta**: Autenticação JWT, OAuth2, rate limiting, validação rigorosa
- **Observabilidade**: Logs estruturados, métricas, health checks, tracing de requisições
- **Qualidade de Código**: ESLint, Prettier, testes automatizados com 80%+ de cobertura
- **CI/CD**: Pipeline completo com GitHub Actions
- **Documentação**: OpenAPI/Swagger automático, documentação técnica completa

## Arquitetura

### Clean Architecture

O projeto segue os princípios da Clean Architecture, organizando o código em camadas bem definidas:

```
src/
├── app/                    # Configuração da aplicação
├── shared/                 # Recursos compartilhados
│   ├── common/            # Guards, filters, interceptors, pipes
│   ├── config/            # Configurações da aplicação
│   ├── constants/         # Constantes globais
│   ├── schemas/           # Schemas Zod compartilhados
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilitários
├── modules/               # Módulos de domínio
│   ├── auth/              # Autenticação e autorização
│   ├── users/             # Gestão de usuários
│   ├── comunicacoes/      # Comunicações
│   └── health/            # Health checks
└── database/              # Configuração do banco
    ├── migrations/        # Migrações Prisma
    └── seeds/             # Seeds de dados
```

### Camadas da Arquitetura

#### 1. Camada de Apresentação (Presentation Layer)
- **Controllers**: Recebem requisições HTTP e delegam para a camada de aplicação
- **DTOs**: Objetos de transferência de dados para entrada e saída
- **Validators**: Validação de entrada usando Zod schemas

#### 2. Camada de Aplicação (Application Layer)
- **Services**: Lógica de aplicação e orquestração
- **Use Cases**: Casos de uso específicos do negócio
- **Interfaces**: Contratos para a camada de infraestrutura

#### 3. Camada de Domínio (Domain Layer)
- **Entities**: Entidades de negócio
- **Value Objects**: Objetos de valor
- **Domain Services**: Serviços de domínio
- **Repositories**: Interfaces para persistência

#### 4. Camada de Infraestrutura (Infrastructure Layer)
- **Database**: Implementação de repositórios
- **External Services**: Integração com APIs externas
- **Configuration**: Configurações de infraestrutura

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- Redis 6+ (opcional)
- Docker e Docker Compose (recomendado)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd template-default/backend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Configure o banco de dados**
   ```bash
   # Gere o cliente Prisma
   npm run db:generate
   
   # Execute as migrações
   npm run db:migrate
   
   # (Opcional) Execute os seeds
   npm run db:seed
   ```

5. **Inicie a aplicação**
   ```bash
   # Desenvolvimento
   npm run start:dev
   
   # Debug
   npm run start:debug
   
   # Produção
   npm run build
   npm run start:prod
   ```

### Docker (Recomendado)

```bash
# Inicie todos os serviços
docker-compose up -d

# Execute as migrações
docker-compose exec backend npm run db:migrate

# Visualize os logs
docker-compose logs -f backend
```

## Estrutura do Projeto

### Módulos

Cada módulo segue a estrutura padrão do NestJS com algumas adaptações para Clean Architecture:

```
modules/auth/
├── application/
│   ├── services/          # Serviços de aplicação
│   └── interfaces/        # Interfaces
├── domain/
│   ├── entities/          # Entidades de domínio
│   └── repositories/      # Interfaces de repositório
├── infrastructure/
│   ├── repositories/      # Implementação de repositórios
│   └── strategies/        # Estratégias Passport
└── presentation/
    ├── controllers/       # Controllers HTTP
    └── dto/              # DTOs de entrada/saída
```

### Shared

O diretório `shared` contém recursos utilizados por múltiplos módulos:

- **Common**: Guards, filters, interceptors, pipes, decorators
- **Config**: Configurações da aplicação organizadas por contexto
- **Constants**: Constantes globais da aplicação
- **Schemas**: Schemas Zod compartilhados entre frontend e backend
- **Types**: Tipos TypeScript globais
- **Utils**: Utilitários para criptografia, datas, strings, etc.

## Padrões de Desenvolvimento

### Nomenclatura

- **Arquivos**: kebab-case (`user.service.ts`, `auth.controller.ts`)
- **Classes**: PascalCase (`UserService`, `AuthController`)
- **Métodos e Variáveis**: camelCase (`findUser`, `isAuthenticated`)
- **Constantes**: UPPER_SNAKE_CASE (`JWT_SECRET`, `DEFAULT_PAGE_SIZE`)
- **Interfaces**: PascalCase com prefixo I (`IUserRepository`)

### Estrutura de Arquivos

```typescript
// user.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async findById(id: string): Promise<User> {
    // Implementação
  }
}
```

### Tratamento de Erros

```typescript
// Sempre use exceções específicas do NestJS
throw new NotFoundException('Usuário não encontrado');
throw new BadRequestException('Dados inválidos');
throw new UnauthorizedException('Token inválido');

// Para erros de negócio, crie exceções customizadas
export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(`Usuário com email ${email} já existe`);
  }
}
```

### Validação

Use schemas Zod para validação consistente:

```typescript
// auth.schema.ts
export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional().default(false),
});

// auth.controller.ts
@Post('login')
@UsePipes(createZodPipe(LoginRequestSchema))
async login(@Body() loginDto: LoginRequest) {
  return this.authService.login(loginDto);
}
```

### Logging

Use o logger estruturado para todas as operações importantes:

```typescript
this.logger.log('User created successfully', {
  userId: user.id,
  email: user.email,
  requestId: request.requestId,
});

this.logger.error('Failed to create user', {
  error: error.message,
  email: createUserDto.email,
  requestId: request.requestId,
});
```

## Autenticação e Autorização

### JWT Authentication

O sistema utiliza JWT para autenticação com refresh tokens:

```typescript
// Proteger rotas
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

// Rotas públicas
@Public()
@Get('public')
getPublicData() {
  return { message: 'Dados públicos' };
}
```

### Autorização por Roles

```typescript
// Controle por roles
@Roles(Role.ADMIN, Role.MODERATOR)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('admin')
getAdminData() {
  return { message: 'Dados administrativos' };
}

// Controle por permissions
@RequirePermissions(Permission.READ_USERS)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('users')
getUsers() {
  return this.usersService.findAll();
}
```

### OAuth2

O sistema suporta OAuth2 com Google, GitHub e Microsoft:

```typescript
// Configuração no .env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/oauth/google/callback
```

## Banco de Dados

### Prisma ORM

O projeto utiliza Prisma como ORM principal:

```typescript
// Definição de modelo
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  nome          String
  senha         String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relacionamentos
  roles         UserRole[]
  comunicacoes  Comunicacao[]

  @@map("users")
}
```

### Migrações

```bash
# Criar nova migração
npx prisma migrate dev --name add_user_table

# Aplicar migrações em produção
npx prisma migrate deploy

# Reset do banco (desenvolvimento)
npx prisma migrate reset
```

### Seeds

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      nome: 'Administrator',
      emailVerified: true,
    },
  });

  console.log('Seed completed:', { admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Testes

### Estrutura de Testes

```
test/
├── setup.ts              # Configuração global
├── setup-e2e.ts          # Configuração E2E
├── health.e2e-spec.ts    # Testes E2E
└── jest-e2e.json         # Configuração Jest E2E

src/
└── **/*.spec.ts          # Testes unitários
```

### Testes Unitários

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  it('should find user by id', async () => {
    const user = createMockUser();
    repository.findById.mockResolvedValue(user);

    const result = await service.findById(user.id);

    expect(result).toEqual(user);
    expect(repository.findById).toHaveBeenCalledWith(user.id);
  });
});
```

### Testes E2E

```typescript
// auth.e2e-spec.ts
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp(AppModule);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });
});
```

### Executar Testes

```bash
# Testes unitários
npm test

# Testes com watch
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e

# Todos os testes
npm run test:all
```

## Deploy

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
USER nestjs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### AWS Deployment

1. **Build da imagem**
   ```bash
   docker build -t template-backend .
   docker tag template-backend:latest your-registry/template-backend:latest
   docker push your-registry/template-backend:latest
   ```

2. **Configuração de variáveis**
   - DATABASE_URL (RDS PostgreSQL)
   - REDIS_URL (ElastiCache)
   - JWT_SECRET
   - OAuth credentials

3. **Deploy usando ECS/EKS**
   ```yaml
   # task-definition.json
   {
     "family": "template-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "your-registry/template-backend:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ]
       }
     ]
   }
   ```

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps

# Verificar logs do banco
docker-compose logs postgres

# Testar conexão
npx prisma db pull
```

#### 2. Erro de Migração

```bash
# Reset das migrações (desenvolvimento)
npx prisma migrate reset

# Forçar aplicação de migração
npx prisma db push
```

#### 3. Problemas de Autenticação

```bash
# Verificar configuração JWT
echo $JWT_SECRET

# Testar endpoint de login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

#### 4. Problemas de Performance

```bash
# Verificar logs da aplicação
docker-compose logs -f backend

# Monitorar métricas
curl http://localhost:3000/api/v1/health/detailed
```

### Logs e Debugging

```bash
# Logs estruturados em desenvolvimento
npm run start:debug

# Logs em produção
docker-compose logs -f backend | jq '.'

# Debug com breakpoints
npm run test:debug
```

### Monitoramento

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Métricas detalhadas
curl http://localhost:3000/api/v1/health/detailed

# Status dos serviços
docker-compose ps
```

---

**Autor**: Manus AI  
**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025

