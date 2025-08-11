# Documentation Generator

Um sistema automatizado para gerar documentação de projetos, com **integração OpenAI** para documentação avançada e inteligente.

## Características

- 🔍 **Detecção Automática**: Identifica automaticamente a estrutura do projeto (monorepo vs projeto único)
- 📝 **Múltiplos Formatos**: Gera documentação em formato markdown e JSON
- 🤖 **IA Integrada**: Usa OpenAI para melhorar e enriquecer a documentação
- 📊 **Diagramas Automáticos**: Gera diagramas Mermaid da arquitetura
- 🎯 **Três Audiências**:
  - **Desenvolvedores**: READMEs detalhados e documentação técnica
  - **IA**: Contexto estruturado para assistentes de código
  - **Export**: Formato otimizado para Wiki/Clickup
- 🏗️ **Análise Abrangente**: APIs, componentes, arquitetura e dependências
- 🔧 **Configurável**: Sistema de configuração flexível

## Estrutura

```
doc-generator/
├── main.js                 # Orchestrador principal
├── config/
│   └── doc-config.json    # Configuração
└── generators/
    ├── api-docs.js        # Documentação de APIs (backend)
    ├── component-docs.js  # Documentação de componentes (frontend)
    └── architecture.js    # Análise de arquitetura (geral)
```

## Como Usar

### Instalação

```bash
cd automation
npm install

# Configurar OpenAI (opcional, para documentação avançada)
cp .env.example .env
# Editar .env e adicionar sua OPENAI_API_KEY
```

### Configuração OpenAI

Para documentação avançada com IA, configure sua API key:

```bash
# Opção 1: Arquivo .env
echo "OPENAI_API_KEY=sk-sua-chave-aqui" > .env

# Opção 2: Variável de ambiente
export OPENAI_API_KEY=sk-sua-chave-aqui

# Opção 3: No arquivo de configuração
# Edite doc-generator/config/doc-config.json
```

**Sem OpenAI:** O sistema funciona normalmente, gerando documentação básica mas funcional.  
**Com OpenAI:** A documentação é enriquecida com descrições inteligentes, exemplos e diagramas.

### Uso Básico

```bash
# Executar o gerador
npm run generate-docs

# Ou diretamente
node doc-generator/main.js
```

### Saídas Geradas

O sistema cria três diretórios de saída:

#### `docs/dev/` - Para Desenvolvedores

- `PROJECT_OVERVIEW.md` - Visão geral do projeto (🤖 melhorada com IA)
- `README_ENHANCED.md` - README completo gerado por IA
- `API_[PROJECT].md` - Documentação de APIs (🤖 melhorada com IA)
- `COMPONENTS_[PROJECT].md` - Documentação de componentes (🤖 melhorada com IA)
- `ARCHITECTURE_[PROJECT].md` - Análise da arquitetura (🤖 com diagramas)

#### `docs/ai/` - Para IA

- `project-context.json` - Contexto geral estruturado
- `api-[project].json` - APIs em formato JSON
- `components-[project].json` - Componentes em formato JSON
- `architecture-[project].json` - Arquitetura em formato JSON

#### `docs/export/` - Para Export

- `overview.md` - Visão geral para wiki
- `[project]-api.md` - APIs formatadas para export
- `[project]-components.md` - Componentes formatadas para export
- `[project]-architecture.md` - Arquitetura formatada para export

## Configuração

Edite `config/doc-config.json` para personalizar:

```json
{
  "output": {
    "dev": "docs/dev",
    "ai": "docs/ai",
    "export": "docs/export"
  },
  "generators": {
    "api": true,
    "components": true,
    "architecture": true
  },
  "openai": {
    "enabled": true,
    "model": "gpt-4o-mini",
    "enhance": {
      "projectOverview": true,
      "apiDocumentation": true,
      "componentDocumentation": true,
      "architectureDocumentation": true,
      "generateReadmes": true,
      "generateDiagrams": true
    }
  },
  "includePatterns": ["**/*.ts", "**/*.js", "**/*.jsx", "**/*.tsx", "**/*.vue"],
  "excludePatterns": ["node_modules/**", "dist/**", "build/**"]
}
```

## Detecção Automática

### Tipos de Projeto

- **Backend**: Detecta NestJS, Express, Fastify
- **Frontend**: Detecta React, Vue, Angular
- **Monorepo**: Detecta múltiplas pastas com package.json

### Tecnologias Suportadas

#### Backend (API Documentation)

- ✅ NestJS com decorators (@Controller, @Get, etc.)
- ✅ Express.js com arquivos de rota
- ✅ Models, DTOs e interfaces TypeScript
- ✅ Swagger/OpenAPI integration

#### Frontend (Component Documentation)

- ✅ React (.jsx, .tsx)
- ✅ Vue.js (.vue)
- ✅ Props, events, slots
- ✅ Custom hooks
- ✅ Utility functions

#### Geral (Architecture Documentation)

- ✅ Estrutura de pastas
- ✅ Dependencies analysis
- ✅ Padrões arquiteturais
- ✅ Tecnologias utilizadas

## Exemplo de Uso em Template

Este sistema é especialmente útil para templates que serão separados:

1. **Durante desenvolvimento do template**: Gera documentação completa
2. **Após separação**: Cada projeto mantém seu próprio sistema de documentação
3. **Manutenção**: Updates automáticos quando código muda

## Scripts NPM Recomendados

Adicione ao `package.json`:

```json
{
  "scripts": {
    "docs": "node automation/doc-generator/main.js",
    "docs:watch": "nodemon --watch src --exec \"npm run docs\"",
    "docs:dev": "npm run docs && echo 'Documentação gerada em docs/dev/'",
    "docs:export": "npm run docs && echo 'Pronto para export em docs/export/'"
  }
}
```

## Roadmap

- [ ] Geração de diagramas Mermaid
- [ ] Integration com GitHub Wiki
- [ ] Support para mais frameworks
- [ ] Análise de performance
- [ ] Integração com CI/CD
- [ ] Templates personalizáveis

## Troubleshooting

### Problemas Comuns

1. **Não encontra arquivos**: Verifique os padrões em `includePatterns`
2. **Erro de parsing**: Confirme que os arquivos têm sintaxe válida
3. **Diretórios não criados**: Verifique permissões de escrita

### Debug

Execute com logs detalhados:

```bash
DEBUG=doc-generator node doc-generator/main.js
```

---

_Sistema desenvolvido para facilitar a manutenção de documentação em projetos template_
