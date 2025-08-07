require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAI() {
  try {
    console.log('🤖 Testando OpenAI API...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OPENAI_API_KEY não configurada');
      return;
    }
    
    const client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    console.log('📡 Enviando request mínimo...');
    
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user', 
        content: 'Responda apenas: "API OK"' 
      }],
      max_tokens: 5,
      temperature: 0
    });
    
    console.log('✅ OpenAI funcionando!');
    console.log('📝 Resposta:', response.choices[0].message.content);
    console.log('💰 Tokens usados:', response.usage);
    
    // Calcular custo aproximado
    const inputCost = (response.usage.prompt_tokens / 1000) * 0.0015;
    const outputCost = (response.usage.completion_tokens / 1000) * 0.002;
    const totalCost = inputCost + outputCost;
    
    console.log('💵 Custo aproximado: $' + totalCost.toFixed(6));
    
  } catch (error) {
    console.log('❌ Erro OpenAI:', error.message);
    
    if (error.status === 429) {
      console.log('⚠️  Quota esgotada ou rate limit');
      console.log('   - Verifique: https://platform.openai.com/usage');
      console.log('   - Aguarde ou adicione créditos');
    } else if (error.status === 401) {
      console.log('⚠️  Problema de autenticação');
      console.log('   - Verifique se a chave está correta');
    } else {
      console.log('   Status:', error.status);
      console.log('   Tipo:', error.type);
    }
  }
}

testOpenAI();
