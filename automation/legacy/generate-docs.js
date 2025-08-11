#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Detectar se estamos em um projeto separado ou no template
const isInTemplate = fs.existsSync("./automation/doc-generator/main.js");
const isInSeparatedProject = fs.existsSync("./doc-generator/main.js");

let generatorPath;
let workingDir = process.cwd();

if (isInTemplate) {
  // Estamos no template completo
  generatorPath = "./automation/doc-generator/main.js";
  console.log("🎯 Detectado: Template completo");
} else if (isInSeparatedProject) {
  // Estamos em um projeto separado que copiou o gerador
  generatorPath = "./doc-generator/main.js";
  console.log("🎯 Detectado: Projeto separado");
} else {
  // Procurar o gerador em diretórios superiores ou instalar
  console.log("❌ Gerador de documentação não encontrado!");
  console.log("");
  console.log("Para usar o gerador de documentação:");
  console.log("");
  console.log("1. Se este é um projeto separado do template:");
  console.log("   - Copie a pasta automation/doc-generator/ para seu projeto");
  console.log("   - Execute novamente este comando");
  console.log("");
  console.log("2. Se este é o template completo:");
  console.log("   - Execute o comando no diretório raiz do template");
  console.log("");
  process.exit(1);
}

try {
  console.log("📚 Gerando documentação...");
  execSync(`node ${generatorPath}`, {
    stdio: "inherit",
    cwd: workingDir,
  });

  console.log("");
  console.log("✅ Documentação gerada com sucesso!");
  console.log("");
  console.log("📄 Arquivos gerados:");
  console.log("   docs/dev/     - Documentação para desenvolvedores");
  console.log("   docs/ai/      - Contexto estruturado para IA");
  console.log("   docs/export/  - Formato para Wiki/Clickup");
} catch (error) {
  console.error("❌ Erro ao gerar documentação:", error.message);
  process.exit(1);
}
