#!/usr/bin/env node

/**
 * Sistema de Documentação Automática - Nova Versão Modular
 * Versão 2.0 com preview, configurações avançadas e melhor organização
 */

const path = require('path');
const ConfigManager = require('./doc-generator/config/settings');
const PreviewManager = require('./doc-generator/core/preview-manager');

class DocumentationOrchestrator {
  constructor() {
    this.config = new ConfigManager();
    this.preview = new PreviewManager(this.config);
    this.projectRoot = this.findProjectRoot();
  }

  findProjectRoot() {
    let currentDir = process.cwd();
    while (currentDir !== path.dirname(currentDir)) {
      if (require('fs').existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return process.cwd();
  }

  async run() {
    try {
      console.log('🚀 Sistema de Documentação Automática v2.0\n');

      // Validar configurações
      const validation = this.config.validate();
      if (!validation.isValid) {
        console.log('❌ Configurações inválidas:');
        validation.errors.forEach(error => console.log(`   • ${error}`));
        console.log('\n💡 Execute: node generate-docs.js --config para configurar\n');
        return false;
      }

      // Exibir configurações se solicitado
      if (process.argv.includes('--show-config')) {
        this.config.display();
        return true;
      }

      // Configuração interativa se solicitado
      if (process.argv.includes('--config')) {
        await this.config.interactiveSetup();
        return true;
      }

      // Análise e preview
      if (this.config.isPreviewEnabled()) {
        console.log('🔍 Analisando projeto...');
        await this.preview.analyzeProject(this.projectRoot);
        this.preview.displayPreview();

        // Confirmar geração se configurado
        const shouldContinue = await this.preview.confirmGeneration();
        if (!shouldContinue) {
          console.log('⏹️ Geração cancelada pelo usuário');
          return false;
        }
      }

      // Executar geração
      console.log('\n🚀 Iniciando geração de documentação...');
      const results = await this.generateDocumentation();

      // Exibir resultados
      this.displayResults(results);

      return results.success;

    } catch (error) {
      console.error('❌ Erro fatal:', error.message);
      return false;
    }
  }

  async generateDocumentation() {
    const results = {
      success: false,
      generatedFiles: [],
      errors: [],
      warnings: [],
      stats: {
        startTime: Date.now(),
        endTime: null,
        generatorsRun: 0,
        formatsGenerated: 0,
        totalFiles: 0
      }
    };

    try {
      // Carregar geradores habilitados
      const enabledGenerators = this.config.getEnabledGenerators();
      const outputFormats = this.config.getOutputFormats();

      console.log(`📝 Executando ${enabledGenerators.length} gerador(es) em ${outputFormats.length} formato(s)...\n`);

      // Carregar sistema principal (compatibilidade)
      const DocumentationGenerator = require('./doc-generator/main');
      const generator = new DocumentationGenerator();

      // Executar geração
      await generator.generateDocumentation();

      results.stats.generatorsRun = enabledGenerators.length;
      results.stats.formatsGenerated = outputFormats.length;
      results.success = true;

    } catch (error) {
      results.errors.push(error.message);
      console.error('❌ Erro durante geração:', error.message);
    }

    results.stats.endTime = Date.now();
    return results;
  }

  displayResults(results) {
    const duration = results.stats.endTime - results.stats.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO DA GERAÇÃO');
    console.log('='.repeat(60));

    if (results.success) {
      console.log('✅ Documentação gerada com sucesso!');
    } else {
      console.log('❌ Geração falhou');
    }

    console.log(`⏱️  Tempo total: ${(duration / 1000).toFixed(2)}s`);
    console.log(`🔧 Geradores executados: ${results.stats.generatorsRun}`);
    console.log(`📁 Formatos gerados: ${results.stats.formatsGenerated}`);

    // Mostrar arquivos gerados
    const outputFormats = this.config.getOutputFormats();
    const baseDir = this.config.get('output.baseDir');
    
    console.log('\n📄 Documentação salva em:');
    outputFormats.forEach(format => {
      const formatPath = path.join(this.projectRoot, baseDir, format.path);
      console.log(`   • ${format.description}: ${formatPath}`);
    });

    // Configuração OpenAI
    const openaiConfig = this.config.getOpenAIConfig();
    console.log(`\n🤖 OpenAI: ${openaiConfig.enabled ? '✅ Ativo' : '❌ Desabilitado'}`);
    if (openaiConfig.enabled) {
      console.log(`   📱 Modelo: ${openaiConfig.model}`);
    }

    // Erros e avisos
    if (results.errors.length > 0) {
      console.log('\n❌ Erros:');
      results.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️ Avisos:');
      results.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    // Próximos passos
    console.log('\n💡 Próximos Passos:');
    console.log('   • Revisar documentação gerada');
    console.log('   • Ajustar configurações se necessário: --config');
    console.log('   • Integrar no seu workflow de desenvolvimento');

    console.log('='.repeat(60));
  }

  displayHelp() {
    console.log(`
🚀 Sistema de Documentação Automática v2.0

USO:
  node generate-docs-v2.js [opções]

OPÇÕES:
  --config              Configuração interativa
  --show-config         Exibir configurações atuais
  --no-preview          Pular análise e preview
  --help               Exibir esta ajuda

EXEMPLOS:
  node generate-docs-v2.js                    # Geração normal
  node generate-docs-v2.js --config           # Configurar sistema
  node generate-docs-v2.js --show-config      # Ver configurações
  node generate-docs-v2.js --no-preview       # Gerar sem preview

ARQUIVOS DE CONFIGURAÇÃO:
  doc-generator/config/user-settings.json     # Suas configurações
  doc-generator/config/doc-config.json        # Configurações do sistema

Para mais informações, consulte README-SISTEMA.md
`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const orchestrator = new DocumentationOrchestrator();

  // Verificar argumentos
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    orchestrator.displayHelp();
    process.exit(0);
  }

  // Desabilitar preview se solicitado
  if (process.argv.includes('--no-preview')) {
    orchestrator.config.set('preview.enabled', false);
  }

  // Executar
  orchestrator.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = DocumentationOrchestrator;
