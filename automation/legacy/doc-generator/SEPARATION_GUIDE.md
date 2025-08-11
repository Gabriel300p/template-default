# Como Usar o Sistema de Documentação em Projetos Separados

Quando você separar o template em projetos individuais, você pode manter o sistema de documentação funcionando. Aqui está como:

## 1. Para Projetos Backend (separados)

```bash
# Copiar o gerador para o projeto backend
cp -r template-default/automation/doc-generator ./
cp template-default/automation/generate-docs.js ./
cp template-default/automation/package.json ./doc-generator/

# Instalar dependências se necessário
cd doc-generator && npm install && cd ..

# Gerar documentação
node generate-docs.js
```

## 2. Para Projetos Frontend (separados)

```bash
# Copiar o gerador para o projeto frontend
cp -r template-default/automation/doc-generator ./
cp template-default/automation/generate-docs.js ./

# Gerar documentação
node generate-docs.js
```

## 3. Automatizar com NPM Scripts

Adicione ao `package.json` do projeto separado:

```json
{
  "scripts": {
    "docs": "node generate-docs.js",
    "docs:watch": "nodemon --watch src --exec \"npm run docs\"",
    "docs:dev": "npm run docs && echo 'Docs geradas em docs/dev/'",
    "docs:export": "npm run docs && echo 'Prontas para export em docs/export/'"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

## 4. Configuração por Projeto

Cada projeto pode ter sua própria configuração editando `doc-generator/config/doc-config.json`:

### Backend

```json
{
  "generators": {
    "api": true,
    "components": false,
    "architecture": true
  },
  "api": {
    "scanDecorators": ["@Controller", "@Get", "@Post", "@Put", "@Delete"],
    "includeSwagger": true
  }
}
```

### Frontend

```json
{
  "generators": {
    "api": false,
    "components": true,
    "architecture": true
  },
  "components": {
    "scanPatterns": ["**/*.tsx", "**/*.jsx"],
    "includeProps": true,
    "includeHooks": true
  }
}
```

## 5. Integração com CI/CD

### GitHub Actions

```yaml
name: Generate Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Generate documentation
        run: npm run docs

      - name: Upload documentation
        uses: actions/upload-artifact@v3
        with:
          name: documentation
          path: docs/
```

## 6. Uso com Git Hooks

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Gerar documentação antes do commit
npm run docs

# Adicionar documentação ao commit se houver mudanças
git add docs/
```

## 7. Configuração para Diferentes Ambientes

### Desenvolvimento

```bash
npm run docs:dev
# Gera apenas documentação essencial, mais rápido
```

### Produção

```bash
npm run docs:export
# Gera documentação completa para export
```

## 8. Troubleshooting

### Problema: "Gerador não encontrado"

**Solução:** Certifique-se de que copiou a pasta `doc-generator/` para o projeto

### Problema: "Nenhum arquivo encontrado"

**Solução:** Verifique os padrões em `doc-generator/config/doc-config.json`

### Problema: "Erro de parsing"

**Solução:** Verifique se os arquivos de código têm sintaxe válida

## 9. Manutenção

Para atualizar o sistema de documentação:

1. **Template atualizado:** Copie a nova versão do `doc-generator/`
2. **Melhorias:** Edite os arquivos em `doc-generator/generators/`
3. **Configuração:** Ajuste `doc-generator/config/doc-config.json`

## 10. Exemplo de Estrutura Final

```
meu-projeto-backend/
├── src/
├── docs/           # Gerado automaticamente
│   ├── dev/
│   ├── ai/
│   └── export/
├── doc-generator/  # Copiado do template
├── generate-docs.js
├── package.json
└── README.md
```

---

_Este sistema permite que cada projeto mantenha sua documentação atualizada automaticamente, mesmo após separação do template original._
