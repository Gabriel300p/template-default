# 📮 GUIA POSTMAN - Teste da API Barbershop

## 🚀 Importar Collection

1. **Abra o Postman**
2. **Import** → **Upload Files**
3. **Selecione**: `Barbershop-API.postman_collection.json`
4. **Import** → Collection estará disponível

---

## ⚙️ Configuração Inicial

### 🔧 **Variáveis da Collection**

Antes de testar, configure estas variáveis:

1. **Clique na Collection** → **Variables**
2. **Configure os valores:**

| Variável        | Valor                   | Descrição                       |
| --------------- | ----------------------- | ------------------------------- |
| `base_url`      | `http://localhost:3002` | ✅ Já configurado               |
| `jwt_token`     | _(deixe vazio)_         | Será preenchido automaticamente |
| `barbershop_id` | _(deixe vazio)_         | Será preenchido automaticamente |
| `user_email`    | _(deixe vazio)_         | Será preenchido automaticamente |
| `user_password` | _(deixe vazio)_         | Será preenchido automaticamente |

### 🔑 **Configurar Login Supabase**

No request **"3. Login Supabase (Manual)"**:

1. **Substitua na URL:**
   - `SEU_SUPABASE_URL` → Seu URL real do Supabase
2. **Substitua no Header:**
   - `SUA_SUPABASE_ANON_KEY_AQUI` → Sua chave anon real

**Exemplo:**

```
URL: https://abcdefgh.supabase.co/auth/v1/token?grant_type=password
Header apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Sequência de Testes

### ✅ **1. Health Check**

```
GET /health
```

- **Objetivo**: Verificar se API está rodando
- **Esperado**: Status 200, resposta com uptime

### ✅ **2. Criar Barbearia + Proprietário**

```
POST /barbershop
```

- **Objetivo**: Criar nova barbearia com proprietário
- **Body exemplo já configurado**
- **Automático**: Salva `barbershop_id`, `user_email`, `user_password`
- **Esperado**: Status 201, retorna IDs e senha gerada

**Exemplo de Resposta:**

```json
{
  "barbershopId": "uuid-da-barbearia",
  "ownerUserId": "uuid-do-usuario",
  "generatedPassword": "aB3$kL9@pM2X"
}
```

### ✅ **3. Login Supabase**

```
POST https://seu-supabase.supabase.co/auth/v1/token
```

- **Objetivo**: Obter JWT token
- **Usa**: Email e senha salvos do passo anterior
- **Automático**: Salva `jwt_token`
- **Esperado**: Status 200, access_token válido

### ✅ **4. Ver Perfil do Usuário**

```
GET /auth/profile (com JWT)
```

- **Objetivo**: Verificar perfil do proprietário criado
- **Usa**: JWT token automaticamente
- **Esperado**: Status 200, dados do usuário + barbearias

### ✅ **5. Ver Detalhes da Barbearia**

```
GET /barbershop/{id} (com JWT)
```

- **Objetivo**: Verificar dados da barbearia criada
- **Usa**: `barbershop_id` salvo automaticamente
- **Esperado**: Status 200, detalhes completos da barbearia

### ✅ **6. Atualizar Perfil**

```
PATCH /auth/profile (com JWT)
```

- **Objetivo**: Testar atualização de dados pessoais
- **Body**: firstName, lastName, displayName, phone
- **Esperado**: Status 200, dados atualizados

### ✅ **7. Reset de Senha**

```
POST /auth/reset-password
```

- **Objetivo**: Testar solicitação de reset
- **Usa**: Email salvo automaticamente
- **Esperado**: Status 200, confirmação de envio

---

## 🎯 Fluxo Automático

### **Execute em Ordem:**

1. ▶️ **Health Check** → Confirma API rodando
2. ▶️ **Criar Barbearia** → Cria conta + barbearia
3. ▶️ **Login Supabase** → Obtém token JWT
4. ▶️ **Ver Perfil** → Confirma autenticação
5. ▶️ **Ver Barbearia** → Confirma criação
6. ▶️ **Atualizar Perfil** → Testa modificação
7. ▶️ **Reset Senha** → Testa funcionalidade

### **Automação Incluída:**

- ✅ Salva automaticamente IDs, email, senha
- ✅ Configura JWT token automaticamente
- ✅ Logs úteis no Postman Console
- ✅ Variáveis reutilizadas entre requests

---

## 🔍 Verificações

### **No Postman Console:**

- Password gerada será exibida
- JWT token será truncado para segurança
- IDs salvos serão mostrados

### **Verificar Responses:**

- **Status Codes**: 200/201 para sucesso
- **Headers**: CORS, Security headers
- **Body**: JSON estruturado conforme schemas

### **Verificar Database:**

- Novo usuário em `users` table
- Nova barbearia em `barbershops` table
- Relacionamento `ownerUserId` correto

---

## 🚨 Troubleshooting

### **Erro 500 na criação:**

- Verificar se servidor está rodando
- Verificar logs do servidor
- Verificar conexão com Supabase

### **Erro 401 nos requests autenticados:**

- Verificar se JWT token foi salvo
- Refazer login se necessário
- Verificar configuração Supabase

### **Login falha:**

- Verificar URL e API Key do Supabase
- Verificar se email/senha estão corretos
- Verificar se usuário foi criado no Supabase Auth

---

## 📋 Checklist de Sucesso

- [ ] ✅ Health check responde
- [ ] ✅ Barbearia criada com sucesso
- [ ] ✅ Senha gerada automaticamente
- [ ] ✅ Login no Supabase funciona
- [ ] ✅ JWT token obtido
- [ ] ✅ Perfil carrega com dados corretos
- [ ] ✅ Barbearia carrega com dados corretos
- [ ] ✅ Atualização de perfil funciona
- [ ] ✅ Reset de senha processa

**Se todos passarem: 🎉 API está 100% funcional!**
