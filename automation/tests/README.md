# 🧪 Testes do Sistema de Documentação

Esta pasta contém todos os arquivos de teste e debug do sistema.

## 📁 Arquivos de Teste

### **Testes Funcionais**
- `test-final.js` - Teste completo do sistema
- `test-production.js` - Teste com OpenAI real
- `test-openai.js` - Teste específico da API OpenAI
- `test-github.js` - Teste específico da API GitHub

### **Debug e Desenvolvimento**
- `debug-files.js` - Debug de detecção de arquivos
- `debug-filter.js` - Debug dos filtros glob
- `quick-test.js` - Testes rápidos

## 🚀 Como Executar

### **Teste Básico (Mock)**
```bash
npm run analyze:test
```

### **Teste Completo (Produção)**
```bash
node tests/test-final.js
```

### **Testes Específicos**
```bash
# Testar OpenAI
node tests/test-openai.js

# Testar GitHub
node tests/test-github.js

# Debug filtros
node tests/debug-filter.js
```

## 📊 Status dos Testes

- ✅ **test-final.js** - Sistema completo funcionando
- ✅ **test-openai.js** - API OpenAI conectando
- ✅ **test-github.js** - API GitHub conectando
- ✅ **debug-filter.js** - Filtros funcionando

---
*Testes organizados para desenvolvimento e debug*
