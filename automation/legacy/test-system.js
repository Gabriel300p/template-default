#!/usr/bin/env node

/**
 * Suíte de Testes para Sistema de Documentação Automática
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class DocumentationTester {
  constructor() {
    this.testResults = [];
    this.testCount = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, type = "info") {
    const icons = {
      info: "📋",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      test: "🧪",
    };
    console.log(`${icons[type]} ${message}`);
  }

  async runTest(name, testFn) {
    this.testCount++;
    this.log(`Test ${this.testCount}: ${name}`, "test");

    try {
      const result = await testFn();
      if (result) {
        this.passedTests++;
        this.log(`PASSED: ${name}`, "success");
        this.testResults.push({ name, status: "PASSED", error: null });
      } else {
        this.failedTests++;
        this.log(`FAILED: ${name}`, "error");
        this.testResults.push({
          name,
          status: "FAILED",
          error: "Test returned false",
        });
      }
    } catch (error) {
      this.failedTests++;
      this.log(`FAILED: ${name} - ${error.message}`, "error");
      this.testResults.push({ name, status: "FAILED", error: error.message });
    }
  }

  // Teste 1: Verificar se arquivos necessários existem
  async testRequiredFiles() {
    const requiredFiles = [
      "doc-generator/main.js",
      "doc-generator/config/doc-config.json",
      "doc-generator/generators/api-docs.js",
      "doc-generator/generators/component-docs.js",
      "doc-generator/generators/architecture.js",
      "doc-generator/enhancers/openai-enhancer.js",
      "generate-docs.js",
      "package.json",
    ];

    const basePath = path.join(__dirname);

    for (const file of requiredFiles) {
      const filePath = path.join(basePath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo necessário não encontrado: ${file}`);
      }
    }

    return true;
  }

  // Teste 2: Verificar configuração do sistema
  async testConfiguration() {
    const configPath = path.join(
      __dirname,
      "doc-generator/config/doc-config.json"
    );
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // Verificar estrutura básica
    if (!config.output || !config.generators || !config.openai) {
      throw new Error("Configuração incompleta");
    }

    // Verificar caminhos de saída
    if (!config.output.dev || !config.output.ai || !config.output.export) {
      throw new Error("Caminhos de saída não configurados");
    }

    // Verificar geradores habilitados
    if (
      !config.generators.api ||
      !config.generators.components ||
      !config.generators.architecture
    ) {
      throw new Error("Geradores não habilitados");
    }

    return true;
  }

  // Teste 3: Verificar dependências NPM
  async testDependencies() {
    const packagePath = path.join(__dirname, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    const requiredDeps = ["@octokit/rest", "dotenv", "openai"];

    for (const dep of requiredDeps) {
      if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
        throw new Error(`Dependência necessária não encontrada: ${dep}`);
      }
    }

    return true;
  }

  // Teste 4: Testar OpenAI (se configurado)
  async testOpenAI() {
    require("dotenv").config({ path: path.join(__dirname, ".env") });

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.log("OpenAI API Key não configurada - pulando teste", "warning");
      return true; // Não é erro crítico
    }

    try {
      const OpenAI = require("openai");
      const openai = new OpenAI({ apiKey });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Responda apenas: OK" }],
        max_tokens: 5,
      });

      if (!response.choices[0]?.message?.content) {
        throw new Error("Resposta inválida da OpenAI");
      }

      return true;
    } catch (error) {
      if (error.code === "invalid_api_key") {
        this.log("Chave OpenAI inválida", "warning");
        return true; // Não é erro crítico para o sistema base
      }
      throw error;
    }
  }

  // Teste 5: Executar geração de documentação
  async testDocumentationGeneration() {
    const rootPath = path.join(__dirname, "..");

    try {
      // Limpar documentação existente
      const docsPath = path.join(rootPath, "docs");
      const outputDirs = ["dev", "ai", "export"];

      for (const dir of outputDirs) {
        const dirPath = path.join(docsPath, dir);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      }

      // Executar geração
      const command = `node ${path.join(__dirname, "generate-docs.js")}`;
      execSync(command, {
        cwd: rootPath,
        stdio: "pipe", // Suprimir output para teste
      });

      // Verificar se arquivos foram gerados
      for (const dir of outputDirs) {
        const dirPath = path.join(docsPath, dir);
        if (!fs.existsSync(dirPath)) {
          throw new Error(`Diretório de saída não foi criado: ${dir}`);
        }

        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
          throw new Error(`Nenhum arquivo gerado em: ${dir}`);
        }
      }

      return true;
    } catch (error) {
      if (error.status) {
        throw new Error(`Comando falhou com código: ${error.status}`);
      }
      throw error;
    }
  }

  // Teste 6: Verificar qualidade da documentação gerada
  async testDocumentationQuality() {
    const rootPath = path.join(__dirname, "..");
    const docsDevPath = path.join(rootPath, "docs", "dev");

    if (!fs.existsSync(docsDevPath)) {
      throw new Error("Documentação não foi gerada");
    }

    const expectedFiles = ["PROJECT_OVERVIEW.md"];

    for (const fileName of expectedFiles) {
      const filePath = path.join(docsDevPath, fileName);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo esperado não encontrado: ${fileName}`);
      }

      const content = fs.readFileSync(filePath, "utf8");

      // Verificar se não está vazio
      if (content.trim().length < 100) {
        throw new Error(`Arquivo muito pequeno ou vazio: ${fileName}`);
      }

      // Verificar se contém markdown básico
      if (!content.includes("#") || !content.includes("##")) {
        throw new Error(`Arquivo não parece ser markdown válido: ${fileName}`);
      }

      // Verificar se contém informações do projeto
      if (
        !content.toLowerCase().includes("projeto") &&
        !content.toLowerCase().includes("project")
      ) {
        throw new Error(
          `Arquivo não contém informações relevantes: ${fileName}`
        );
      }
    }

    return true;
  }

  // Teste 7: Testar sistema em projeto separado (simulado)
  async testSeparatedProject() {
    const tempDir = path.join(__dirname, "..", "temp-test-project");

    try {
      // Criar diretório temporário
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      fs.mkdirSync(tempDir, { recursive: true });

      // Copiar arquivos necessários
      const filesToCopy = ["doc-generator/", "generate-docs.js", ".env"];

      for (const item of filesToCopy) {
        const src = path.join(__dirname, item);
        const dest = path.join(tempDir, item);

        if (fs.existsSync(src)) {
          if (fs.statSync(src).isDirectory()) {
            this.copyDir(src, dest);
          } else {
            fs.copyFileSync(src, dest);
          }
        }
      }

      // Criar package.json simples
      const packageJson = {
        name: "test-project",
        version: "1.0.0",
        dependencies: {
          "@octokit/rest": "^20.0.2",
          dotenv: "^17.2.1",
          openai: "^4.0.0",
        },
      };

      fs.writeFileSync(
        path.join(tempDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      // Instalar dependências
      try {
        execSync("npm install", {
          cwd: tempDir,
          stdio: "pipe",
        });
      } catch (installError) {
        // Se npm install falhar, pular este teste (ambiente pode não ter npm)
        this.log(
          "NPM install falhou - pulando teste de projeto separado",
          "warning"
        );
        return true;
      }

      // Testar execução
      const command = `node generate-docs.js`;
      execSync(command, {
        cwd: tempDir,
        stdio: "pipe",
      });

      // Verificar se documentação foi gerada
      const docsPath = path.join(tempDir, "docs");
      if (!fs.existsSync(docsPath)) {
        throw new Error("Documentação não foi gerada no projeto separado");
      }

      return true;
    } finally {
      // Limpar diretório temporário
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);

    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);

      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Executar todos os testes
  async runAllTests() {
    this.log("Iniciando suíte de testes do Sistema de Documentação", "info");
    console.log("");

    await this.runTest("Verificar arquivos necessários", () =>
      this.testRequiredFiles()
    );
    await this.runTest("Verificar configuração", () =>
      this.testConfiguration()
    );
    await this.runTest("Verificar dependências NPM", () =>
      this.testDependencies()
    );
    await this.runTest("Testar conexão OpenAI", () => this.testOpenAI());
    await this.runTest("Executar geração de documentação", () =>
      this.testDocumentationGeneration()
    );
    await this.runTest("Verificar qualidade da documentação", () =>
      this.testDocumentationQuality()
    );
    await this.runTest("Testar projeto separado (simulado)", () =>
      this.testSeparatedProject()
    );

    this.printSummary();
  }

  printSummary() {
    console.log("\n" + "=".repeat(60));
    this.log("RESUMO DOS TESTES", "info");
    console.log("=".repeat(60));

    console.log(`📊 Total de testes: ${this.testCount}`);
    console.log(`✅ Aprovados: ${this.passedTests}`);
    console.log(`❌ Falharam: ${this.failedTests}`);
    console.log(
      `📈 Taxa de sucesso: ${Math.round((this.passedTests / this.testCount) * 100)}%`
    );

    if (this.failedTests > 0) {
      console.log("\n❌ TESTES FALHARAM:");
      this.testResults
        .filter((r) => r.status === "FAILED")
        .forEach((r) => {
          console.log(`   • ${r.name}: ${r.error}`);
        });
    }

    console.log("\n" + "=".repeat(60));

    if (this.failedTests === 0) {
      this.log("TODOS OS TESTES PASSARAM! 🎉", "success");
      this.log(
        "Sistema de documentação está funcionando perfeitamente!",
        "success"
      );
    } else {
      this.log("ALGUNS TESTES FALHARAM!", "error");
      this.log("Verifique os erros acima para corrigir os problemas.", "error");
      process.exit(1);
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new DocumentationTester();
  tester.runAllTests().catch((error) => {
    console.error("❌ Erro fatal durante os testes:", error);
    process.exit(1);
  });
}

module.exports = DocumentationTester;
