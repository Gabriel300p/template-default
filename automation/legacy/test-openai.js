#!/usr/bin/env node

// Teste simples para verificar se OpenAI está funcionando
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const OpenAI = require("openai");

async function testOpenAI() {
  console.log("🧪 Testando configuração OpenAI...\n");

  // Verificar variável de ambiente
  const apiKey = process.env.OPENAI_API_KEY;
  console.log(`📋 API Key encontrada: ${apiKey ? "Sim" : "Não"}`);

  if (!apiKey) {
    console.log("❌ Nenhuma API Key encontrada em .env");
    console.log(
      "   Verifique se o arquivo .env existe e contém OPENAI_API_KEY"
    );
    return;
  }

  console.log(
    `🔑 API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`
  );

  // Testar conexão
  try {
    console.log("\n🔌 Testando conexão com OpenAI...");

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: 'Diga apenas "OpenAI funcionando!" em uma única linha.',
        },
      ],
      max_tokens: 10,
    });

    const result = response.choices[0]?.message?.content;
    console.log("✅ Resposta da OpenAI:", result);
    console.log("🎉 OpenAI configurado corretamente!");
  } catch (error) {
    console.log("❌ Erro ao conectar com OpenAI:");
    console.log("   Código:", error.code);
    console.log("   Mensagem:", error.message);

    if (error.code === "invalid_api_key") {
      console.log("\n💡 Possíveis soluções:");
      console.log("   1. Verificar se a API Key está correta");
      console.log("   2. Confirmar que a chave não expirou");
      console.log("   3. Verificar se há créditos na conta OpenAI");
    }
  }
}

testOpenAI().catch(console.error);
