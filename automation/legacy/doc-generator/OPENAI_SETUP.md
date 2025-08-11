# 🤖 Guia de Configuração OpenAI

## Como Ativar a Documentação Inteligente

### 1. Obter API Key da OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Vá em "API Keys"
4. Clique em "Create new secret key"
5. Copie a chave (começa com `sk-`)

### 2. Configurar no Sistema

**Opção A: Arquivo .env (Recomendado)**

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar e adicionar sua chave
OPENAI_API_KEY=sk-sua-chave-aqui
```

**Opção B: Variável de Ambiente**

```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY="sk-sua-chave-aqui"

# Linux/Mac
export OPENAI_API_KEY=sk-sua-chave-aqui
```

### 3. Personalizar Configuração

Edite `doc-generator/config/doc-config.json`:

```json
{
  "openai": {
    "enabled": true,
    "model": "gpt-4o-mini", // ou "gpt-4" para qualidade máxima
    "maxTokens": 2000, // limite de tokens por chamada
    "temperature": 0.3, // criatividade (0.0-1.0)
    "enhance": {
      "projectOverview": true, // ✅ Visão geral inteligente
      "apiDocumentation": true, // ✅ APIs com exemplos
      "componentDocumentation": true, // ✅ Componentes detalhados
      "architectureDocumentation": true, // ✅ Arquitetura explicada
      "generateReadmes": true, // ✅ READMEs completos
      "generateDiagrams": true // ✅ Diagramas Mermaid
    }
  }
}
```

## 🎯 O que Muda com OpenAI

### ❌ **Sem OpenAI** (Documentação Básica)

```markdown
# Project Overview

**Generated:** 2025-08-11T13:29:58.714Z
**Project:** template-default
**Type:** monorepo

## Technologies

- NestJS, Express, Prisma, TypeScript, React, Tailwind CSS

## Summary

- Total Projects: 5
- Architecture: monorepo
```

### ✅ **Com OpenAI** (Documentação Inteligente)

````markdown
# 🚀 Template Default - Full Stack Application Template

## 📖 Overview

This is a comprehensive monorepo template designed for rapid full-stack application development. It provides a solid foundation with modern technologies and best practices, allowing developers to focus on business logic rather than boilerplate configuration.

## ⚡ Key Features

- **Backend API**: Robust NestJS-based REST API with TypeScript
- **Frontend App**: Modern React application with Tailwind CSS
- **Database**: Prisma ORM for type-safe database operations
- **Documentation**: Automated documentation generation
- **Development Tools**: Complete development workflow setup

## 🏗️ Architecture

This monorepo follows a domain-driven design approach with clear separation of concerns:

- **Backend**: Handles business logic, data persistence, and API endpoints
- **Frontend**: Provides user interface and client-side functionality
- **Shared**: Common utilities and type definitions
- **Docs**: Comprehensive project documentation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup development environment
npm run dev

# Generate documentation
npm run docs
```
````

## 💡 Use Cases

- SaaS applications
- E-commerce platforms
- Content management systems
- API-first applications

````

### 📊 **Diagramas Automáticos**

Com OpenAI habilitado, são gerados diagramas Mermaid automaticamente:

```mermaid
graph TB
    A[Frontend React App] --> B[API Gateway]
    B --> C[Backend NestJS]
    C --> D[Database Prisma]
    C --> E[Authentication]
    C --> F[Business Logic]

    style A fill:#61dafb
    style C fill:#e0234e
    style D fill:#2d3748
````

## 💰 Custos Estimados

**gpt-4o-mini** (Recomendado):

- Projeto pequeno: ~$0.01-0.05 por geração
- Projeto médio: ~$0.05-0.15 por geração
- Projeto grande: ~$0.15-0.30 por geração

**gpt-4** (Qualidade máxima):

- ~10x mais caro que gpt-4o-mini
- Use apenas para documentação final/crítica

## 🔧 Troubleshooting

### "API Key inválida"

- Verifique se copiou a chave completa
- Confirme que não há espaços extras
- Teste a chave em: https://platform.openai.com/playground

### "Quota esgotada"

- Verifique seu limite em: https://platform.openai.com/usage
- Adicione créditos se necessário
- Use gpt-4o-mini para economizar

### "Documentação não melhorada"

- Confirme que `openai.enabled: true` no config
- Verifique os logs para erros específicos
- Teste com documentação menor primeiro

## 🎚️ Configurações Avançadas

### Modelo Personalizado

```json
{
  "openai": {
    "model": "gpt-4", // Qualidade máxima
    "maxTokens": 4000, // Documentação mais longa
    "temperature": 0.1 // Mais consistente
  }
}
```

### Melhorias Seletivas

```json
{
  "openai": {
    "enhance": {
      "projectOverview": true, // Apenas visão geral
      "apiDocumentation": false, // APIs básicas
      "componentDocumentation": false,
      "architectureDocumentation": true, // Apenas arquitetura
      "generateReadmes": false,
      "generateDiagrams": true // Apenas diagramas
    }
  }
}
```

---

## 🎉 Resultado Final

Com OpenAI configurado, você terá:

✅ **Documentação rica** com descrições inteligentes  
✅ **Exemplos práticos** de uso  
✅ **Diagramas automáticos** da arquitetura  
✅ **READMEs completos** para cada projeto  
✅ **Explicações técnicas** detalhadas  
✅ **Contexto relevante** para IA assistants

**Tempo de configuração:** 2 minutos  
**Benefício:** Documentação profissional em segundos
