#!/usr/bin/env node

/**
 * Feature Documentation Engine
 * Sistema principal para documentação inteligente de features
 */

const path = require('path');
const GitAnalyzer = require('./git-analyzer');
const FeatureScanner = require('./feature-scanner');
const InteractiveSelector = require('./interactive-selector');
const DocumentationGenerator = require('../generators/documentation-generator');
const ConfigManager = require('../config/config-manager');

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
    const fs = require('fs');
    
    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return process.cwd();
  }

  /**
   * Inicializa o engine
   */
  async initialize() {
    console.log('🔧 Inicializando Feature Documentation Engine...');
    
    // Verificar se é repositório Git
    this.isGitRepo = this.gitAnalyzer.checkGitRepository();
    if (!this.isGitRepo) {
      console.log('⚠️ Não é um repositório Git - algumas funcionalidades serão limitadas');
    }

    // Carregar configuração
    this.config.loadFromFile();
    
    console.log('✅ Engine inicializado');
    return true;
  }

  /**
   * Escaneia features disponíveis
   */
  async scanFeatures(changedFiles = null) {
    const featuresDir = path.join(this.projectRoot, 'src', 'features');
    return await this.featureScanner.scanFeatures(featuresDir);
  }

  async run(options = {}) {
    try {
      console.log('🚀 Feature Documentation System v3.0\n');

      // 1. Configuração inicial
      await this.initializeConfig(options);

      // 2. Análise de alterações (se solicitado)
      const changedFiles = await this.analyzeChanges(options);

      // 3. Escaneamento de features
      const features = await this.scanFeatures(changedFiles);

      // 4. Seleção interativa
      const selectedFeatures = await this.selectFeatures(features, options);

      // 5. Preview e confirmação
      if (await this.showPreviewAndConfirm(selectedFeatures)) {
        // 6. Geração da documentação
        const results = await this.generateDocumentation(selectedFeatures);
        
        // 7. Relatório final
        this.showResults(results);
        return results.success;
      }

      console.log('⏹️ Operação cancelada pelo usuário');
      return false;

    } catch (error) {
      console.error('❌ Erro fatal:', error.message);
      if (options.debug) {
        console.error(error.stack);
      }
      return false;
    }
  }

  async initializeConfig(options) {
    if (options.config || !this.config.exists()) {
      console.log('⚙️ Configurando sistema...');
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

    console.log('🔍 Analisando alterações...');
    
    const since = options.since || 'main';
    const changes = await this.gitAnalyzer.getChangedFiles(this.projectRoot, since);
    
    if (changes.length > 0) {
      console.log(`📝 ${changes.length} arquivo(s) alterado(s) desde ${since}`);
      if (options.verbose) {
        changes.slice(0, 10).forEach(file => console.log(`   • ${file}`));
        if (changes.length > 10) {
          console.log(`   ... e mais ${changes.length - 10} arquivo(s)`);
        }
      }
    } else {
      console.log('✅ Nenhuma alteração detectada');
    }

    return changes;
  }

  async scanFeatures(changedFiles = null) {
    console.log('📂 Escaneando features...');
    
    const featuresPath = path.join(this.projectRoot, 'src', 'features');
    const features = await this.featureScanner.scanFeatures(featuresPath, changedFiles);
    
    console.log(`📋 ${features.length} feature(s) encontrada(s)`);
    
    if (features.length === 0) {
      console.log('⚠️ Nenhuma feature encontrada em src/features/');
      console.log('💡 Certifique-se de que suas features estão organizadas em src/features/');
      return [];
    }

    return features;
  }

  async selectFeatures(features, options) {
    if (features.length === 0) {
      return [];
    }

    if (options.all) {
      console.log('📑 Selecionando todas as features');
      return features;
    }

    if (options.features) {
      const selected = features.filter(f => 
        options.features.some(name => f.name.includes(name))
      );
      console.log(`🎯 ${selected.length} feature(s) selecionada(s) por parâmetro`);
      return selected;
    }

    return await this.selector.selectFeatures(features);
  }

  async showPreviewAndConfirm(features) {
    if (features.length === 0) {
      return false;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 PREVIEW DA DOCUMENTAÇÃO');
    console.log('='.repeat(60));

    const templates = this.config.getSelectedTemplates();
    const outputFormats = this.config.getOutputFormats();

    console.log(`\n📝 Features a serem documentadas: ${features.length}`);
    features.forEach(feature => {
      console.log(`   📁 ${feature.name} (${feature.components.length} componentes)`);
    });

    console.log(`\n📋 Templates: ${templates.length}`);
    templates.forEach(template => {
      console.log(`   📄 ${template.name} - ${template.description}`);
    });

    console.log(`\n📁 Formatos de saída: ${outputFormats.length}`);
    outputFormats.forEach(format => {
      console.log(`   📂 ${format.name} - ${format.description}`);
    });

    const totalDocs = features.length * templates.length * outputFormats.length;
    console.log(`\n📊 Total estimado: ~${totalDocs} documentos`);

    console.log('='.repeat(60));

    return await this.selector.confirmGeneration();
  }

  async generateDocumentation(features) {
    console.log('\n🚀 Gerando documentação...');
    
    const startTime = Date.now();
    const results = {
      success: true,
      features: [],
      errors: [],
      warnings: [],
      stats: {
        featuresProcessed: 0,
        documentsGenerated: 0,
        templatesUsed: 0,
        duration: 0
      }
    };

    for (const feature of features) {
      try {
        console.log(`\n📝 Processando feature: ${feature.name}`);
        
        // Passar configurações para o gerador
        const generatorOptions = {
          outputPath: this.config.get('output.path'),
          format: this.config.get('output.format'),
          ai: this.config.get('ai'),
          template: this.config.get('templates.default'),
          audience: this.config.get('templates.audience')
        };
        
        const featureResult = await this.generator.generateForFeature(feature, generatorOptions);
        
        results.features.push(featureResult);
        results.stats.featuresProcessed++;
        results.stats.documentsGenerated += featureResult.documentsGenerated;
        
      } catch (error) {
        results.errors.push({
          feature: feature.name,
          error: error.message
        });
        results.success = false;
      }
    }

    results.stats.duration = Date.now() - startTime;
    return results;
  }

  showResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO DA GERAÇÃO');
    console.log('='.repeat(60));

    if (results.success) {
      console.log('✅ Documentação gerada com sucesso!');
    } else {
      console.log('⚠️ Geração concluída com erros');
    }

    console.log(`⏱️  Tempo: ${(results.stats.duration / 1000).toFixed(2)}s`);
    console.log(`📁 Features processadas: ${results.stats.featuresProcessed}`);
    console.log(`📝 Documentos gerados: ${results.stats.documentsGenerated}`);

    if (results.features.length > 0) {
      console.log('\n📂 Documentação salva em:');
      results.features.forEach(feature => {
        console.log(`   📁 docs/features/${feature.name}/`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Erros:');
      results.errors.forEach(error => {
        console.log(`   • ${error.feature}: ${error.error}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️ Avisos:');
      results.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }

    console.log('\n💡 Próximos passos:');
    console.log('   • Revisar documentação gerada');
    console.log('   • Personalizar templates se necessário');
    console.log('   • Configurar para execução automática');

    console.log('='.repeat(60));
  }
}

module.exports = FeatureDocsEngine;
