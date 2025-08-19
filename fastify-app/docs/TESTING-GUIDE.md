# 🧪 GUIA DE TESTES COMPLETO

## 🚀 Como Testar a API

### 1. **Iniciar o Servidor**
```bash
cd "c:\Desenvolvimento\template-default\fastify-app"
pnpm dev
```

Você deve ver um banner colorido com todas as informações do servidor:
- URLs locais e de rede
- Status das conexões (Database, Supabase)
- Endpoints disponíveis
- Ferramentas de desenvolvimento

---

## 2. **Testes Básicos**

### ✅ **Health Check**
```bash
# Teste básico de conectividade
curl http://localhost:3002/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-19T...",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0"
}
```

### ✅ **Documentação Interativa**
Abra no navegador: **http://localhost:3002/docs**

**O que verificar:**
- Interface Swagger UI carregada
- 3 seções (Health, Auth, Barbershop)
- 7 endpoints documentados
- Botão "Authorize" para JWT
- Schemas de request/response visíveis

---

## 3. **Testes de CORS**

### ✅ **Teste CORS Básico**
```bash
# Simular request do frontend
curl -H "Origin: http://localhost:3000" \
     -H "Content-Type: application/json" \
     -X GET http://localhost:3002/health
```

**Verificar headers de resposta:**
- `Access-Control-Allow-Origin: http://localhost:3000`
- `Access-Control-Allow-Credentials: true`

### ✅ **Teste Preflight**
```bash
# Teste OPTIONS para preflight
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS http://localhost:3002/auth/profile
```

---

## 4. **Testes dos Endpoints**

### 🔐 **Auth Endpoints**

#### **GET /auth/profile** (Requer Auth)
```bash
# Sem token (deve dar 401)
curl -X GET http://localhost:3002/auth/profile

# Com token (substitua SEU_JWT_TOKEN)
curl -H "Authorization: Bearer SEU_JWT_TOKEN" \
     -X GET http://localhost:3002/auth/profile
```

#### **POST /auth/reset-password** (Público)
```bash
curl -X POST http://localhost:3002/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
```

### 🏪 **Barbershop Endpoints**

#### **POST /barbershop** (Público)
```bash
curl -X POST http://localhost:3002/barbershop \
     -H "Content-Type: application/json" \
     -d '{
       "owner": {
         "email": "owner@barbershop.com"
       },
       "barbershop": {
         "name": "Barbearia Teste",
         "description": "Uma barbearia de teste"
       }
     }'
```

---

## 5. **Testes de Segurança**

### ✅ **Security Headers**
```bash
# Verificar security headers
curl -I http://localhost:3002/health
```

**Headers esperados:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: same-origin`
- `Strict-Transport-Security` (se HTTPS)

### ✅ **Content Security Policy**
```bash
# Verificar CSP
curl -I http://localhost:3002/docs
```

**Verificar:**
- `Content-Security-Policy` header presente
- Swagger UI funciona (CSP permite recursos necessários)

---

## 6. **Testes de Performance**

### ✅ **Response Time**
```bash
# Medir tempo de resposta
curl -w "@-" -o /dev/null -s http://localhost:3002/health <<< "
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
"
```

### ✅ **Load Test Simples**
```bash
# 10 requests simultâneas
for i in {1..10}; do
  curl -s http://localhost:3002/health &
done
wait
```

---

## 7. **Verificação do Log Visual**

Após iniciar o servidor, observe no terminal:

### ✅ **Banner de Startup**
- Banner colorido com logo da API
- Status de conectividade
- URLs organizadas
- Ferramentas de desenvolvimento

### ✅ **Logs de Request**
```
[14:30:25] GET    /health 200 1.23ms
[14:30:26] POST   /barbershop 201 45.67ms
[14:30:27] GET    /docs 200 2.34ms
```

**Cores esperadas:**
- 🟢 Verde: 2xx (sucesso)
- 🟡 Amarelo: 4xx (erro cliente)
- 🔴 Vermelho: 5xx (erro servidor)

---

## 8. **Checklist Completo**

### ✅ **Funcionalidades Core**
- [ ] Servidor inicia sem erros
- [ ] Banner colorido é exibido
- [ ] Health check responde corretamente
- [ ] Documentação Swagger carrega
- [ ] Logs visuais funcionam

### ✅ **CORS & Headers**
- [ ] CORS funciona para localhost:3000
- [ ] CORS funciona para localhost:5173
- [ ] Security headers presentes
- [ ] Preflight requests funcionam

### ✅ **Endpoints**
- [ ] 7 endpoints funcionais
- [ ] Documentação completa no Swagger
- [ ] Validação de schemas funciona
- [ ] Respostas de erro padronizadas

### ✅ **Frontend Ready**
- [ ] Frontend pode conectar sem problemas
- [ ] JWT authentication documentado
- [ ] Todos endpoints testáveis no Swagger
- [ ] Performance adequada (<100ms para health)

---

## 🎯 **Status Esperado**

Se todos os testes passarem:
**✅ API 100% PRONTA PARA FRONTEND INTEGRATION**

- CORS configurado ✅
- Documentação interativa ✅  
- Security headers ✅
- Logs visuais ✅
- 7 endpoints funcionais ✅
