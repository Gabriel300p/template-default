# NestJS Backend Template

Template completo e robusto para aplicações backend usando NestJS com arquitetura limpa, autenticação JWT/OAuth, sistema de usuários, comunicações e muito mais.

## 🚀 Características

### 🏗️ Arquitetura
- **Arquitetura Limpa** - Separação clara entre camadas (Presentation, Application, Infrastructure)
- **Modular** - Estrutura modular bem organizada
- **Escalável** - Preparado para crescer com sua aplicação
- **Testável** - Estrutura que facilita testes unitários e de integração

### 🔐 Autenticação & Autorização
- **JWT Authentication** - Tokens seguros com refresh tokens
- **OAuth2 Integration** - Google, GitHub, Microsoft
- **Role-Based Access Control (RBAC)** - Sistema completo de roles e permissões
- **Session Management** - Controle de sessões ativas
- **Password Security** - Hash seguro com bcrypt e validação robusta

### 👥 Gestão de Usuários
- **CRUD Completo** - Criação, leitura, atualização e exclusão
- **Perfis de Usuário** - Gestão completa de perfis
- **Sistema de Roles** - Atribuição e gestão de papéis
- **Suspensão/Ativação** - Controle de status de usuários
- **Verificação de Email** - Sistema de verificação

### 📧 Sistema de Comunicações
- **Email Service** - Envio de emails com templates
- **Notificações** - Sistema completo de notificações in-app
- **Templates** - Sistema de templates para comunicações
- **Múltiplos Canais** - Email, SMS, Push (extensível)

### 🛠️ Recursos Técnicos
- **Observabilidade**: Logs estruturados, métricas e health checks
- **Segurança**: Rate limiting, CORS, helmet, validação de entrada
- **Documentação**: OpenAPI/Swagger automático
- **Containerização**: Docker pronto para produção

## 🛠️ Stack Tecnológica

- **Framework**: NestJS 10
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Autenticação**: JWT + Passport
- **Validação**: Zod + class-validator
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest
- **Logs**: Winston
- **Containerização**: Docker

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- Redis 6+ (opcional, para cache)
- Docker e Docker Compose (opcional)

## 🚀 Instalação e Execução

### Desenvolvimento Local

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

1. **Inicie todos os serviços**
   ```bash
   docker-compose up -d
   ```

2. **Execute as migrações**
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

3. **Acesse a aplicação**
   - API: http://localhost:3000
   - Documentação: http://localhost:3000/api/docs
   - Adminer: http://localhost:8080
   - Redis Commander: http://localhost:8081

## 📚 Documentação da API

A documentação completa da API está disponível em:
- **Desenvolvimento**: http://localhost:3000/api/docs
- **Especificação OpenAPI**: [openapi.yaml](../openapi.yaml)

### Endpoints Principais

- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `GET /api/v1/users` - Listar usuários
- `GET /api/v1/comunicacoes` - Listar comunicações

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com watch
npm run test:watch

# Testes de cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Configuração da aplicação
├── shared/                 # Recursos compartilhados
│   ├── common/            # Utilitários (guards, filters, etc.)
│   ├── config/            # Configurações
│   ├── constants/         # Constantes
│   ├── types/             # Tipos TypeScript
│   └── schemas/           # Schemas Zod
├── modules/               # Módulos de domínio
│   ├── auth/              # Autenticação
│   ├── users/             # Usuários
│   ├── comunicacoes/      # Comunicações
│   └── health/            # Health checks
└── database/              # Configuração do banco
    ├── migrations/        # Migrações Prisma
    └── seeds/             # Seeds de dados
```

## 🔧 Scripts Disponíveis

- `npm run build` - Build da aplicação
- `npm run start` - Inicia a aplicação
- `npm run start:dev` - Desenvolvimento com watch
- `npm run start:debug` - Debug mode
- `npm run lint` - Linting
- `npm run test` - Testes
- `npm run db:generate` - Gera cliente Prisma
- `npm run db:migrate` - Executa migrações
- `npm run db:seed` - Executa seeds

## 🔒 Segurança

- Rate limiting configurado
- CORS habilitado
- Helmet para headers de segurança
- Validação rigorosa de entrada
- JWT com refresh tokens
- Senhas hasheadas com bcrypt
- Logs de auditoria

## 📊 Monitoramento

- Health checks em `/api/v1/health`
- Logs estruturados em JSON
- Métricas de performance
- Request tracking com IDs únicos

## 🚀 Deploy

### AWS (Recomendado)

1. **Build da imagem Docker**
   ```bash
   docker build -t template-backend .
   ```

2. **Configure as variáveis de ambiente**
   - DATABASE_URL (RDS PostgreSQL)
   - REDIS_URL (ElastiCache)
   - JWT_SECRET
   - OAuth credentials

3. **Deploy usando ECS, EKS ou Elastic Beanstalk**

### Outras Plataformas

- **Heroku**: Pronto para deploy
- **Railway**: Suporte nativo
- **DigitalOcean**: App Platform
- **Vercel**: Serverless functions

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs da aplicação

