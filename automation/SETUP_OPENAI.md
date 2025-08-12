# 🚀 GUIA DE CONFIGURAÇÃO OPENAI

## 📋 Pré-requisitos

- Node.js v22.15.1+
- Conta OpenAI com créditos disponíveis

## 🔑 1. Obter API Key OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Copie a key que começa com `sk-...`

## ⚙️ 2. Configurar Ambiente

### Opção A: Arquivo .env (Recomendado)

```bash
# Na pasta automation/
copy .env.example .env
```

Edite o arquivo `.env` e substitua:

```bash
OPENAI_API_KEY=sk-sua-api-key-aqui
```

### Opção B: Variável de Sistema (Windows)

```powershell
$env:OPENAI_API_KEY = "sk-sua-api-key-aqui"
```

## 🧪 3. Testar Configuração

Execute o teste:

```bash
cd automation
node generate-feature-docs.js
```

Se configurado corretamente, você verá:

```
🤖 Gerando com OpenAI...
```

## 📊 4. Modelos Disponíveis

- `gpt-4o-mini` (Rápido e econômico) ✅ Recomendado
- `gpt-4o` (Mais preciso, mais caro)
- `gpt-3.5-turbo` (Econômico)

## 💰 5. Estimativa de Custos

Para documentação típica:

- **gpt-4o-mini**: ~$0.01 por feature
- **gpt-4o**: ~$0.05 por feature

## 🔧 6. Configurações Avançadas

Edite `automation/feature-docs/config/settings.js`:

```javascript
ai: {
  enabled: true,
  model: 'gpt-4o-mini',
  maxTokens: 3000,      // ⬆️ Mais detalhado
  temperature: 0.1      // ⬇️ Mais consistente
}
```

## 🎯 7. Workflow Completo

1. **Configure API**: Coloque sua key no .env
2. **Escolha features**: Selecione quais documentar
3. **Selecione template**: Técnico, Usuário, etc.
4. **IA gera docs**: Documentação rica e detalhada
5. **Revisão**: Edite se necessário

## ❌ Troubleshooting

### "OpenAI_API_KEY não configurada"

- ✅ Verifique se o arquivo .env existe
- ✅ Confirme que a key está correta
- ✅ Reinicie o terminal

### "IA falhou, usando método básico"

- ✅ Verifique créditos na conta OpenAI
- ✅ Tente um modelo diferente (gpt-3.5-turbo)
- ✅ Reduza maxTokens para 2000

### Documentação muito genérica

- ✅ Configure OpenAI corretamente
- ✅ Escolha template específico (technical, user)
- ✅ Aumente temperature para 0.5-0.7

## 🎉 Resultado Esperado

Com OpenAI configurado, você terá:

- 📝 Documentação rica e contextualizada
- 🎯 Adaptada ao público-alvo escolhido
- 🔍 Análise detalhada dos componentes
- 💡 Exemplos de uso práticos
- 🏗️ Arquitetura e padrões explicados
