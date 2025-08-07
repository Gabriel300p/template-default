# 🎯 Sistema de Documentação de Features

## 📋 Visão Geral

Sistema automatizado para gerar documentação de features React/TypeScript na Wiki do GitHub. Focado em simplicidade, performance e documentação de qualidade.

## 🚀 Como Funciona

### Trigger Automático
- ✅ **Push na main** com alterações em `frontend/src/features/**`
- ✅ **Execução manual** via GitHub Actions

### Processo de Documentação
1. 🔍 **Detecta features alteradas** baseado nos arquivos modificados
2. 📊 **Analisa estrutura** (components, hooks, pages, services, schemas)
3. 🤖 **Gera documentação** usando OpenAI com contexto da feature
4. 📚 **Atualiza Wiki** com páginas organizadas por feature
5. 🗂️ **Cria índice** automático de todas as features

## 📁 Estrutura

```
docs-automation/
├── scripts/
│   ├── analyze-features.js      # Orquestrador principal
│   └── utils/
│       ├── feature-analyzer.js  # Análise de estrutura
│       ├── openai-client.js     # Cliente OpenAI (reutilizado)
│       └── github-client.js     # Cliente GitHub (reutilizado)
├── templates/
│   └── feature-documentation.md # Template das páginas
├── logs/                        # Logs de execução
└── package.json                 # Dependências mínimas
```

## 🎨 Template de Documentação

Cada feature gera uma página wiki com:

- 📋 **Visão Geral**: Propósito e funcionalidades
- 🎨 **Interface**: Componentes e fluxo de navegação  
- ⚙️ **Implementação**: Estrutura técnica e dependências
- 📊 **Dados**: Schemas, types e gerenciamento de estado
- 🔌 **Integrações**: APIs e serviços utilizados
- 🧪 **Testes**: Cobertura e casos de teste
- 📱 **Responsividade**: Considerações mobile
- ♿ **Acessibilidade**: Features inclusivas

## 🔧 Configuração

### Secrets Necessárias
- `OPENAI_API_KEY`: Chave da OpenAI
- `TOKEN_GITHUB`: Token para acesso à Wiki

### Execução Manual
1. Acesse **Actions** no GitHub
2. Selecione "📚 Documentação de Features"  
3. Clique "Run workflow"
4. Opcionalmente especifique uma feature

## 📊 Exemplo de Feature

Para a feature `comunicacoes`:

```
frontend/src/features/comunicacoes/
├── components/     # 5 arquivos
├── hooks/         # 3 arquivos  
├── pages/         # 1 arquivo
├── services/      # 2 arquivos
├── schemas/       # 1 arquivo
└── index.ts       # Barrel export
```

**Gera**: [Feature-comunicacoes](../../wiki/Feature-comunicacoes)

## 🆚 vs Sistema Legacy

| Aspecto | Features (Novo) | Legacy (Backup) |
|---------|----------------|-----------------|
| **Foco** | Features específicas | Projeto completo |
| **Trigger** | Apenas features alteradas | Qualquer alteração |
| **Performance** | ~2-3 min | ~10-15 min |
| **Saída** | Wiki organizada | Wiki + Issues |
| **Manutenção** | Automática por feature | Manual |

## 🎯 Roadmap

- [ ] **Detecção de dependências** entre features
- [ ] **Geração de diagramas** de fluxo automática  
- [ ] **Análise de performance** por feature
- [ ] **Integração com Storybook** para componentes
- [ ] **Métricas de uso** das features

## 🐛 Troubleshooting

### Feature não documentada
- Verifique se há alterações em `frontend/src/features/[nome]/`
- Confirme que o workflow foi executado
- Verifique logs nos Artifacts

### Erro de IA
- Confirme OPENAI_API_KEY
- Arquivo muito grande (>2000 chars é truncado)
- Rate limit da OpenAI

### Erro de Wiki  
- Confirme TOKEN_GITHUB com permissões de wiki
- Verifique se repository tem wiki habilitada

---
*Sistema criado reutilizando e otimizando o código existente*
