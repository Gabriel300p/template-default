# Roadmap de Implementação - Auth + Barbershop MVT

## 🎯 Objetivo Principal

Criar sistema de autenticação completo focado em barbershops, usando Supabase como provider de auth, com estrutura modular replicável para futuras features.

---

## 📈 Fases de Desenvolvimento

### **FASE 1: Reestruturação & Limpeza** ⚡

**Objetivo**: Organizar codebase para foco em barbershop + auth

#### Entregas:

- [ ] Renomear feature `onboarding` → `barbershop`
- [ ] Criar feature `auth` centralizada
- [ ] Remover feature `staff` (temporário)
- [ ] Limpar arquivos não utilizados
- [ ] Ajustar rotas: `/me` → `/auth/profile`
- [ ] Documentação da nova estrutura

**Critério de Aceite**: Compilação sem erros + estrutura limpa + docs atualizadas

---

### **FASE 2: Barbershop Complete** 🏪

**Objetivo**: Sistema completo de criação e gestão de barbershops

#### Endpoints:

- [ ] `POST /barbershop` - Criação inicial (owner + barbershop)
- [ ] `GET /barbershop/:id` - Consulta dados da barbearia
- [ ] Validação robusta (Zod schemas)
- [ ] Rate limiting específico
- [ ] Error handling completo

#### Integrações Supabase:

- [ ] Service role para criação de usuários
- [ ] Email confirmation automático
- [ ] Password reset flow
- [ ] mustResetPassword enforcement

#### Segurança:

- [ ] Ownership validation
- [ ] Rate limiting (5 req/min para criação)
- [ ] Input sanitization
- [ ] Transações atômicas

**Critério de Aceite**: Owner pode criar barbershop + login completo + reset senha funcional

---

### **FASE 3: Auth Complete** 🔐

**Objetivo**: Sistema de autenticação robusto e reutilizável

#### Endpoints:

- [ ] `GET /auth/profile` - Perfil do usuário logado
- [ ] `POST /auth/reset-password` - Solicitar reset
- [ ] `POST /auth/confirm-email` - Confirmação de email
- [ ] `PATCH /auth/profile` - Atualizar perfil

#### Features:

- [ ] Profile com dados específicos por role
- [ ] Email templates (Supabase)
- [ ] Session management
- [ ] Security headers

#### Rate Limiting:

- [ ] Auth endpoints: 10 req/min
- [ ] Reset password: 3 req/hour
- [ ] Profile updates: 20 req/min

**Critério de Aceite**: Auth completo + documentação para replicação + testes

---

### **FASE 4: Documentação & Padrões** 📚

**Objetivo**: Estabelecer padrões para futuras features

#### Entregas:

- [ ] API Documentation (OpenAPI/Swagger)
- [ ] Feature Template Guide
- [ ] Security Guidelines
- [ ] Testing Patterns
- [ ] Deployment Guide

**Critério de Aceite**: Documentação completa para devs futuros + IA assistants

---

## 🏗️ Estrutura Final Esperada

```
src/features/
├── auth/
│   ├── controllers/auth.controller.ts
│   ├── services/auth.service.ts
│   ├── models/auth.models.ts
│   └── auth.routes.ts
├── barbershop/
│   ├── controllers/barbershop.controller.ts
│   ├── services/barbershop.service.ts
│   ├── models/barbershop.models.ts
│   └── barbershop.routes.ts
└── index.ts

shared/
├── errors/        # Error taxonomy
├── middleware/    # Rate limiting, auth, etc
├── services/      # External integrations (Supabase)
├── utils/         # Utilities (password, validation)
└── types/         # Global types
```

---

## 📊 Critérios de Sucesso Global

### Performance:

- [ ] Response time < 200ms (95th percentile)
- [ ] Zero memory leaks
- [ ] Rate limiting effective

### Security:

- [ ] All inputs validated
- [ ] JWT verification robust
- [ ] Ownership checks enforced
- [ ] No sensitive data in logs

### Usability:

- [ ] Owner pode criar barbershop em < 2min
- [ ] Reset de senha funciona perfeitamente
- [ ] Mensagens de erro claras
- [ ] Documentação API completa

### Maintainability:

- [ ] Features 100% modulares
- [ ] Padrões bem definidos
- [ ] Testes automatizados
- [ ] Docs para futuras features

---

## 🚀 Próximos Passos (Pós-MVT)

1. **Staff Management** (replicar padrão barbershop)
2. **Client Management** (appointments, etc)
3. **Analytics & Metrics**
4. **Advanced Security** (2FA, audit logs)

---

**Status**: 📋 **PLANEJAMENTO COMPLETO**  
**Próximo**: Executar Fase 1 - Reestruturação
