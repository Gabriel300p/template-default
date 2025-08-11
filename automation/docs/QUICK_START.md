# 🚀 Quick Start Guide - Feature Documentation System v3.0

> Comece a documentar suas features em menos de 5 minutos!

## ⚡ Instalação Rápida

### 1. Pré-requisitos
- ✅ Node.js 16+
- ✅ Projeto com `src/features/`
- ✅ Git (recomendado)

### 2. Primeiro Uso
```bash
cd automation
node generate-feature-docs.js
```

Siga o assistente interativo! 🎯

## 🎮 Comandos Essenciais

### 📋 Menu Rápido
| Comando | O que faz |
|---------|-----------|
| `node generate-feature-docs.js` | 🎯 **Modo interativo** (recomendado) |
| `node generate-feature-docs.js --all` | 📚 Documentar todas as features |
| `node generate-feature-docs.js --detect-changes` | 🔄 Apenas features modificadas |
| `node generate-feature-docs.js --config` | ⚙️ Configurar sistema |

### ⚡ Exemplos Rápidos

**Primeira execução:**
```bash
node generate-feature-docs.js --config  # Configure primeiro
node generate-feature-docs.js --all     # Documente tudo
```

**Uso diário:**
```bash
node generate-feature-docs.js --detect-changes  # Após fazer mudanças
```

**Feature específica:**
```bash
node generate-feature-docs.js --features "comunicacoes,dashboard"
```

## 🎯 O Que Você Obtém

### 📄 Arquivos Gerados
Para cada feature em `src/features/`, você recebe:
- `docs/features/sua-feature.md` - Documentação completa
- Análise automática de componentes
- Detecção de elementos UI
- Estrutura organizada

### 🔍 Análise Automática
- ✅ **Componentes React/Vue** - Props, hooks, métodos
- ✅ **Elementos UI** - Botões, filtros, modais, formulários
- ✅ **Integração Git** - Apenas arquivos modificados
- ✅ **Multi-audiência** - Desenvolvedores, PMs, Designers

## 🛠️ Configuração Opcional

### Variáveis de Ambiente
```bash
cp .env.example .env
# Edite .env para adicionar OPENAI_API_KEY (opcional)
```

### Configuração Interativa
```bash
node generate-feature-docs.js --config
```

## 📊 Exemplo de Resultado

**Entrada**: Feature em `src/features/comunicacoes/`
```
comunicacoes/
├── components/
│   ├── MessageList.tsx
│   └── MessageForm.tsx
└── pages/
    └── CommunicationsPage.tsx
```

**Saída**: Documentação automática
```markdown
# Comunicações

## Componentes
### MessageList
- **Tipo**: React Component
- **Props**: messages, onSelect, loading
- **Elementos UI**: tabela, filtros, botões
- **Complexidade**: Média

### MessageForm  
- **Tipo**: React Component
- **Props**: onSubmit, initialData
- **Elementos UI**: formulário, validação
- **Complexidade**: Baixa
```

## 🔍 Troubleshooting Rápido

### ❌ "Nenhuma feature encontrada"
**Solução**: Verifique se existe `src/features/` no seu projeto

### ❌ "Erro Git"
**Solução**: O sistema funciona sem Git, mas com menos funcionalidades

### ❌ "Componente não analisado"
**Solução**: Use `--debug` para ver detalhes do erro

## 🎯 Fluxo Recomendado

### 👨‍💻 Para Desenvolvedores
1. **Primeira vez**: `--config` → `--all`
2. **Desenvolvimento**: `--detect-changes` após cada feature
3. **Review de PR**: `--since main`

### 👩‍💼 Para Product Managers  
1. **Semanal**: `--all` para relatório completo
2. **Sprint Review**: `--since last-release`

### 🎨 Para Designers
1. **Auditoria UI**: `--all` com foco nos elementos detectados
2. **Design System**: Documentação regular dos componentes

## 📞 Ajuda Rápida

```bash
# Ajuda completa
node generate-feature-docs.js --help

# Modo debug para problemas
node generate-feature-docs.js --debug --verbose

# Ver configurações atuais
node generate-feature-docs.js --show-config
```

## 🚀 Próximos Passos

Depois do quick start:
1. 📖 Leia o [Guia Completo](USER_GUIDE.md)
2. 🔧 Consulte o [Guia Técnico](TECHNICAL_GUIDE.md)  
3. 🧪 Execute os [Testes](../tests/test-suite-v3.js)

---

**🎉 Pronto! Em 5 minutos você já está documentando automaticamente!**
