#!/usr/bin/env node

// Teste de geração real de documentação

console.log("📚 TESTE DE GERAÇÃO REAL DE DOCUMENTAÇÃO");
console.log("=======================================");

const path = require("path");
const fs = require("fs").promises;

// Simular variáveis para modo debug
process.env.OPENAI_API_KEY = "test_key_for_local_testing";
process.env.TOKEN_GITHUB = "test_token_for_local_testing";
process.env.DEBUG_MODE = "true";

const FeatureDocumentationGenerator = require("./scripts/analyze-features.js");

async function testDocumentGeneration() {
  try {
    console.log("\n🚀 Gerando documentação da feature auth...");

    const generator = new FeatureDocumentationGenerator({ debug: true });
    const result = await generator.generateFeatureDocs();

    if (result.success && result.featureDocs) {
      console.log("\n📄 DOCUMENTAÇÃO GERADA:");
      console.log("======================");

      for (const featureDoc of result.featureDocs) {
        console.log(`\n🎯 Feature: ${featureDoc.name}`);
        console.log("📋 Estrutura:");
        console.log(JSON.stringify(featureDoc.structure, null, 2));

        console.log("\n📝 Documentação gerada:");
        console.log("────────────────────────");
        console.log(featureDoc.documentation);
        console.log("────────────────────────");

        // Salvar documentação em arquivo para verificar
        const outputPath = path.join(
          __dirname,
          `test-output-${featureDoc.name}.md`
        );
        await fs.writeFile(outputPath, featureDoc.documentation, "utf-8");
        console.log(`💾 Documentação salva em: ${outputPath}`);
      }
    }

    console.log("\n✅ TESTE DE GERAÇÃO CONCLUÍDO COM SUCESSO!");
    return true;
  } catch (error) {
    console.error("\n❌ ERRO:", error);
    return false;
  }
}

testDocumentGeneration().then((success) => {
  process.exit(success ? 0 : 1);
});
