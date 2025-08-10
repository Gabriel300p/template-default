# Guia de Contribuição

Obrigado por considerar contribuir para o Template Backend! Este documento fornece diretrizes e informações para ajudar você a contribuir de forma efetiva.

## Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Contribuir](#como-contribuir)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
5. [Processo de Pull Request](#processo-de-pull-request)
6. [Reportar Bugs](#reportar-bugs)
7. [Sugerir Melhorias](#sugerir-melhorias)
8. [Documentação](#documentação)

## Código de Conduta

Este projeto adere ao [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Ao participar, você deve seguir este código. Reporte comportamentos inaceitáveis para [maintainers@template-backend.com].

### Nossos Compromissos

- Manter um ambiente acolhedor e inclusivo
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas com elegância
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

## Como Contribuir

Existem várias maneiras de contribuir para este projeto:

### 🐛 Reportar Bugs
- Use o template de issue para bugs
- Inclua informações detalhadas sobre o problema
- Forneça passos para reproduzir o bug
- Inclua logs e screenshots quando relevante

### 💡 Sugerir Melhorias
- Use o template de issue para feature requests
- Descreva claramente a funcionalidade desejada
- Explique por que seria útil para o projeto
- Considere implementações alternativas

### 🔧 Contribuir com Código
- Fork o repositório
- Crie uma branch para sua feature/fix
- Implemente suas mudanças
- Adicione testes apropriados
- Submeta um pull request

### 📚 Melhorar Documentação
- Corrija erros de digitação
- Melhore explicações existentes
- Adicione exemplos práticos
- Traduza documentação

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- Redis 6+ (opcional)
- Docker e Docker Compose
- Git

### Setup Inicial

1. **Fork e Clone**
   ```bash
   git clone https://github.com/seu-usuario/template-default.git
   cd template-default/backend
   ```

2. **Instalar Dependências**
   ```bash
   npm install
   ```

3. **Configurar Ambiente**
   ```bash
   cp .env.example .env
   # Edite as variáveis conforme necessário
   ```

4. **Configurar Banco de Dados**
   ```bash
   docker-compose up -d postgres redis
   npm run db:migrate
   npm run db:seed
   ```

5. **Executar Testes**
   ```bash
   npm test
   npm run test:e2e
   ```

6. **Iniciar Aplicação**
   ```bash
   npm run start:dev
   ```

### Verificação do Setup

Acesse http://localhost:3000/api/docs para verificar se a aplicação está funcionando corretamente.

## Padrões de Desenvolvimento

### Estrutura de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para padronizar mensagens de commit:

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

#### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Mudanças que não afetam o significado do código
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição ou correção de testes
- `chore`: Mudanças em ferramentas e configurações

#### Exemplos

```bash
feat(auth): adicionar autenticação OAuth2 com Google
fix(users): corrigir validação de email duplicado
docs(readme): atualizar instruções de instalação
test(auth): adicionar testes para login JWT
```

### Padrões de Código

#### TypeScript

```typescript
// ✅ Bom
interface CreateUserRequest {
  email: string;
  nome: string;
  senha: string;
}

class UserService {
  private readonly logger = new Logger(UserService.name);

  async createUser(data: CreateUserRequest): Promise<User> {
    // Implementação
  }
}

// ❌ Evitar
class userService {
  createUser(data: any): any {
    // Implementação
  }
}
```

#### Nomenclatura

- **Arquivos**: kebab-case (`user.service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Métodos**: camelCase (`createUser`)
- **Constantes**: UPPER_SNAKE_CASE (`JWT_SECRET`)
- **Interfaces**: PascalCase (`CreateUserRequest`)

#### Estrutura de Arquivos

```typescript
// user.service.ts
import { Injectable, Logger } from '@nestjs/common';
import type { CreateUserRequest, User } from './types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(data: CreateUserRequest): Promise<User> {
    this.logger.log('Creating new user', { email: data.email });
    
    try {
      const user = await this.userRepository.create(data);
      
      this.logger.log('User created successfully', { 
        userId: user.id,
        email: user.email 
      });
      
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', {
        error: error.message,
        email: data.email,
      });
      
      throw error;
    }
  }
}
```

### Testes

#### Testes Unitários

```typescript
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
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createUserData = {
        email: 'test@example.com',
        nome: 'Test User',
        senha: 'hashedPassword',
      };
      const expectedUser = { id: '1', ...createUserData };
      repository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await service.createUser(createUserData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(repository.create).toHaveBeenCalledWith(createUserData);
    });

    it('should throw error when creation fails', async () => {
      // Arrange
      const createUserData = {
        email: 'test@example.com',
        nome: 'Test User',
        senha: 'hashedPassword',
      };
      repository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.createUser(createUserData)).rejects.toThrow('Database error');
    });
  });
});
```

#### Testes E2E

```typescript
describe('Users (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    app = await createTestApp(AppModule);
    token = await authenticateUser(app);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newuser@example.com',
          nome: 'New User',
          senha: 'NewPassword123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('newuser@example.com');
          expect(res.body).not.toHaveProperty('senha');
        });
    });
  });
});
```

### Cobertura de Testes

Mantemos uma cobertura mínima de 80% para:
- Statements
- Branches
- Functions
- Lines

```bash
# Verificar cobertura
npm run test:cov

# Cobertura E2E
npm run test:e2e:cov
```

## Processo de Pull Request

### Antes de Submeter

1. **Verifique se sua branch está atualizada**
   ```bash
   git checkout main
   git pull origin main
   git checkout sua-branch
   git rebase main
   ```

2. **Execute todos os testes**
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   npm run format:check
   ```

3. **Verifique a build**
   ```bash
   npm run build
   ```

### Template de Pull Request

```markdown
## Descrição

Breve descrição das mudanças implementadas.

## Tipo de Mudança

- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação (mudança apenas na documentação)

## Como Testar

1. Passos para testar as mudanças
2. Comandos específicos
3. Cenários de teste

## Checklist

- [ ] Meu código segue os padrões do projeto
- [ ] Realizei self-review do código
- [ ] Comentei código complexo quando necessário
- [ ] Adicionei testes que provam que minha correção/funcionalidade funciona
- [ ] Testes novos e existentes passam localmente
- [ ] Atualizei a documentação quando necessário

## Screenshots (se aplicável)

Adicione screenshots para mudanças na UI ou comportamento visual.

## Issues Relacionadas

Fixes #123
Closes #456
```

### Processo de Review

1. **Automated Checks**: CI/CD executa testes e linting
2. **Code Review**: Pelo menos um maintainer revisa o código
3. **Testing**: Testes manuais quando necessário
4. **Approval**: Aprovação de pelo menos um maintainer
5. **Merge**: Merge para a branch main

### Critérios de Aprovação

- [ ] Todos os testes passam
- [ ] Cobertura de testes mantida
- [ ] Código segue padrões estabelecidos
- [ ] Documentação atualizada
- [ ] Sem conflitos de merge
- [ ] Aprovação de maintainer

## Reportar Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

**Comportamento Esperado**
Descrição clara do que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots para explicar o problema.

**Ambiente:**
 - OS: [e.g. Ubuntu 20.04]
 - Node.js: [e.g. 18.17.0]
 - Versão: [e.g. 1.0.0]

**Logs**
```
Cole logs relevantes aqui
```

**Contexto Adicional**
Qualquer outra informação sobre o problema.
```

### Informações Importantes

- Use labels apropriadas (bug, critical, enhancement)
- Forneça informações completas sobre o ambiente
- Inclua logs e stack traces quando possível
- Teste em ambiente limpo quando possível

## Sugerir Melhorias

### Template de Feature Request

```markdown
**A sua solicitação de funcionalidade está relacionada a um problema?**
Descrição clara e concisa do problema. Ex: Estou sempre frustrado quando [...]

**Descreva a solução que você gostaria**
Descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Descrição clara e concisa de soluções ou funcionalidades alternativas.

**Contexto Adicional**
Adicione qualquer outro contexto ou screenshots sobre a solicitação.

**Impacto**
- [ ] Melhoria de performance
- [ ] Nova funcionalidade
- [ ] Melhoria de UX
- [ ] Melhoria de DX (Developer Experience)
- [ ] Segurança

**Prioridade**
- [ ] Baixa
- [ ] Média
- [ ] Alta
- [ ] Crítica
```

## Documentação

### Tipos de Documentação

1. **README.md**: Visão geral e quick start
2. **DEV_GUIDE.md**: Guia detalhado para desenvolvedores
3. **API_DOCS.md**: Documentação da API
4. **CONTRIBUTING.md**: Este arquivo
5. **CHANGELOG.md**: Histórico de mudanças

### Padrões de Documentação

- Use Markdown para toda documentação
- Inclua exemplos práticos
- Mantenha linguagem clara e objetiva
- Atualize documentação junto com código
- Use diagramas quando apropriado

### Documentação da API

A documentação da API é gerada automaticamente via Swagger/OpenAPI:

```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

## Recursos Úteis

### Links Importantes

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Ferramentas Recomendadas

- **IDE**: VS Code com extensões TypeScript e Prisma
- **Database**: DBeaver ou pgAdmin para PostgreSQL
- **API Testing**: Postman ou Insomnia
- **Git GUI**: GitKraken ou SourceTree (opcional)

### Comandos Úteis

```bash
# Desenvolvimento
npm run start:dev          # Iniciar em modo desenvolvimento
npm run start:debug        # Iniciar com debug
npm run db:studio          # Abrir Prisma Studio

# Testes
npm test                   # Testes unitários
npm run test:watch         # Testes em modo watch
npm run test:e2e           # Testes E2E
npm run test:cov           # Cobertura de testes

# Qualidade de Código
npm run lint               # Executar ESLint
npm run format             # Formatar código
npm run type-check         # Verificar tipos TypeScript

# Docker
docker-compose up -d       # Iniciar serviços
docker-compose logs -f     # Ver logs
docker-compose down        # Parar serviços
```

## Suporte

### Onde Buscar Ajuda

1. **Documentação**: Verifique README.md e DEV_GUIDE.md
2. **Issues**: Procure issues similares no GitHub
3. **Discussions**: Use GitHub Discussions para perguntas
4. **Discord**: Canal da comunidade (se disponível)

### Reportar Problemas de Segurança

Para vulnerabilidades de segurança, **NÃO** abra uma issue pública. 
Envie um email para security@template-backend.com com:

- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Sugestões de correção (se houver)

## Reconhecimentos

Agradecemos a todos os contribuidores que ajudam a tornar este projeto melhor!

### Hall of Fame

<!-- Lista será atualizada automaticamente -->

---

**Obrigado por contribuir!** 🎉

Sua contribuição, seja ela grande ou pequena, faz a diferença para a comunidade.

---

**Autor**: Manus AI  
**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025

