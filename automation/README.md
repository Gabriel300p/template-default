# 🤖 Sistema de Documentação Automática

## 📋 Visão Geral

Este sistema automatiza a geração de documentação inteligente para projetos de desenvolvimento, utilizando IA para análise de código e geração de conteúdo estruturado.

## 🏗️ Arquitetura

```
automation/
├── .github/workflows/        # GitHub Actions
├── scripts/                  # Scripts de automação
│   ├── analyze-code.js      # Análise principal
│   ├── generate-wiki.js     # Geração do wiki
│   └── utils/               # Utilitários
├── config/                  # Configurações
├── templates/               # Templates de documentação
└── README.md               # Este arquivo
```

## 🚀 Como Funciona

1. **Trigger**: PR para branch principal dispara workflow
2. **Análise**: Sistema analisa arquivos modificados
3. **IA**: OpenAI gera documentação contextual
4. **Output**: Atualiza GitHub Wiki automaticamente
5. **Notificação**: Cria issue com resumo das atualizações

## 📊 Tipos de Documentação Gerada

### 🔧 Técnica
- Análise de código e arquitetura
- Documentação de APIs e componentes
- Guias de desenvolvimento

### 👥 Usuário
- Guias de uso e tutoriais
- FAQ e troubleshooting
- Workflows de usuário

### 📈 Executiva
- Resumos de impacto de mudanças
- Métricas de desenvolvimento
- Análise de qualidade do código

## ⚙️ Configuração

1. **Variáveis de Ambiente** (GitHub Secrets):
   ```
   OPENAI_API_KEY=sk-your-key-here
   TOKEN_GITHUB=github_pat_your-token-here
   ```

2. **Configuração do Projeto** (`automation/config/project.json`):
   ```json
   {
     "name": "Seu Projeto",
     "main_branch": "main",
     "stack": ["react", "typescript", "supabase"]
   }
   ```

## 💰 Custo Estimado

- **OpenAI API**: ~R$ 50-100/mês
- **GitHub Actions**: Gratuito (minutos inclusos)
- **Total**: ~R$ 50-100/mês

## 🔄 Migração Futura para N8N

Esta arquitetura está preparada para migração futura para N8N:
- Scripts modulares reutilizáveis
- Configuração centralizada
- APIs padronizadas
- Logs estruturados

## 🛠️ Desenvolvimento

Para testar localmente:
```bash
cd automation
npm install
node scripts/analyze-code.js --test
```

## 📝 Logs e Monitoramento

- Logs automáticos em GitHub Actions
- Issues para notificações
- Métricas de uso da API OpenAI

---

*Sistema desenvolvido para ser genérico e adaptável a diferentes projetos de desenvolvimento.*
