# 🏗️ Arquitetura Backend

> **Estrutura e padrões** do backend NestJS

---

## 🎯 **Visão Geral**

O backend foi construído usando **NestJS** seguindo princípios de arquitetura limpa, SOLID e padrões enterprise. A estrutura é modular, testável e escalável.

---

## 📦 **Estrutura de Módulos**

```
src/
├── 📱 app/                    # Módulo principal
│   ├── app.controller.ts      # Controller principal
│   ├── app.module.ts          # Módulo raiz
│   └── app.service.ts         # Service principal
│
├── 🗃️ database/              # Configuração do banco
│   ├── database.module.ts     # Módulo do banco
│   └── migrations/           # Migrações
│
├── 🎯 modules/               # Módulos de funcionalidade
│   ├── auth/                 # Autenticação
│   ├── users/               # Usuários
│   ├── records/             # Records CRUD
│   └── health/              # Health checks
│
└── 🔧 shared/               # Recursos compartilhados
    ├── decorators/          # Decorators customizados
    ├── filters/             # Exception filters
    ├── guards/              # Guards de autenticação
    ├── interceptors/        # Interceptors globais
    └── pipes/              # Pipes de validação
```

---

## 🎯 **Padrões Arquiteturais**

### 🏛️ **Clean Architecture**
```
┌─────────────────────────────────────────────────────────┐
│                    🌐 CONTROLLERS                       │
│                 (HTTP Interface)                        │
├─────────────────────────────────────────────────────────┤
│                    🧠 SERVICES                          │
│                 (Business Logic)                        │
├─────────────────────────────────────────────────────────┤
│                    🗃️ REPOSITORIES                     │
│                  (Data Access)                          │
├─────────────────────────────────────────────────────────┤
│                    💾 ENTITIES                          │
│                  (Domain Models)                        │
└─────────────────────────────────────────────────────────┘
```

### 🔧 **Dependency Injection**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  controllers: [RecordsController],
  providers: [RecordsService, RecordsRepository],
  exports: [RecordsService]
})
export class RecordsModule {}
```

### 🛡️ **Guards e Middleware**
```typescript
// Auth Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Rate Limiting
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per minute
```

---

## 🗃️ **Database Design**

### 📊 **Entity Relationships**
```
Users (1) ──── (N) Records
              │
              └── (N) Tags
```

### 📝 **Schema Example**
```typescript
@Entity('records')
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  })
  status: string;

  @ManyToOne(() => User, user => user.records)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 🔐 **Security Architecture**

### 🛡️ **Authentication Flow**
```
1. POST /auth/login → Validate credentials
2. Generate JWT token ← Return token
3. Client stores token → Local/Session storage  
4. API requests → Authorization: Bearer <token>
5. Guard validates → Proceed or reject
```

### 🔒 **Security Measures**
- ✅ **JWT Authentication** - Token-based auth
- ✅ **Password Hashing** - bcrypt with salt
- ✅ **Rate Limiting** - Throttling por IP/usuário
- ✅ **CORS** - Cross-origin configurado
- ✅ **Helmet** - Security headers
- ✅ **Validation** - class-validator pipes

---

## 📈 **Performance Patterns**

### ⚡ **Caching Strategy**
```typescript
@Injectable()
export class RecordsService {
  @Cacheable('records', 300) // 5 minutes
  async findAll(): Promise<Record[]> {
    return this.repository.find();
  }
}
```

### 🔍 **Query Optimization**
```typescript
// Eager loading relacionamentos
const records = await this.repository.find({
  relations: ['owner', 'tags'],
  where: { status: 'active' }
});

// Pagination
const [records, total] = await this.repository.findAndCount({
  skip: (page - 1) * limit,
  take: limit
});
```

---

## 🧪 **Testing Architecture**

### 🎯 **Testing Strategy**
```
Unit Tests      → Services, Guards, Pipes
Integration     → Controllers + Services  
E2E Tests       → Full API workflows
```

### 📝 **Test Structure**
```typescript
describe('RecordsService', () => {
  let service: RecordsService;
  let repository: Repository<Record>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RecordsService,
        {
          provide: getRepositoryToken(Record),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<RecordsService>(RecordsService);
  });
});
```

---

## 🔄 **Error Handling**

### 🚨 **Exception Strategy**
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: exception.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}
```

### 📊 **Custom Exceptions**
```typescript
export class RecordNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Record with ID ${id} not found`);
  }
}
```

---

## 📊 **Monitoring e Observability**

### 🔍 **Logging Strategy**
```typescript
@Injectable()
export class AppLogger {
  log(message: string, context?: string) {
    console.log(`[${context}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${context}] ${message}`, trace);
  }
}
```

### 📈 **Health Checks**
```typescript
@Get('health')
@HealthCheck()
healthCheck() {
  return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024)
  ]);
}
```

---

## 🚀 **Deployment Architecture**

### 🐳 **Docker Strategy**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### ☁️ **Environment Config**
```typescript
@Injectable()
export class ConfigService {
  get(key: string): string {
    return process.env[key];
  }
  
  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }
}
```

---

## 🎉 **Conclusão Arquitetural**

### ✅ **Benefícios da Arquitetura**
- 🏗️ **Modularidade** - Fácil manutenção e extensão
- 🔒 **Segurança** - Múltiplas camadas de proteção
- ⚡ **Performance** - Caching e otimizações
- 🧪 **Testabilidade** - Cobertura completa
- 📊 **Observabilidade** - Logging e monitoring

---

<div align="center">
  <p><strong>🏗️ Arquitetura enterprise e escalável</strong></p>
  <p><em>Preparada para crescimento e evolução contínua</em></p>
</div>
