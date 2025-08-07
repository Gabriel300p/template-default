# 🔐 Configuração das GitHub Secrets

## 📋 Instruções Rápidas

### 1. **Acesse as Configurações do Repositório**
1. Vá para `https://github.com/Gabriel300p/default`
2. Clique em **Settings** (na barra superior do repositório)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### 2. **Configure as Secrets Necessárias**

Clique em **"New repository secret"** para cada uma:

#### 🤖 **OPENAI_API_KEY**
- **Name:** `OPENAI_API_KEY`
- **Secret:** Sua chave da OpenAI (`sk-proj-...`)
- **Como obter:** https://platform.openai.com/api-keys

#### 🐙 **TOKEN_GITHUB** 
- **Name:** `TOKEN_GITHUB` ⚠️ **IMPORTANTE: NÃO pode começar com GITHUB_**
- **Secret:** Seu Personal Access Token (`ghp_...` ou `github_pat_...`)
- **Como obter:** https://github.com/settings/tokens

### 3. **Configurações do Token GitHub**

Quando criar o token em https://github.com/settings/tokens:

#### **Permissões Necessárias:**
- ✅ **repo** (acesso completo ao repositório)
- ✅ **admin:repo_hook** (gerenciar webhooks)
- ✅ **workflow** (modificar GitHub Actions)

#### **Tipo de Token:**
- Use **Classic Token** (mais simples)
- Configure **Expiration** para 90 dias ou mais

### 4. **Verificar Configuração**

Após configurar as secrets:

1. **Ir para Actions:**
   - `https://github.com/Gabriel300p/default/actions`
   
2. **Disparar manualmente:**
   - Clique na workflow "📚 Generate Documentation"
   - Clique em "Run workflow"
   - Escolha a branch `develop`
   - Clique em "Run workflow"

3. **Verificar logs:**
   - Clique na execução que apareceu
   - Verifique se não há erros de autenticação

## 🔍 Troubleshooting

### **Erro: "Context access might be invalid: TOKEN_GITHUB"**
- ✅ **Normal** - É só um warning do VS Code
- ✅ **Funcionará** no GitHub Actions normalmente

### **Erro: "OPENAI_API_KEY não configurada"**
- ❌ Verifique se o nome está correto: `OPENAI_API_KEY`
- ❌ Verifique se a chave começa com `sk-proj-`

### **Erro: "TOKEN_GITHUB não configurado"**
- ❌ Verifique se o nome está correto: `TOKEN_GITHUB`
- ❌ Verifique se o token tem as permissões necessárias

### **Erro 403: "Resource not accessible by integration"**
- ❌ Token sem permissões suficientes
- ❌ Recrie o token com as permissões listadas acima

## 🎯 Status Atual

✅ **Código atualizado** para usar `TOKEN_GITHUB`  
✅ **Workflow configurado** com a nova variável  
⏳ **Aguardando** configuração das secrets no GitHub  

## 📞 Próximos Passos

1. Configure as 2 secrets no GitHub
2. Execute a workflow manualmente para testar
3. Se der erro, verifique os logs e as permissões do token
4. Uma vez funcionando, o sistema rodará automaticamente nos PRs!

---
*Gerado automaticamente pelo sistema de documentação*
