# 🚀 Configuração do Sistema de Documentação Automática

## ✅ Pré-requisitos

Antes de começar, você precisa:

1. **Conta OpenAI** com API Key
2. **GitHub Token** com permissões adequadas
3. **Node.js 18+** instalado

## 📋 Passo 1: Configurar APIs

### 🤖 OpenAI API Key

1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Nome: "Documentation System"
4. **GUARDE** a chave (começa com `sk-`)

### 🔑 GitHub Token

1. Acesse: https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Selecione escopos:
   - ✅ `repo` (acesso aos repositórios)
   - ✅ `read:user` (informações do usuário)
4. **GUARDE** o token (começa com `ghp_`)

## 📋 Passo 2: Configurar Secrets no GitHub

1. Vá para seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**:

| Nome | Valor |
|------|--------|
| `OPENAI_API_KEY` | sua-chave-openai-aqui |
| `TOKEN_GITHUB` | seu-token-github-aqui |

## 📋 Passo 3: Instalar Dependências

```bash
cd automation
npm install
```

## 📋 Passo 4: Testar Configuração

```bash
# Teste local (não consome API)
npm run analyze:test

# Se aparecer erros de credenciais, configure:
export OPENAI_API_KEY="sua-chave-aqui"
export TOKEN_GITHUB="seu-token-aqui"

# Execute o teste novamente
npm run analyze:test
```

## 📋 Passo 5: Configurar Projeto

Edite `automation/config/project.json`:

```json
{
  "name": "Seu Projeto",
  "main_branch": "main",
  "repository": {
    "owner": "SeuUsuario",
    "name": "seu-repositorio"
  },
  "stack": {
    "frontend": ["react", "typescript", "vite"],
    "backend": ["nodejs", "supabase"]
  }
}
```

## 🧪 Testando o Sistema

### Teste Manual
```bash
# Análise completa (cuidado: consome API)
npm run analyze

# Análise de arquivos específicos
node scripts/analyze-code.js --manual --files="frontend/src/App.tsx"
```

### Teste via GitHub Actions

1. Faça uma mudança em qualquer arquivo `.ts`, `.tsx`, `.js`, `.jsx`
2. Crie um Pull Request para `main`
3. O workflow será executado automaticamente
4. Verifique:
   - ✅ Actions executaram sem erro
   - ✅ Wiki foi atualizado
   - ✅ Issue de notificação foi criada

## 🔍 Verificando Resultados

### Wiki
- Acesse: `https://github.com/SEU_USUARIO/SEU_REPO/wiki`
- Deve ter páginas:
  - **Home**: Página principal
  - **📚-Documentação-Técnica**: Docs para devs
  - **👥-Guia-do-Usuário**: Guias práticos
  - **📈-Resumo-Executivo**: Relatórios gerenciais

### Issues
- Acesse: `https://github.com/SEU_USUARIO/SEU_REPO/issues`
- Procure por issues com label `🤖 auto-generated`

### Logs
- No GitHub Actions, baixe o artifact "analysis-logs"
- Contém informações detalhadas da execução

## ⚙️ Configurações Avançadas

### Personalizar Prompts

Edite `automation/config/prompts.json` para ajustar como a IA gera a documentação.

### Filtros de Arquivos

Em `automation/config/project.json`, ajuste:
- `file_patterns.include`: Arquivos para incluir
- `file_patterns.exclude`: Arquivos para ignorar

### Configurar N8N (Futuro)

A estrutura já está preparada para migração para N8N:
1. Scripts são modulares
2. Configuração centralizada
3. APIs padronizadas
4. Logs estruturados

## 🐛 Troubleshooting

### Erro: "OPENAI_API_KEY not found"
- ✅ Verifique se o secret está configurado no GitHub
- ✅ Para teste local, configure a variável de ambiente

### Erro: "GitHub API rate limit"
- ✅ Aguarde 1 hora (limite por hora)
- ✅ Use token com mais permissões

### Erro: "Wiki não atualiza"
- ✅ Verifique se o repositório tem Wiki habilitado
- ✅ Settings → Features → Wikis ✅

### Documentação está genérica
- ✅ Ajuste os prompts em `config/prompts.json`
- ✅ Melhore a descrição do projeto em `config/project.json`

## 💰 Monitoramento de Custos

### OpenAI API
- **GPT-3.5-turbo**: ~$0.002/1K tokens
- **Análise típica**: 10-50 arquivos = $0.10-0.50
- **Limite sugerido**: $30/mês

### GitHub Actions
- **2000 minutos gratuitos/mês** (conta pessoal)
- **Execução típica**: 2-5 minutos

### Logs de Custo
Cada execução mostra:
```
📊 Tokens utilizados: 2,543
💰 Custo estimado: $0.0051
```

## 🚀 Próximos Passos

1. **Teste** com alguns PRs pequenos
2. **Ajuste** prompts conforme necessário
3. **Configure** notificações (email, Slack)
4. **Expanda** para outros repositórios
5. **Migre** para N8N quando necessário

---

**🎉 Pronto! Seu sistema de documentação automática está configurado!**

Para dúvidas ou problemas, verifique os logs ou abra uma issue.
