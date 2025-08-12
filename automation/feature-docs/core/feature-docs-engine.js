#!/usr/bin/env node

/**
 * Feature Documentation Engine
 * Sistema principal para documentação inteligente de features
 */

const path = require("path");
const GitAnalyzer = require("./git-analyzer");
const FeatureScanner = require("./feature-scanner");
const InteractiveSelector = require("./interactive-selector-new");
const DocumentationGenerator = require("../generators/documentation-generator");
const ConfigManager = require("../config/config-manager");

class FeatureDocsEngine {
  constructor(options = {}) {
    this.config = new ConfigManager();
    this.gitAnalyzer = new GitAnalyzer();
    this.featureScanner = new FeatureScanner(this.config);
    this.selector = new InteractiveSelector();
    this.generator = new DocumentationGenerator(this.config);
    this.projectRoot = options.rootPath || this.findProjectRoot();
    this.options = options;
  }

  findProjectRoot() {
    let currentDir = process.cwd();
    const fs = require("fs");

    // Se estamos em uma subpasta do projeto, navegar para cima
    while (currentDir !== path.dirname(currentDir)) {
      // Verificar se é o root do projeto
      const hasPackageJson = fs.existsSync(
        path.join(currentDir, "package.json")
      );
      const hasFrontend = fs.existsSync(path.join(currentDir, "frontend"));
      const hasSrc = fs.existsSync(path.join(currentDir, "src"));

      if (hasPackageJson && (hasFrontend || hasSrc)) {
        console.log(`🔧 Projeto detectado em: ${currentDir}`);
        return currentDir;
      }

      currentDir = path.dirname(currentDir);
    }

    // Fallback - ainda procurar por estrutura típica
    let checkDir = process.cwd();
    while (checkDir !== path.dirname(checkDir)) {
      if (fs.existsSync(path.join(checkDir, "frontend", "src", "features"))) {
        console.log(`🔧 Projeto detectado por estrutura em: ${checkDir}`);
        return checkDir;
      }
      checkDir = path.dirname(checkDir);
    }

    console.log(`🔧 Usando diretório atual: ${process.cwd()}`);
    return process.cwd();
  }

  /**
   * Inicializa o engine
   */
  async initialize() {
    console.log("🔧 Inicializando Feature Documentation Engine...");

    // Verificar se é repositório Git
    this.isGitRepo = this.gitAnalyzer.checkGitRepository();
    if (!this.isGitRepo) {
      console.log(
        "⚠️ Não é um repositório Git - algumas funcionalidades serão limitadas"
      );
    }

    // Carregar configuração
    this.config.loadFromFile();

    console.log("✅ Engine inicializado");
    return true;
  }

  /**
   * Escaneia features disponíveis
   */
  async scanFeatures(changedFiles = null) {
    // Primeiro tenta frontend/src/features, depois src/features
    let featuresDir = path.join(
      this.projectRoot,
      "frontend",
      "src",
      "features"
    );
    if (!require("fs").existsSync(featuresDir)) {
      featuresDir = path.join(this.projectRoot, "src", "features");
    }
    return await this.featureScanner.scanFeatures(featuresDir);
  }

  async run(options = {}) {
    try {
      console.log("🚀 Feature Documentation System v3.0\n");

      // 1. Configuração inicial
      await this.initializeConfig(options);

      // 2. Análise de alterações (se solicitado)
      const changedFiles = await this.analyzeChanges(options);

      // 3. Escaneamento de features
      const features = await this.scanFeatures(changedFiles);

      // 4. Seleção interativa
      const selectedFeatures = await this.selectFeatures(
        features,
        options,
        changedFiles
      );

      // 5. Seleção de tipos de documentação (sempre interativo)
      let selectedTemplates = ["overview"]; // padrão
      if (process.stdin.isTTY) {
        selectedTemplates = await this.selector.selectDocumentationTypes();
      }

      // 6. Preview e confirmação
      if (
        await this.showPreviewAndConfirm(selectedFeatures, selectedTemplates)
      ) {
        // 7. Geração da documentação
        const results = await this.generateDocumentation(
          selectedFeatures,
          selectedTemplates
        );

        // 7. Relatório final
        this.showResults(results);
        return results.success;
      }

      console.log("⏹️ Operação cancelada pelo usuário");
      return false;
    } catch (error) {
      console.error("❌ Erro fatal:", error.message);
      if (options.debug) {
        console.error(error.stack);
      }
      return false;
    }
  }

  async initializeConfig(options) {
    if (options.config || !this.config.exists()) {
      console.log("⚙️ Configurando sistema...");
      await this.config.interactiveSetup();
    }

    if (options.showConfig) {
      this.config.display();
    }
  }

  async analyzeChanges(options) {
    if (!options.detectChanges && !options.since) {
      return null;
    }

    console.log("🔍 Analisando alterações...");

    const since = options.since || "main";
    const changes = await this.gitAnalyzer.getChangedFiles(
      this.projectRoot,
      since
    );

    if (changes.length > 0) {
      console.log(`📝 ${changes.length} arquivo(s) alterado(s) desde ${since}`);
      if (options.verbose) {
        changes.slice(0, 10).forEach((file) => console.log(`   • ${file}`));
        if (changes.length > 10) {
          console.log(`   ... e mais ${changes.length - 10} arquivo(s)`);
        }
      }
    } else {
      console.log("✅ Nenhuma alteração detectada");
    }

    return changes;
  }

  async scanFeatures(changedFiles = null) {
    console.log("📂 Escaneando features...");

    // Determinar o caminho das features
    let featuresPath = path.join(
      this.projectRoot,
      "frontend",
      "src",
      "features"
    );
    if (!require("fs").existsSync(featuresPath)) {
      featuresPath = path.join(this.projectRoot, "src", "features");
    }

    const features = await this.featureScanner.scanFeatures(
      featuresPath,
      changedFiles
    );

    console.log(`📋 ${features.length} feature(s) encontrada(s)`);

    if (features.length === 0) {
      console.log("⚠️ Nenhuma feature encontrada!");
      console.log(
        "💡 Certifique-se de que suas features estão organizadas em:"
      );
      console.log("   - frontend/src/features/ (para projetos full-stack)");
      console.log("   - src/features/ (para projetos frontend simples)");
      return [];
    }

    return features;
  }

  async selectFeatures(features, options, changedFiles = null) {
    if (features.length === 0) {
      return [];
    }

    if (options.all) {
      console.log("📑 Selecionando todas as features");
      return features;
    }

    if (options.features && options.features.length > 0) {
      const selected = features.filter((f) =>
        options.features.some((name) => f.name.includes(name))
      );
      console.log(
        `🎯 ${selected.length} feature(s) selecionada(s) por parâmetro`
      );
      return selected;
    }

    // Se há detecção de mudanças ativas, usar automaticamente features detectadas
    if (
      (options.detectChanges || options.since) &&
      changedFiles &&
      changedFiles.length > 0
    ) {
      console.log(
        `🔄 Selecionando automaticamente ${features.length} feature(s) com mudanças`
      );
      return features;
    }

    return await this.selector.selectFeatures(features);
  }

  async showPreviewAndConfirm(features, templates = ["overview"]) {
    if (features.length === 0) {
      return false;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 PREVIEW DA DOCUMENTAÇÃO");
    console.log("=".repeat(60));

    console.log(`\n📝 Features a serem documentadas: ${features.length}`);
    features.forEach((feature) => {
      console.log(
        `   📁 ${feature.name} (${feature.components.length} componentes)`
      );
    });

    console.log(`\n📋 Tipos de documentação: ${templates.length}`);
    templates.forEach((template) => {
      const templateName = this.getTemplateName(template);
      console.log(`   📄 ${templateName}`);
    });

    console.log(`\n📁 Formatos de saída: 1`);
    console.log(`   📂 MARKDOWN`);

    console.log(
      `\n📊 Total estimado: ~${features.length * templates.length} documentos`
    );
    console.log("=".repeat(60));

    console.log("\n✅ Prosseguindo com a geração...");
    return true;
  }

  getTemplateName(templateKey) {
    const templates = {
      technical: "Documentação Técnica - Para desenvolvedores",
      user: "Guia do Usuário - Para usuários finais",
      executive: "Resumo Executivo - Para gestores",
      overview: "Visão Geral - Para todos os públicos",
    };
    return templates[templateKey] || templateKey;
  }

  async generateDocumentation(features, templates = ["overview"]) {
    console.log("\n🚀 Gerando documentação...");

    const startTime = Date.now();
    const results = {
      success: true,
      features: [],
      errors: [],
      warnings: [],
      stats: {
        featuresProcessed: 0,
        documentsGenerated: 0,
        totalTime: 0,
      },
    };

    for (const feature of features) {
      console.log(`\n📝 Processando feature: ${feature.name}`);

      try {
        for (const templateKey of templates) {
          console.log(
            `📄 Gerando ${this.getTemplateName(templateKey).split(" - ")[0]}`
          );

          const docResult = await this.generator.generateWithTemplate(
            feature,
            templateKey,
            {
              outputPath: path.join(this.projectRoot, "docs", "features"),
              useAI: this.config.config.ai?.enabled,
            }
          );

          if (docResult.success) {
            results.stats.documentsGenerated++;
            console.log(
              `✅ Arquivo gerado: ${path.relative(this.projectRoot, docResult.filePath)}`
            );
          } else {
            results.warnings.push(
              `⚠️ Falha em ${feature.name}/${templateKey}: ${docResult.error}`
            );
          }
        }

        results.stats.featuresProcessed++;
        results.features.push({
          name: feature.name,
          success: true,
          documents: templates.length,
        });
      } catch (error) {
        console.error(`❌ Erro ao processar ${feature.name}:`, error.message);
        results.errors.push({
          feature: feature.name,
          error: error.message,
        });
        results.success = false;
      }
    }

    results.stats.totalTime = Date.now() - startTime;
    return results;
  }

  showResults(results) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESULTADO DA GERAÇÃO");
    console.log("=".repeat(60));

    if (results.success) {
      console.log("✅ Documentação gerada com sucesso!");
    } else {
      console.log("⚠️ Geração concluída com erros");
    }

    console.log(`⏱️  Tempo: ${(results.stats.duration / 1000).toFixed(2)}s`);
    console.log(`📁 Features processadas: ${results.stats.featuresProcessed}`);
    console.log(`📝 Documentos gerados: ${results.stats.documentsGenerated}`);

    if (results.features.length > 0) {
      console.log("\n📂 Documentação salva em:");
      results.features.forEach((feature) => {
        console.log(`   📁 docs/features/${feature.name}/`);
      });
    }

    if (results.errors.length > 0) {
      console.log("\n❌ Erros:");
      results.errors.forEach((error) => {
        console.log(`   • ${error.feature}: ${error.error}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log("\n⚠️ Avisos:");
      results.warnings.forEach((warning) => {
        console.log(`   • ${warning}`);
      });
    }

    console.log("\n💡 Próximos passos:");
    console.log("   • Revisar documentação gerada");
    console.log("   • Personalizar templates se necessário");
    console.log("   • Configurar para execução automática");

    console.log("=".repeat(60));
  }
}

module.exports = FeatureDocsEngine;
