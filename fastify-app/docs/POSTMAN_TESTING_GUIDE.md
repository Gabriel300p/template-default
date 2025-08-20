# 🧪 Guia de Teste - Postman Collection B-BOSS

## 📋 Setup Inicial

### 1. Importar os Arquivos

1. **Collection**: Importe `B-BOSS-API-Sistema-Completo.postman_collection.json`
2. **Environment**: Importe `B-BOSS-Local.postman_environment.json`

### 2. Configurar Environment

No Postman, configure as variáveis no environment **B-BOSS Local Development**:

```bash
# URLs
base_url: http://localhost:3002
supabase_url: https://seu-projeto.supabase.co

# Chaves Supabase
supabase_anon_key: sua-anon-key-aqui

# Dados de Teste (já configurados)
test_email: proprietario@teste.com
test_password: MinhaSenh@123456
test_cpf: 123.456.789-10
```

## 🎯 Fluxo de Teste Recomendado

### **Cenário 1: Novo Proprietário + Barbearia**

```
1. Health Check              → Verificar se API está online
2. Criar Barbearia           → Registro completo (proprietário + barbearia)
3. Login Supabase (Manual)   → Login direto no Supabase
4. Ver Perfil do Usuário     → Verificar dados do proprietário
5. Ver Detalhes da Barbearia → Verificar dados da barbearia criada
```

### **Cenário 2: Registro + Login B-BOSS**

```
6. Registro de Usuário B-BOSS → Criar usuário comum
7. Login B-BOSS (Email)      → Login com email (MFA habilitado)
8. Verificar Código MFA      → Validar código de 2FA
```

### **Cenário 3: Login Alternativo**

```
7. Login B-BOSS (CPF)        → Login usando CPF em vez de email
8. Verificar Código MFA      → Validar código de 2FA
```

### **Cenário 4: Gestão de Conta**

```
9. Solicitar Reset de Senha  → Processo de recuperação
10. Confirmar Email          → Validação de email
11. Atualizar Perfil         → Modificar dados do usuário
```

### **Cenário 5: Usuário Estrangeiro**

```
12. Registro Estrangeiro     → Criar conta com passaporte
```

## 🔧 Variáveis Automáticas

As seguintes variáveis são **preenchidas automaticamente** durante os testes:

| Variável        | Preenchida em      | Usada em                  |
| --------------- | ------------------ | ------------------------- |
| `barbershop_id` | Criar Barbearia    | Ver Detalhes da Barbearia |
| `user_id`       | Criar Barbearia    | Operações do usuário      |
| `jwt_token`     | Login Supabase/MFA | Requests autenticados     |
| `temp_token`    | Login B-BOSS       | Verificar Código MFA      |

## 📊 Validações Automáticas

Cada request inclui **testes automáticos**:

- ✅ **Status codes** corretos
- ✅ **Estrutura da resposta** válida
- ✅ **Tokens JWT** extraídos automaticamente
- ✅ **IDs** salvos para requests subsequentes

## 🎨 Códigos de Cores

- 🟢 **200-299**: Sucesso
- 🟡 **400-499**: Erro do cliente (dados inválidos)
- 🔴 **500-599**: Erro do servidor

## 🔍 Debugging

### Ver Logs Detalhados

1. Abra o **Console** do Postman (View → Show Postman Console)
2. Execute os requests
3. Veja logs detalhados de cada operação

### Dados de Teste Pré-configurados

**Proprietário Principal:**

```json
{
  "email": "proprietario@teste.com",
  "cpf": "123.456.789-10",
  "password": "MinhaSenh@123456",
  "phone": "+55 (11) 9 9999-9999"
}
```

**Barbearia Principal:**

```json
{
  "name": "Barbearia Elite",
  "description": "A melhor barbearia da região",
  "phone": "+55 (11) 3333-4444",
  "website": "https://barbearia-elite.com.br",
  "appointment_link": "https://agendamento.elite.com.br"
}
```

**Usuário Comum:**

```json
{
  "email": "usuario@teste.com",
  "cpf": "987.654.321-99",
  "password": "MinhaSenh@123456",
  "phone": "+55 (11) 9 8888-7777"
}
```

**Usuário Estrangeiro:**

```json
{
  "email": "estrangeiro@teste.com",
  "passport": "AB 123 456",
  "password": "MinhaSenh@123456",
  "phone": "+55 (11) 9 6666-5555"
}
```

## 🚨 Notas Importantes

### ⚠️ Ordem de Execução

- Execute **"Criar Barbearia"** antes de operações autenticadas
- Use **"Login Supabase"** para obter JWT token
- **MFA está habilitado** por padrão - sempre será solicitado

### 📧 Simulação de Email

- Emails de MFA são **logados no console** da API
- Códigos MFA são **exibidos nos logs** para facilitar testes
- Use qualquer código de 8 caracteres alfanuméricos nos testes

### 🔑 Tokens

- **JWT tokens** expiram em 1 hora
- **Temp tokens** (MFA) expiram em 10 minutos
- Tokens são **salvos automaticamente** entre requests

## 🛠️ Comandos Úteis

**Iniciar API:**

```bash
cd c:\Desenvolvimento\template-default\fastify-app
pnpm run dev
```

**Reset do Banco:**

```bash
pnpm prisma migrate reset --force
pnpm prisma migrate dev --name "fresh_start"
```

**Ver Dados:**

```bash
pnpm prisma studio
```

---

**💡 Dica**: Execute os requests em ordem sequencial na primeira vez para configurar todas as variáveis automaticamente!
