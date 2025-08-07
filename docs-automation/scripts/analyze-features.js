#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const OpenAIClient = require('./utils/openai-client');
const GitHubClient = require('./utils/github-client');
const FeatureAnalyzer = require('./utils/feature-analyzer');

class FeatureDocumentationGenerator {
  constructor(options = {}) {
    this.debugMode = options.debug || process.env.DEBUG_MODE === 'true';
    this.skipOpenAI = options.skipOpenAI || process.env.OPENAI_API_KEY === 'test_key_for_local_testing';
    this.skipGitHub = options.skipGitHub || process.env.TOKEN_GITHUB === 'test_token_for_local_testing';
    
    if (this.debugMode) {
      console.log('🐛 Modo DEBUG ativado');
      console.log(`   Skip OpenAI: ${this.skipOpenAI}`);
      console.log(`   Skip GitHub: ${this.skipGitHub}`);
    }
    
    // Inicializar clientes apenas se não estivermos pulando
    this.openai = this.skipOpenAI ? null : new OpenAIClient();
    this.github = this.skipGitHub ? null : new GitHubClient();
    this.featureAnalyzer = new FeatureAnalyzer();
    
    this.stats = {
      featuresAnalyzed: 0,
      totalFiles: 0,
      totalTokens: 0,
      totalCost: 0,
      errors: []
    };
  }

  /**
   * Método principal para gerar documentação de features
   */
  async generateFeatureDocs(options = {}) {
    try {
      console.log('🎯 Iniciando geração de documentação de features...');
      
      // 1. Detectar features alteradas
      const changedFeatures = await this.detectChangedFeatures();
      console.log(`📊 Features alteradas: ${changedFeatures.length}`);
      
      if (changedFeatures.length === 0) {
        console.log('ℹ️  Nenhuma feature alterada encontrada');
        return { success: true, reason: 'no_changes' };
      }
      
      // 2. Analisar cada feature
      const featureDocs = [];
      for (const featureName of changedFeatures) {
        console.log(`🔍 Analisando feature: ${featureName}`);
        const featureDoc = await this.analyzeFeature(featureName);
        featureDocs.push(featureDoc);
        this.stats.featuresAnalyzed++;
      }
      
      // 3. Atualizar Wiki
      const wikiUpdates = await this.updateWikiPages(featureDocs);
      
      // 4. Log final
      await this.logResults();
      
      console.log('✅ Documentação de features gerada com sucesso!');
      
      return {
        success: true,
        stats: this.stats,
        featureDocs,
        wikiUpdates
      };
      
    } catch (error) {
      console.error('❌ Erro na geração:', error);
      this.stats.errors.push(error.message);
      return { success: false, error: error.message, stats: this.stats };
    }
  }

  /**
   * Detecta features que foram alteradas baseado nos arquivos modificados
   */
  async detectChangedFeatures() {
    if (this.skipGitHub) {
      console.log('🐛 DEBUG: Simulando features alteradas');
      return ['auth']; // Feature de teste
    }
    
    const changedFiles = await this.github.getChangedFiles();
    const features = new Set();
    
    for (const file of changedFiles) {
      // Verifica se o arquivo está dentro de uma feature
      const featureMatch = file.match(/frontend\/src\/features\/([^\/]+)/);
      if (featureMatch) {
        features.add(featureMatch[1]);
      }
    }
    
    return Array.from(features);
  }

  /**
   * Analisa uma feature específica
   */
  async analyzeFeature(featureName) {
    // Navegar para o diretório raiz do projeto (dois níveis acima de scripts)
    const projectRoot = path.join(__dirname, '../..');
    const featurePath = path.join(projectRoot, 'frontend/src/features', featureName);
    
    if (this.debugMode) {
      console.log(`🐛 DEBUG: Caminho da feature: ${featurePath}`);
    }
    
    // 1. Obter estrutura da feature
    const featureStructure = await this.featureAnalyzer.analyzeFeatureStructure(featurePath);
    
    // 2. Obter conteúdo dos arquivos
    const featureFiles = await this.featureAnalyzer.getFeatureFiles(featurePath);
    
    // 3. Gerar documentação com IA
    const documentation = await this.generateDocumentationWithAI(featureName, featureStructure, featureFiles);
    
    return {
      name: featureName,
      structure: featureStructure,
      documentation
    };
  }

  /**
   * Gera documentação usando IA
   */
  async generateDocumentationWithAI(featureName, structure, files) {
    const template = await fs.readFile(
      path.join(__dirname, '../templates/feature-documentation.md'), 
      'utf-8'
    );

    if (this.skipOpenAI) {
      console.log(`🐛 DEBUG: Simulando geração de documentação para: ${featureName}`);
      const mockResponse = {
        content: `Documentação simulada da feature ${featureName}. Esta feature contém componentes, hooks e páginas relacionadas à ${featureName}.`,
        usage: { total_tokens: 100 }
      };
      
      return this.populateTemplate(template, featureName, mockResponse.content, structure);
    }

    const prompt = this.buildFeatureAnalysisPrompt(featureName, structure, files);
    
    console.log(`🤖 Gerando documentação com IA para: ${featureName}`);
    
    const response = await this.openai.generateText({
      prompt,
      maxTokens: 3000,
      temperature: 0.3
    });

    this.stats.totalTokens += response.usage?.total_tokens || 0;
    this.stats.totalCost += this.openai.calculateCost(response.usage?.total_tokens || 0);

    return this.populateTemplate(template, featureName, response.content, structure);
  }

  /**
   * Constrói o prompt para análise da feature
   */
  buildFeatureAnalysisPrompt(featureName, structure, files) {
    return `
Você é um especialista em documentação técnica. Analise esta feature React/TypeScript e gere documentação completa.

FEATURE: ${featureName}

ESTRUTURA DA FEATURE:
${JSON.stringify(structure, null, 2)}

ARQUIVOS DA FEATURE:
${files.map(f => `
--- ${f.path} ---
${f.content.substring(0, 2000)}${f.content.length > 2000 ? '...' : ''}
`).join('\n')}

INSTRUÇÕES:
1. Analise o propósito e funcionalidades da feature
2. Identifique componentes principais, hooks e serviços
3. Descreva o fluxo de usuário e interface
4. Liste dependências e integrações
5. Identifique padrões de design utilizados
6. Seja técnico mas acessível para qualquer desenvolvedor

FORMATO DE RESPOSTA:
Retorne as informações estruturadas para preencher um template de documentação.
Seja conciso mas completo. Foque no que é mais importante para entender e manter esta feature.
`;
  }

  /**
   * Popula o template com as informações geradas
   */
  populateTemplate(template, featureName, aiContent, structure) {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    return template
      .replace(/{{FEATURE_NAME}}/g, featureName)
      .replace(/{{GENERATION_DATE}}/g, currentDate)
      .replace(/{{FILE_STRUCTURE}}/g, this.formatStructure(structure))
      // O conteúdo da IA será processado para preencher outros placeholders
      .replace(/{{FEATURE_OVERVIEW}}/g, this.extractSection(aiContent, 'overview') || 'Análise da feature em andamento...')
      .replace(/{{MAIN_FEATURES}}/g, this.extractSection(aiContent, 'features') || 'Funcionalidades sendo documentadas...')
      .replace(/{{UI_COMPONENTS}}/g, this.extractSection(aiContent, 'components') || structure.components?.join(', ') || 'N/A')
      .replace(/{{CUSTOM_HOOKS}}/g, structure.hooks?.join(', ') || 'N/A')
      .replace(/{{SERVICES_APIS}}/g, structure.services?.join(', ') || 'N/A');
  }

  /**
   * Formata a estrutura da feature
   */
  formatStructure(structure) {
    return `
features/${structure.name}/
├── components/     ${structure.components?.length || 0} arquivos
├── hooks/          ${structure.hooks?.length || 0} arquivos  
├── pages/          ${structure.pages?.length || 0} arquivos
├── services/       ${structure.services?.length || 0} arquivos
├── schemas/        ${structure.schemas?.length || 0} arquivos
└── index.ts        Barrel export
`;
  }

  /**
   * Extrai seções específicas do conteúdo da IA
   */
  extractSection(content, section) {
    // Implementação básica - pode ser melhorada com regex mais sofisticada
    return content.split('\n').slice(0, 3).join('\n');
  }

  /**
   * Atualiza páginas da Wiki
   */
  async updateWikiPages(featureDocs) {
    if (this.skipGitHub) {
      console.log('🐛 DEBUG: Simulando atualização da Wiki');
      return featureDocs.map(doc => ({
        page: `Feature-${doc.name}`,
        result: { success: true, message: 'Simulado' }
      }));
    }
    
    const updates = [];
    
    for (const featureDoc of featureDocs) {
      const pageName = `Feature-${featureDoc.name}`;
      const pageContent = featureDoc.documentation;
      
      console.log(`📝 Atualizando Wiki: ${pageName}`);
      
      const result = await this.github.updateWikiPage(pageName, pageContent);
      updates.push({ page: pageName, result });
    }
    
    // Atualizar página índice
    await this.updateFeatureIndex(featureDocs);
    
    return updates;
  }

  /**
   * Atualiza a página índice das features
   */
  async updateFeatureIndex(featureDocs) {
    if (this.skipGitHub) {
      console.log('🐛 DEBUG: Simulando atualização do índice de features');
      return;
    }
    
    const indexContent = this.generateFeatureIndex(featureDocs);
    await this.github.updateWikiPage('Features-Index', indexContent);
  }

  /**
   * Gera conteúdo da página índice
   */
  generateFeatureIndex(featureDocs) {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    return `# 🎯 Índice de Features

## 📋 Features Documentadas

${featureDocs.map(doc => `
### 🔗 [${doc.name}](./Feature-${doc.name})
Última atualização: ${currentDate}
`).join('\n')}

## 📊 Estatísticas

- **Total de Features**: ${featureDocs.length}
- **Última Atualização**: ${currentDate}
- **Sistema**: Feature Documentation Generator v1.0

---
*Índice gerado automaticamente*
`;
  }

  /**
   * Salva resultados em log
   */
  async logResults() {
    const logData = {
      timestamp: new Date().toISOString(),
      stats: this.stats
    };

    const logPath = path.join(__dirname, '../logs', `features-${Date.now()}.json`);
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, JSON.stringify(logData, null, 2));
  }
}

// Execução principal
if (require.main === module) {
  const generator = new FeatureDocumentationGenerator();
  
  generator.generateFeatureDocs()
    .then(result => {
      if (result.success) {
        console.log('🎉 Documentação gerada com sucesso!');
        process.exit(0);
      } else {
        console.error('❌ Falha na geração:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = FeatureDocumentationGenerator;
