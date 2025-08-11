#!/usr/bin/env node

// Carregar variáveis de ambiente
require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Importar geradores
const ApiDocsGenerator = require("./generators/api-docs");
const ComponentDocsGenerator = require("./generators/component-docs");
const ArchitectureGenerator = require("./generators/architecture");
const OpenAIDocumentationEnhancer = require("./enhancers/openai-enhancer");

class DocumentationGenerator {
  constructor() {
    this.rootPath = this.findProjectRoot();
    this.config = this.loadConfig();
    this.projectStructure = this.analyzeProjectStructure();
    this.openaiEnhancer = new OpenAIDocumentationEnhancer(this.config);
  }

  findProjectRoot() {
    let currentDir = process.cwd();
    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, "package.json"))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return process.cwd();
  }

  loadConfig() {
    const configPath = path.join(__dirname, "config", "doc-config.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      output: {
        dev: "docs/dev",
        ai: "docs/ai",
        export: "docs/export",
      },
      generators: {
        api: true,
        components: true,
        architecture: true,
      },
      formats: ["markdown", "json"],
      includePatterns: [
        "**/*.ts",
        "**/*.js",
        "**/*.jsx",
        "**/*.tsx",
        "**/*.vue",
      ],
      excludePatterns: [
        "node_modules/**",
        "dist/**",
        "build/**",
        "**/*.test.*",
        "**/*.spec.*",
      ],
    };
  }

  analyzeProjectStructure() {
    const structure = {
      isMonorepo: false,
      projects: [],
      hasBackend: false,
      hasFrontend: false,
      hasAutomation: false,
      hasDocs: false,
    };

    const rootContents = fs.readdirSync(this.rootPath, { withFileTypes: true });

    // Detectar se é monorepo
    const folders = rootContents
      .filter((item) => item.isDirectory())
      .map((item) => item.name);
    structure.isMonorepo =
      folders.length > 3 &&
      folders.some((f) => ["backend", "frontend", "docs"].includes(f));

    // Analisar cada projeto
    folders.forEach((folder) => {
      const folderPath = path.join(this.rootPath, folder);
      const hasPackageJson = fs.existsSync(
        path.join(folderPath, "package.json")
      );

      if (
        hasPackageJson ||
        ["backend", "frontend", "docs", "automation"].includes(folder)
      ) {
        structure.projects.push({
          name: folder,
          path: folderPath,
          type: this.detectProjectType(folder, folderPath),
          hasPackageJson,
        });
      }
    });

    // Flags de conveniência
    structure.hasBackend = structure.projects.some((p) => p.type === "backend");
    structure.hasFrontend = structure.projects.some(
      (p) => p.type === "frontend"
    );
    structure.hasAutomation = structure.projects.some(
      (p) => p.type === "automation"
    );
    structure.hasDocs = structure.projects.some((p) => p.type === "docs");

    return structure;
  }

  detectProjectType(folderName, folderPath) {
    // Detecção baseada no nome da pasta
    if (["backend", "server", "api"].includes(folderName.toLowerCase())) {
      return "backend";
    }
    if (
      ["frontend", "client", "web", "app"].includes(folderName.toLowerCase())
    ) {
      return "frontend";
    }
    if (folderName === "docs") return "docs";
    if (folderName === "automation") return "automation";

    // Detecção baseada no package.json
    const packageJsonPath = path.join(folderPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        if (deps["@nestjs/core"] || deps["express"] || deps["fastify"]) {
          return "backend";
        }
        if (
          deps["react"] ||
          deps["vue"] ||
          deps["@angular/core"] ||
          deps["svelte"]
        ) {
          return "frontend";
        }
      } catch (error) {
        console.warn(
          `Erro ao ler package.json de ${folderName}:`,
          error.message
        );
      }
    }

    return "unknown";
  }

  async generateDocumentation() {
    console.log("🚀 Iniciando geração de documentação...");
    console.log(
      `📁 Projeto: ${this.projectStructure.isMonorepo ? "Monorepo" : "Projeto único"}`
    );
    console.log(
      `📋 Projetos encontrados: ${this.projectStructure.projects.length}`
    );

    // Criar diretórios de saída
    this.ensureDirectories();

    // Gerar documentação geral
    await this.generateOverviewDocumentation();

    // Gerar documentação específica por projeto
    for (const project of this.projectStructure.projects) {
      await this.generateProjectDocumentation(project);
    }

    console.log("✅ Documentação gerada com sucesso!");
    this.printSummary();
  }

  ensureDirectories() {
    const dirs = [
      this.config.output.dev,
      this.config.output.ai,
      this.config.output.export,
    ];

    dirs.forEach((dir) => {
      const fullPath = path.join(this.rootPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async generateOverviewDocumentation() {
    const overview = {
      timestamp: new Date().toISOString(),
      project: {
        name: path.basename(this.rootPath),
        type: this.projectStructure.isMonorepo ? "monorepo" : "single-project",
        structure: this.projectStructure,
      },
      summary: this.generateProjectSummary(),
    };

    // Para desenvolvedores
    let devOverview = this.formatForDevelopers(overview);

    // Melhorar com OpenAI se disponível
    if (this.config.openai?.enhance?.projectOverview) {
      console.log("🤖 Melhorando visão geral com OpenAI...");
      devOverview =
        (await this.openaiEnhancer.enhanceProjectOverview(
          devOverview,
          overview
        )) || devOverview;
    }

    fs.writeFileSync(
      path.join(this.rootPath, this.config.output.dev, "PROJECT_OVERVIEW.md"),
      devOverview
    );

    // Para IA
    fs.writeFileSync(
      path.join(this.rootPath, this.config.output.ai, "project-context.json"),
      JSON.stringify(overview, null, 2)
    );

    // Para export
    const exportOverview = this.formatForExport(overview);
    fs.writeFileSync(
      path.join(this.rootPath, this.config.output.export, "overview.md"),
      exportOverview
    );

    // Gerar README personalizado se habilitado
    if (
      this.config.openai?.enhance?.generateReadmes &&
      this.openaiEnhancer.isAvailable()
    ) {
      console.log("📄 Gerando README melhorado...");
      const readme = await this.openaiEnhancer.generateReadmeForProject(
        overview,
        overview.project.name
      );
      if (readme) {
        fs.writeFileSync(
          path.join(
            this.rootPath,
            this.config.output.dev,
            "README_ENHANCED.md"
          ),
          readme
        );
      }
    }
  }

  async generateProjectDocumentation(project) {
    console.log(`📝 Gerando documentação para: ${project.name}`);

    try {
      // Gerador de APIs (backend)
      if (project.type === "backend" && this.config.generators.api) {
        const apiGenerator = new ApiDocsGenerator(
          project,
          this.config,
          this.openaiEnhancer
        );
        await apiGenerator.generate();
      }

      // Gerador de componentes (frontend)
      if (project.type === "frontend" && this.config.generators.components) {
        const componentGenerator = new ComponentDocsGenerator(
          project,
          this.config,
          this.openaiEnhancer
        );
        await componentGenerator.generate();
      }

      // Gerador de arquitetura (todos)
      if (this.config.generators.architecture) {
        const archGenerator = new ArchitectureGenerator(
          project,
          this.config,
          this.openaiEnhancer
        );
        await archGenerator.generate();
      }
    } catch (error) {
      console.error(
        `❌ Erro ao gerar documentação para ${project.name}:`,
        error.message
      );
    }
  }

  generateProjectSummary() {
    return {
      totalProjects: this.projectStructure.projects.length,
      projectTypes: this.projectStructure.projects.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {}),
      technologies: this.detectTechnologies(),
      architecture: this.projectStructure.isMonorepo
        ? "monorepo"
        : "single-project",
    };
  }

  detectTechnologies() {
    const technologies = new Set();

    this.projectStructure.projects.forEach((project) => {
      const packageJsonPath = path.join(project.path, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf8")
          );
          const deps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
          };

          // Detectar tecnologias principais
          Object.keys(deps).forEach((dep) => {
            if (dep.includes("react")) technologies.add("React");
            if (dep.includes("vue")) technologies.add("Vue");
            if (dep.includes("angular")) technologies.add("Angular");
            if (dep.includes("nestjs")) technologies.add("NestJS");
            if (dep.includes("express")) technologies.add("Express");
            if (dep.includes("typescript")) technologies.add("TypeScript");
            if (dep.includes("prisma")) technologies.add("Prisma");
            if (dep.includes("tailwind")) technologies.add("Tailwind CSS");
          });
        } catch (error) {
          // Ignorar erros de parsing
        }
      }
    });

    return Array.from(technologies);
  }

  formatForDevelopers(overview) {
    return `# Project Overview

**Generated:** ${overview.timestamp}
**Project:** ${overview.project.name}
**Type:** ${overview.project.type}

## Structure

${this.projectStructure.projects.map((p) => `- **${p.name}** (${p.type})`).join("\n")}

## Technologies

${overview.summary.technologies.map((tech) => `- ${tech}`).join("\n")}

## Summary

- Total Projects: ${overview.summary.totalProjects}
- Architecture: ${overview.summary.architecture}

---
*This documentation was automatically generated by the Documentation Generator*
`;
  }

  formatForExport(overview) {
    return `# ${overview.project.name}

## Overview
This is a ${overview.project.type} containing ${overview.summary.totalProjects} project(s).

## Technologies
${overview.summary.technologies.join(", ")}

## Projects
${this.projectStructure.projects.map((p) => `### ${p.name}\nType: ${p.type}`).join("\n\n")}

---
Generated automatically on ${new Date(overview.timestamp).toLocaleString()}
`;
  }

  printSummary() {
    console.log("\n📊 Resumo da Documentação Gerada:");
    console.log(
      `📁 Projetos processados: ${this.projectStructure.projects.length}`
    );
    console.log(`📄 Documentação salva em:`);
    console.log(`   • Desenvolvedores: ${this.config.output.dev}/`);
    console.log(`   • IA: ${this.config.output.ai}/`);
    console.log(`   • Export: ${this.config.output.export}/`);

    // Mostrar status da OpenAI
    const openaiStats = this.openaiEnhancer.getUsageStats();
    console.log(
      `🤖 OpenAI: ${openaiStats.available ? "✅ Ativo" : "❌ Inativo"}`
    );
    if (openaiStats.available) {
      console.log(`   • Modelo: ${openaiStats.model}`);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const generator = new DocumentationGenerator();
  generator.generateDocumentation().catch(console.error);
}

module.exports = DocumentationGenerator;
