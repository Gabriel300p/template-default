#!/usr/bin/env node

/**
 * Teste Rápido - Verificação Básica do Sistema
 */

const fs = require("fs");
const path = require("path");

console.log("🧪 TESTE RÁPIDO - Sistema de Documentação\n");

// Teste 1: Arquivos principais
console.log("1️⃣ Verificando arquivos principais...");
const mainFiles = ["doc-generator/main.js", "generate-docs.js", "package.json"];

let filesOk = true;
mainFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? "✅" : "❌"} ${file}`);
  if (!exists) filesOk = false;
});

// Teste 2: OpenAI
console.log("\n2️⃣ Verificando configuração OpenAI...");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const hasOpenAI = !!process.env.OPENAI_API_KEY;
console.log(
  `   ${hasOpenAI ? "✅" : "⚠️"} OpenAI API Key ${hasOpenAI ? "configurada" : "não encontrada"}`
);

// Teste 3: Dependências
console.log("\n3️⃣ Verificando dependências...");
let depsOk = true;
const requiredDeps = ["openai", "dotenv", "@octokit/rest"];
requiredDeps.forEach((dep) => {
  try {
    require.resolve(dep);
    console.log(`   ✅ ${dep}`);
  } catch {
    console.log(`   ❌ ${dep} (não instalada)`);
    depsOk = false;
  }
});

// Teste 4: Teste simples de execução
console.log("\n4️⃣ Testando execução básica...");
try {
  const DocGenerator = require("./doc-generator/main.js");
  const generator = new DocGenerator({
    projectRoot: path.join(__dirname, ".."),
    outputPath: path.join(__dirname, "..", "docs"),
  });
  console.log("   ✅ Sistema carregou sem erros");
} catch (error) {
  console.log(`   ❌ Erro ao carregar sistema: ${error.message}`);
  filesOk = false;
}

// Resultado
console.log("\n" + "=".repeat(40));
if (filesOk && depsOk) {
  console.log("✅ SISTEMA OK - Pronto para usar!");
  console.log("\n📋 Para executar:");
  console.log("   node automation/generate-docs.js");
  console.log("\n🧪 Para teste completo:");
  console.log("   node automation/test-system.js");
} else {
  console.log("❌ SISTEMA COM PROBLEMAS");
  if (!filesOk) console.log("   • Arquivos principais ausentes");
  if (!depsOk) console.log("   • Dependências não instaladas (npm install)");
}
console.log("=".repeat(40));
