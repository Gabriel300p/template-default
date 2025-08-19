# 🧪 TESTE RÁPIDO COM CURL

## 🚀 Fluxo Completo de Teste

### 1. **Health Check**

```bash
curl -X GET http://localhost:3002/health
```

### 2. **Criar Barbearia + Proprietário**

```bash
curl -X POST http://localhost:3002/barbershop \
  -H "Content-Type: application/json" \
  -d '{
    "owner": {
      "email": "proprietario@teste.com"
    },
    "barbershop": {
      "name": "Barbearia Teste",
      "description": "Uma barbearia para testes",
      "phone": "+5511999887766"
    }
  }'
```

**Salve a resposta!** Você receberá:

```json
{
  "barbershopId": "uuid-da-barbearia",
  "ownerUserId": "uuid-do-usuario",
  "generatedPassword": "senha-gerada"
}
```

### 3. **Login no Supabase (substitua valores)**

```bash
# CONFIGURE: Substitua SEU_SUPABASE_URL e SUA_ANON_KEY
curl -X POST "https://SEU_SUPABASE_URL.supabase.co/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_SUPABASE_ANON_KEY" \
  -d '{
    "email": "proprietario@teste.com",
    "password": "SENHA_GERADA_ACIMA"
  }'
```

**Salve o access_token da resposta!**

### 4. **Testar Perfil (com token)**

```bash
# Substitua SEU_JWT_TOKEN pelo token recebido
curl -X GET http://localhost:3002/auth/profile \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### 5. **Testar Barbearia (com token)**

```bash
# Substitua UUID_DA_BARBEARIA e SEU_JWT_TOKEN
curl -X GET http://localhost:3002/barbershop/UUID_DA_BARBEARIA \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

---

## 📋 Valores do .env

Para o login funcionar, você precisa dos valores do seu `.env`:

```bash
# Valores necessários para configurar o Postman/curl
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Use estes valores para configurar:**

- URL do login: `https://SEU_SUPABASE_URL/auth/v1/token?grant_type=password`
- Header apikey: `SUA_SUPABASE_ANON_KEY`

---

## 🎯 Processo Simplificado

1. **Execute**: Criação da barbearia (curl #2)
2. **Copie**: Email, senha gerada, barbershop ID
3. **Configure**: URL e API key do Supabase no login
4. **Execute**: Login (curl #3)
5. **Copie**: access_token
6. **Execute**: Testes autenticados (curl #4 e #5)

**Tudo funcionando = API 100% operacional!** ✅
