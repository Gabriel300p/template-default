# 🧪 Testes do Sistema de Documentação

Este diretório contém uma suíte completa de testes para validar o funcionamento do sistema de documentação automática.

## 📋 Tipos de Teste Disponíveis

### 1. **Teste Rápido** - `test-quick.js`

```bash
npm run test:quick
# ou
node automation/test-quick.js
```

**Objetivo:** Verificação básica e rápida do sistema

- ✅ Arquivos principais presentes
- ✅ Configuração OpenAI
- ✅ Dependências instaladas
- ✅ Carregamento do sistema

**Tempo:** ~5 segundos

---

### 2. **Teste Completo** - `test-system.js`

```bash
npm run test
# ou
node automation/test-system.js
```

**Objetivo:** Validação completa do sistema

- 🔍 Verificação de arquivos necessários
- ⚙️ Validação da configuração
- 📦 Teste de dependências NPM
- 🤖 Teste da conexão OpenAI
- 📝 Execução da geração de documentação
- 🎯 Verificação da qualidade da documentação
- 📁 Teste de projeto separado (simulado)

**Tempo:** ~30-60 segundos

---

### 3. **Teste de Performance** - `test-performance.js`

```bash
npm run test:performance
# ou
node automation/test-performance.js
```

**Objetivo:** Análise de performance e uso de recursos

- ⏱️ Tempo de execução
- 💾 Monitoramento de memória
- 🤖 Performance das chamadas OpenAI
- 📊 Teste com projeto grande (simulado)
- 📈 Relatório detalhado de métricas

**Tempo:** ~2-5 minutos

---

### 4. **Teste OpenAI** - `test-openai.js`

```bash
npm run test:openai
# ou
node automation/test-openai.js
```

**Objetivo:** Teste isolado da integração OpenAI

- 🔑 Validação da API Key
- 🌐 Conectividade
- ⚡ Resposta básica
- 🎯 Qualidade das respostas

**Tempo:** ~10 segundos

## 🚀 Executando os Testes

### Execução Individual

```bash
# Teste rápido (recomendado para desenvolvimento)
npm run test:quick

# Teste completo (antes de commits importantes)
npm run test

# Teste de performance (análise de otimização)
npm run test:performance

# Teste OpenAI (verificar integração AI)
npm run test:openai
```

### Execução em Sequência

```bash
# Todos os testes (CI/CD)
npm run test:quick && npm run test && npm run test:performance
```

## 📊 Interpretando os Resultados

### ✅ Teste Passou

- Sistema funcionando corretamente
- Pode prosseguir com confiança

### ⚠️ Aviso (Warning)

- Funcionalidade opcional não disponível
- Sistema funciona, mas com limitações
- Ex: OpenAI não configurada (sistema funciona sem IA)

### ❌ Teste Falhou

- Problema crítico encontrado
- Sistema pode não funcionar corretamente
- Correção necessária antes de usar

## 🔧 Solução de Problemas Comuns

### Dependências Não Instaladas

```bash
cd automation
npm install
```

### OpenAI API Key Não Configurada

```bash
# Criar arquivo .env na pasta automation/
echo "OPENAI_API_KEY=sua-chave-aqui" > .env
```

### Arquivo .env com Encoding Errado (PowerShell)

```powershell
# Use Set-Content em vez de echo no PowerShell
Set-Content -Path ".env" -Value "OPENAI_API_KEY=sua-chave-aqui" -Encoding UTF8
```

### Permissões de Arquivo

```bash
# Linux/Mac
chmod +x *.js

# Windows: Execute como administrador se necessário
```

## 🏗️ Estrutura dos Testes

```
automation/
├── test-quick.js       # Teste rápido
├── test-system.js      # Teste completo
├── test-performance.js # Teste de performance
├── test-openai.js      # Teste OpenAI
└── README-TESTS.md    # Este arquivo
```

## 📈 Métricas de Qualidade

### Performance Esperada

- ⚡ **Carregamento:** < 1s
- 📝 **Geração docs:** < 30s (projeto médio)
- 💾 **Memória:** < 100MB (ideal)
- 🤖 **OpenAI calls:** < 500ms cada

### Indicadores de Saúde

- ✅ Taxa de sucesso: 100%
- ⏱️ Tempo resposta: Consistente
- 💾 Uso memória: Estável
- 🔄 Sem vazamentos de memória

## 🤖 Teste em Ambiente CI/CD

### GitHub Actions

```yaml
- name: Test Documentation System
  run: |
    cd automation
    npm install
    npm run test:quick
```

### Jenkins

```groovy
stage('Test Docs') {
  steps {
    dir('automation') {
      sh 'npm install'
      sh 'npm run test'
    }
  }
}
```

## 📋 Checklist de Qualidade

Antes de fazer deploy ou commit importante:

- [ ] ✅ `npm run test:quick` passou
- [ ] ✅ `npm run test` passou
- [ ] ✅ OpenAI configurada (se necessária)
- [ ] ✅ Documentação gerada com qualidade
- [ ] ✅ Performance dentro dos padrões
- [ ] ✅ Sem erros no console
- [ ] ✅ Estrutura de arquivos correta

## 🎯 Automatização Recomendada

### Pre-commit Hook

```json
{
  "pre-commit": ["npm run test:quick"]
}
```

### CI Pipeline

```yaml
test:
  - npm run test:quick # Always
  - npm run test # On main branch
  - npm run test:performance # Weekly
```

---

## 📞 Suporte

Se algum teste falhar consistentemente:

1. 🔍 Verifique os logs detalhados
2. 📋 Confirme que todas as dependências estão instaladas
3. 🔑 Valide configurações (OpenAI, paths, etc.)
4. 🧹 Limpe cache e reinstale dependências
5. 📞 Reporte o bug com logs completos

**Status do Sistema:** 🟢 Totalmente Operacional
