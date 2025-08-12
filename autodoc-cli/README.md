# 🤖 AutoDoc CLI

> **Sistema Inteligente de Documentação Automática** com análise AST e IA

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://npmjs.com/package/autodoc-cli)
[![Node](https://img.shields.io/badge/node-%3E%3D16-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 **O Que É?**

**AutoDoc CLI** é uma ferramenta de linha de comando que **automatiza completamente** a geração de documentação para projetos de software. Combina:

- 🔍 **Análise AST profunda** - Entende seu código estruturalmente
- 🧠 **Inteligência Artificial** - OpenAI GPT para conteúdo inteligente
- 📝 **Templates flexíveis** - Documentação personalizada
- ⚡ **Setup em 5 minutos** - Zero configuração inicial

## ✨ **Principais Features**

### 🎯 **Para Desenvolvedores**
- ✅ Análise de **TypeScript, JavaScript, Python**
- ✅ Detecção automática de **componentes, funções, classes**
- ✅ **Zero configuração** - funciona out-of-the-box
- ✅ **Docs-as-code** - integração perfeita com Git

### 🤖 **Para Equipes**
- ✅ **CLI interativa** - configuração guiada
- ✅ **Templates customizáveis** - para diferentes audiências
- ✅ **Geração com IA** - conteúdo inteligente e contextual
- ✅ **Multi-formato** - Markdown, HTML (futuro: PDF)

## 🚀 **Quick Start (5 minutos)**

### **1. Instalação Global**
```bash
npm install -g autodoc-cli
```

### **2. Inicialização**
```bash
# Navegar para seu projeto
cd meu-projeto

# Configurar AutoDoc
autodoc init
```

### **3. Gerar Documentação**
```bash
# Geração interativa
autodoc generate

# Ou usando configuração existente
autodoc generate -c .autodoc.yml
```

### **4. Resultado**
```
📄 Documentação gerada com sucesso!
  ➜ docs/README.md
  ➜ docs/COMPONENTS.md  
  ➜ docs/API.md
  ➜ docs/ARCHITECTURE.md
```

## 📋 **Comandos Disponíveis**

### **🔧 Configuração**
```bash
autodoc init                    # Inicializar configuração
autodoc init --template react   # Template específico
autodoc config --show          # Ver configuração atual
autodoc config --set ai.enabled=true  # Definir configuração
```

### **📝 Geração**
```bash
autodoc generate               # Modo interativo
autodoc generate --no-ai       # Sem IA
autodoc generate --template api # Template específico
autodoc generate -v            # Modo verbose
```

### **🔍 Análise**
```bash
autodoc analyze               # Analisar sem gerar docs
autodoc analyze --stats       # Com estatísticas detalhadas
autodoc analyze -d ./lib      # Diretório específico
```

### **📝 Templates**
```bash
autodoc template --list      # Listar templates
autodoc template --create custom # Criar template
```

## ⚙️ **Configuração**

### **Arquivo .autodoc.yml**
```yaml
project:
  name: "Meu Projeto"
  language: "typescript"
  sourceDir: "./src"
  outputDir: "./docs"

generation:
  template: "standard"
  format: "markdown"
  includePrivate: false
  includeTests: false

ai:
  enabled: true
  model: "gpt-4o-mini"
  maxTokens: 2000

exclude:
  - "node_modules"
  - "dist"
  - "build"
```

### **Templates Disponíveis**

| Template | Descrição | Ideal Para |
|----------|-----------|------------|
| `standard` | Documentação completa | Projetos gerais |
| `simple` | README básico | Projetos pequenos |
| `api` | Foco em APIs | Backend/APIs |
| `components` | Foco em UI | Frontend/Componentes |

## 🧠 **Integração com IA**

### **Configurar OpenAI**
```bash
# Variável de ambiente
export OPENAI_API_KEY="sua-chave-aqui"

# Ou no .autodoc.yml
ai:
  enabled: true
  apiKey: "sua-chave-aqui"
  model: "gpt-4o-mini"
```

### **Modelos Suportados**
- 🚀 **gpt-4o-mini** - Rápido e econômico (recomendado)
- 🧠 **gpt-4o** - Mais inteligente
- ⚡ **gpt-4-turbo** - Balanceado

## 🎯 **Linguagens Suportadas**

### **✅ Totalmente Suportado**
- **TypeScript** - Análise completa de tipos, interfaces, componentes
- **JavaScript** - ES6+, React, Node.js
- **React/JSX** - Componentes, props, hooks

### **🔧 Suporte Básico**
- **Python** - Classes, funções, imports
- **Vue.js** - Componentes SFC

### **🚀 Próximas Versões**
- Java, C#, Go, Rust
- Angular, Svelte
- Django, FastAPI

## 📊 **Exemplos de Saída**

### **Análise de Componente React**
```markdown
## ButtonComponent

**Arquivo:** `src/components/Button.tsx`
**Tipo:** React Component

### Props
- **variant** (string): Estilo do botão (primary, secondary)
- **size** (string): Tamanho (sm, md, lg)
- **onClick** (function): Função executada no clique

### Hooks Utilizados
- `useState` - Gerenciamento de estado local
- `useCallback` - Otimização de performance

*Gerado automaticamente por AutoDoc CLI*
```

### **Estatísticas de Projeto**
```
📊 Resultado da Análise:
📁 Arquivos encontrados: 47
⚛️  Componentes: 12
🔧 Funções: 34
📘 Classes: 8

📈 Estatísticas Detalhadas:
  Tempo de análise: 1.2s
  Tokens IA utilizados: 1,847
  Custo estimado: $0.003
```

## 🔧 **Casos de Uso**

### **🆕 Projeto Novo**
```bash
cd novo-projeto
autodoc init --template react
autodoc generate
git add docs/
git commit -m "docs: adicionar documentação automática"
```

### **📚 Projeto Existente**
```bash
# Analisar primeiro
autodoc analyze --stats

# Configurar
autodoc init

# Gerar documentação
autodoc generate --template api
```

### **🔄 Atualização Contínua**
```bash
# Em um script de CI/CD
autodoc generate --no-ai -c .autodoc.yml
```

## 🛠️ **Desenvolvimento Local**

### **Instalação para Desenvolvimento**
```bash
git clone https://github.com/Gabriel300p/autodoc-cli.git
cd autodoc-cli
npm install
npm link  # Instalar globalmente
```

### **Estrutura do Projeto**
```
autodoc-cli/
├── src/
│   ├── cli.js              # CLI principal
│   ├── core/
│   │   ├── autodoc-engine.js    # Motor de análise
│   │   ├── project-detector.js  # Detector de projeto
│   │   └── code-scanner.js      # Scanner de código
│   ├── analyzers/
│   │   └── component-analyzer.js # Análise de componentes
│   ├── generators/
│   │   └── documentation-generator.js # Gerador de docs
│   └── config/
│       └── config-manager.js     # Gerenciador de config
├── templates/           # Templates de documentação
└── bin/
    └── autodoc.js      # Executável global
```

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 **Agradecimentos**

- **OpenAI** - Por tornar IA acessível
- **Comunidade Open Source** - Por ferramentas incríveis como Tree-sitter
- **Desenvolvedores** - Por feedback e contribuições

---

<div align="center">

**🤖 Feito com ❤️ por desenvolvedores, para desenvolvedores**

[Website](https://autodoc-cli.com) • [Documentação](https://docs.autodoc-cli.com) • [GitHub](https://github.com/Gabriel300p/autodoc-cli)

</div>
