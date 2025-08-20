# 🧪 PLANO DETALHADO: TESTING SUITE IMPLEMENTATION

## 📋 **OVERVIEW EXECUTIVO**

### **Objetivo:** Implementar sistema completo de testes automatizados para garantir qualidade e confiabilidade em produção

### **Estratégia:** Abordagem em camadas (Unit → Integration → E2E) com cobertura de 80%+ e documentação automática

### **Timeline:** 5 fases implementadas de forma incremental e testável

---

## 🏗️ **ARQUITETURA DE TESTES**

```
tests/
├── unit/                           # Testes unitários isolados
│   ├── services/                   # Lógica de negócio
│   ├── controllers/                # Handlers de requisição
│   ├── utils/                      # Utilitários e helpers
│   └── middlewares/                # Middlewares customizados
├── integration/                    # Testes de integração
│   ├── api/                        # Endpoints completos
│   ├── database/                   # Operações no banco
│   └── external/                   # APIs externas (mocked)
├── e2e/                           # Testes end-to-end
│   ├── scenarios/                  # Cenários de usuário
│   └── flows/                      # Fluxos completos
├── fixtures/                      # Dados de teste fixos
│   ├── users.json
│   ├── barbershops.json
│   └── auth-tokens.json
├── mocks/                         # Mocks e stubs
│   ├── supabase/                  # Supabase Admin API
│   ├── email/                     # Serviços de email
│   └── external/                  # APIs externas
├── factories/                     # Factories para dados dinâmicos
│   ├── user.factory.ts
│   ├── barbershop.factory.ts
│   └── auth.factory.ts
├── helpers/                       # Utilitários de teste
│   ├── database.helper.ts         # Setup/teardown DB
│   ├── auth.helper.ts             # Autenticação para testes
│   └── api.helper.ts              # Cliente HTTP para testes
└── setup/                         # Configuração global
    ├── vitest.config.ts
    ├── test-db.setup.ts
    └── global.setup.ts
```

---

## 🎯 **FASE 1: SETUP E CONFIGURAÇÃO**

### **1.1 Dependências e Ferramentas**

```json
{
  "devDependencies": {
    "vitest": "^2.0.0", // Framework de testes
    "@vitest/coverage-v8": "^2.0.0", // Coverage com V8
    "@vitest/ui": "^2.0.0", // Interface web para testes
    "supertest": "^7.0.0", // Testes HTTP
    "msw": "^2.0.0", // Mock Service Worker
    "prisma-test-utils": "^1.0.0", // Utilitários para Prisma
    "faker": "^8.0.0", // Dados fake realistas
    "testcontainers": "^10.0.0", // Containers para testes
    "sqlite3": "^5.1.0", // DB em memória para testes
    "@types/supertest": "^6.0.0"
  }
}
```

### **1.2 Configuração Vitest**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup/global.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["node_modules/", "tests/", "dist/"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
    },
  },
});
```

### **1.3 Database de Teste**

```typescript
// tests/setup/test-db.setup.ts
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const testDbUrl = "file:./test.db";

export class TestDatabase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: { db: { url: testDbUrl } },
    });
  }

  async setup() {
    // Deploy schema to test database
    execSync("npx prisma db push --force-reset", {
      env: { ...process.env, DATABASE_URL: testDbUrl },
    });

    await this.seed();
  }

  async cleanup() {
    await this.prisma.$disconnect();
  }

  async seed() {
    // Dados básicos para todos os testes
  }

  async reset() {
    // Limpar dados entre testes
  }
}
```

---

## 🧪 **FASE 2: UNIT TESTS (Services & Controllers)**

### **2.1 Service Tests - Exemplo: AuthService**

```typescript
// tests/unit/services/auth.service.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "@/features/auth/services/auth.service";
import { createMockPrisma } from "@tests/mocks/prisma.mock";
import { createUserFactory } from "@tests/factories/user.factory";

describe("AuthService", () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockPrismaSafe: any;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    mockPrismaSafe = createMockPrismaSafe();
    authService = new AuthService(mockPrisma, mockPrismaSafe);
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      // Given
      const user = createUserFactory();
      const credentials = { email: user.email, password: "password123" };

      mockPrismaSafe.safeExecute.mockResolvedValue(user);

      // When
      const result = await authService.login(credentials);

      // Then
      expect(result).toMatchObject({
        user: expect.objectContaining({
          email: user.email,
          role: user.role,
        }),
        requiresMfa: expect.any(Boolean),
      });
    });

    it("should throw error for invalid credentials", async () => {
      // Given
      const credentials = { email: "wrong@email.com", password: "wrong" };
      mockPrismaSafe.safeExecute.mockResolvedValue(null);

      // When & Then
      await expect(authService.login(credentials)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("MFA flow", () => {
    it("should generate MFA code when required", async () => {
      // Test MFA generation
    });

    it("should verify MFA code correctly", async () => {
      // Test MFA verification
    });

    it("should handle expired MFA codes", async () => {
      // Test expiration logic
    });
  });
});
```

### **2.2 Controller Tests - Exemplo: BarbershopController**

```typescript
// tests/unit/controllers/barbershop.controller.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BarbershopController } from "@/features/barbershop/controllers/barbershop.controller";
import {
  createMockRequest,
  createMockReply,
} from "@tests/helpers/fastify.helpers";

describe("BarbershopController", () => {
  let controller: BarbershopController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      createBarbershopWithOwner: vi.fn(),
      getBarbershopById: vi.fn(),
    };
    controller = new BarbershopController(mockService);
  });

  describe("createBarbershop", () => {
    it("should create barbershop successfully", async () => {
      // Given
      const request = createMockRequest({
        body: {
          barbershop: { name: "Test Barbershop" },
          owner: { email: "owner@test.com", cpf: "12345678901" },
        },
      });
      const reply = createMockReply();

      const expectedResult = { id: "123", name: "Test Barbershop" };
      mockService.createBarbershopWithOwner.mockResolvedValue(expectedResult);

      // When
      await controller.createBarbershop(request, reply);

      // Then
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle validation errors", async () => {
      // Test validation error scenarios
    });
  });
});
```

---

## 🔗 **FASE 3: INTEGRATION TESTS (API Endpoints)**

### **3.1 API Integration Tests**

```typescript
// tests/integration/api/barbershop.api.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "@/app";
import { TestDatabase } from "@tests/setup/test-db.setup";
import { createAuthToken } from "@tests/helpers/auth.helper";
import supertest from "supertest";

describe("Barbershop API Integration", () => {
  let app: any;
  let testDb: TestDatabase;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.setup();

    app = await buildApp();
    await app.ready();
    request = supertest(app.server);
  });

  afterAll(async () => {
    await app.close();
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.reset();
  });

  describe("POST /barbershop", () => {
    it("should create barbershop with valid data", async () => {
      const barbershopData = {
        barbershop: {
          name: "Test Barbershop",
          description: "A test barbershop",
          phone: "+5511999999999",
        },
        owner: {
          email: "owner@test.com",
          cpf: "12345678901",
          phone: "+5511888888888",
        },
      };

      const response = await request
        .post("/barbershop")
        .send(barbershopData)
        .expect(201);

      expect(response.body).toMatchObject({
        barbershop: expect.objectContaining({
          name: "Test Barbershop",
        }),
        owner: expect.objectContaining({
          email: "owner@test.com",
        }),
      });
    });

    it("should return 409 for duplicate email", async () => {
      // Create first barbershop
      await request.post("/barbershop").send(validData);

      // Try to create with same email
      const response = await request
        .post("/barbershop")
        .send(validData)
        .expect(409);

      expect(response.body).toMatchObject({
        status: 409,
        error: "Conflict",
        message: expect.stringContaining("já existe"),
      });
    });
  });

  describe("GET /barbershop/:id", () => {
    it("should require authentication", async () => {
      const response = await request.get("/barbershop/123").expect(401);

      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return barbershop for authenticated owner", async () => {
      // Setup authenticated user and barbershop
      const token = await createAuthToken("owner");

      const response = await request
        .get("/barbershop/123")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.barbershop).toBeDefined();
    });
  });
});
```

---

## 🎭 **FASE 4: MOCKS E EXTERNAL SERVICES**

### **4.1 Supabase Admin API Mock**

```typescript
// tests/mocks/supabase/admin.mock.ts
import { rest } from "msw";
import { setupServer } from "msw/node";

export const supabaseAdminMocks = [
  // Create user
  rest.post("*/auth/v1/admin/users", (req, res, ctx) => {
    const { email, password } = req.body;

    return res(
      ctx.json({
        id: `user_${Date.now()}`,
        email,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // Delete user
  rest.delete("*/auth/v1/admin/users/:id", (req, res, ctx) => {
    return res(ctx.status(200));
  }),

  // Verify JWT
  rest.get("*/auth/v1/user", (req, res, ctx) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res(ctx.status(401));
    }

    return res(
      ctx.json({
        id: "user_123",
        email: "test@example.com",
      })
    );
  }),
];

export const mockServer = setupServer(...supabaseAdminMocks);
```

### **4.2 Email Service Mock**

```typescript
// tests/mocks/email/email.mock.ts
import { vi } from "vitest";

export const createEmailServiceMock = () => ({
  sendMfaCode: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordReset: vi.fn().mockResolvedValue({ success: true }),
  sendWelcome: vi.fn().mockResolvedValue({ success: true }),
});
```

---

## 🚀 **FASE 5: E2E TESTS & SCENARIOS**

### **5.1 Complete User Flows**

```typescript
// tests/e2e/scenarios/barbershop-creation.e2e.test.ts
import { describe, it, expect } from "vitest";
import { E2ETestRunner } from "@tests/helpers/e2e.helper";

describe("E2E: Complete Barbershop Creation Flow", () => {
  let e2e: E2ETestRunner;

  beforeEach(async () => {
    e2e = new E2ETestRunner();
    await e2e.setup();
  });

  afterEach(async () => {
    await e2e.cleanup();
  });

  it("should complete full barbershop creation and authentication flow", async () => {
    // Step 1: Create barbershop
    const createResponse = await e2e.api
      .post("/barbershop")
      .send({
        barbershop: {
          name: "E2E Test Barbershop",
          description: "Created in E2E test",
        },
        owner: {
          email: "e2e-owner@test.com",
          cpf: "12345678901",
        },
      })
      .expect(201);

    expect(createResponse.body.tempPassword).toBeDefined();

    // Step 2: Login with temp password
    const loginResponse = await e2e.api
      .post("/auth/login")
      .send({
        email: "e2e-owner@test.com",
        password: createResponse.body.tempPassword,
      })
      .expect(200);

    expect(loginResponse.body.requiresPasswordReset).toBe(true);

    // Step 3: Reset password
    const resetResponse = await e2e.api
      .post("/auth/reset-password")
      .send({
        token: loginResponse.body.resetToken,
        newPassword: "NewSecurePassword123!",
      })
      .expect(200);

    // Step 4: Login with new password
    const finalLoginResponse = await e2e.api
      .post("/auth/login")
      .send({
        email: "e2e-owner@test.com",
        password: "NewSecurePassword123!",
      })
      .expect(200);

    expect(finalLoginResponse.body.accessToken).toBeDefined();

    // Step 5: Access protected barbershop endpoint
    const barbershopResponse = await e2e.api
      .get(`/barbershop/${createResponse.body.barbershop.id}`)
      .set("Authorization", `Bearer ${finalLoginResponse.body.accessToken}`)
      .expect(200);

    expect(barbershopResponse.body.barbershop.name).toBe("E2E Test Barbershop");
  });
});
```

---

## 📊 **COVERAGE E REPORTING**

### **6.1 Coverage Configuration**

```typescript
// Targets de coverage por categoria:
{
  "services": 90,      // Lógica de negócio crítica
  "controllers": 85,   // Handlers de API
  "middlewares": 80,   // Middlewares customizados
  "utils": 75,         // Utilitários
  "overall": 80        // Cobertura geral
}
```

### **6.2 Performance Testing**

```typescript
// tests/performance/api.perf.test.ts
import { describe, it } from "vitest";
import { performanceTest } from "@tests/helpers/performance.helper";

describe("API Performance Tests", () => {
  it("should handle barbershop creation within acceptable time", async () => {
    const result = await performanceTest({
      endpoint: "POST /barbershop",
      payload: validBarbershopData,
      expectedMaxTime: 500, // ms
      concurrent: 10,
    });

    expect(result.averageTime).toBeLessThan(500);
    expect(result.successRate).toBeGreaterThan(0.95);
  });
});
```

---

## 🔄 **CI/CD INTEGRATION (GitHub Actions)**

### **7.1 Test Pipeline**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run type check
        run: pnpm run type-check

      - name: Run unit tests
        run: pnpm run test:unit

      - name: Run integration tests
        run: pnpm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run E2E tests
        run: pnpm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

---

## 📚 **DOCUMENTATION AUTOMATION**

### **8.1 Living Documentation**

```typescript
// Extrair exemplos dos testes para documentação
// Gerar OpenAPI schemas automaticamente
// Atualizar Postman collection com base nos testes
// Criar relatórios de coverage visual
```

---

## 🎯 **CRONOGRAMA DE IMPLEMENTAÇÃO**

### **Semana 1: Setup & Unit Tests**

- ✅ Configuração Vitest
- ✅ Database de teste
- ✅ Mocks básicos
- ✅ Unit tests para AuthService
- ✅ Unit tests para BarbershopService

### **Semana 2: Integration Tests**

- ✅ API endpoint tests
- ✅ Database integration
- ✅ Error handling tests
- ✅ Authentication flow tests

### **Semana 3: E2E & Performance**

- ✅ E2E scenarios
- ✅ Performance benchmarks
- ✅ Load testing
- ✅ Edge case testing

### **Semana 4: Coverage & CI**

- ✅ Coverage optimization
- ✅ GitHub Actions setup
- ✅ Documentation generation
- ✅ Final validation

---

## 🏆 **MÉTRICAS DE SUCESSO**

- ✅ **80%+ Coverage** em todas as categorias
- ✅ **0 falhas** em CI/CD pipeline
- ✅ **<500ms** response time em 95% dos endpoints
- ✅ **100% dos cenários críticos** cobertos em E2E
- ✅ **Documentação automática** atualizada
- ✅ **0 regressões** detectadas nos testes

**Este plano garante qualidade enterprise-grade para o sistema! 🚀**
