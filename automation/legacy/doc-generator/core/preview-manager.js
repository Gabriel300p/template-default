#!/usr/bin/env node

/**
 * Sistema de Preview e Confirmação
 */

const fs = require('fs');
const path = require('path');

class PreviewManager {
  constructor(config) {
    this.config = config;
    this.analysisResults = null;
  }

  async analyzeProject(projectRoot) {
    console.log('🔍 Analisando projeto para preview...');
    
    this.analysisResults = {
      projectRoot,
      detectedTechnologies: [],
      fileStats: {
        total: 0,
        byType: {},
        byGenerator: {}
      },
      estimatedDocs: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };

    await this.scanProjectStructure(projectRoot);
    await this.detectTechnologies(projectRoot);
    await this.estimateDocumentation();
    
    return this.analysisResults;
  }

  async scanProjectStructure(rootPath) {
    const includePatterns = this.config.get('analysis.includePatterns') || ['**/*'];
    const excludePatterns = this.config.get('analysis.excludePatterns') || [];
    
    const stats = {
      total: 0,
      byType: {},
      byGenerator: {}
    };

    const scanDir = (dirPath) => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.relative(rootPath, fullPath);
        
        // Verificar exclusões
        if (this.shouldExclude(relativePath, excludePatterns)) {
          continue;
        }
        
        if (item.isDirectory()) {
          scanDir(fullPath);
        } else if (item.isFile()) {
          stats.total++;
          
          // Contar por tipo de arquivo
          const ext = path.extname(item.name).toLowerCase();
          stats.byType[ext] = (stats.byType[ext] || 0) + 1;
          
          // Contar por gerador que processaria
          const generator = this.getGeneratorForFile(relativePath);
          if (generator) {
            stats.byGenerator[generator] = (stats.byGenerator[generator] || 0) + 1;
          }
        }
      }
    };

    scanDir(rootPath);
    this.analysisResults.fileStats = stats;
  }

  shouldExclude(filePath, excludePatterns) {
    return excludePatterns.some(pattern => {
      // Converter glob pattern em regex simples
      const regex = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      return new RegExp(regex).test(filePath);
    });
  }

  getGeneratorForFile(filePath) {
    const generators = this.config.getEnabledGenerators();
    
    for (const generator of generators) {
      for (const pattern of generator.filePatterns || []) {
        const regex = pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\./g, '\\.');
        if (new RegExp(regex).test(filePath)) {
          return generator.name;
        }
      }
    }
    
    return null;
  }

  async detectTechnologies(rootPath) {
    const technologies = [];
    
    // Verificar package.json
    const packageJsonPath = path.join(rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // React
        if (deps.react) {
          technologies.push({
            name: 'React',
            version: deps.react,
            type: 'frontend',
            confidence: 'high'
          });
        }
        
        // Vue
        if (deps.vue) {
          technologies.push({
            name: 'Vue.js',
            version: deps.vue,
            type: 'frontend',
            confidence: 'high'
          });
        }
        
        // NestJS
        if (deps['@nestjs/core']) {
          technologies.push({
            name: 'NestJS',
            version: deps['@nestjs/core'],
            type: 'backend',
            confidence: 'high'
          });
        }
        
        // Express
        if (deps.express) {
          technologies.push({
            name: 'Express.js',
            version: deps.express,
            type: 'backend',
            confidence: 'high'
          });
        }
        
        // TypeScript
        if (deps.typescript || deps['@types/node']) {
          technologies.push({
            name: 'TypeScript',
            version: deps.typescript || 'detected',
            type: 'language',
            confidence: 'high'
          });
        }
        
        // Prisma
        if (deps.prisma || deps['@prisma/client']) {
          technologies.push({
            name: 'Prisma',
            version: deps.prisma || deps['@prisma/client'],
            type: 'database',
            confidence: 'high'
          });
        }
        
      } catch (error) {
        this.analysisResults.warnings.push(`Erro ao analisar package.json: ${error.message}`);
      }
    }

    // Verificar arquivos específicos
    const configFiles = [
      { file: 'tsconfig.json', tech: 'TypeScript' },
      { file: 'tailwind.config.js', tech: 'Tailwind CSS' },
      { file: 'vite.config.ts', tech: 'Vite' },
      { file: 'next.config.js', tech: 'Next.js' },
      { file: 'nuxt.config.js', tech: 'Nuxt.js' },
      { file: 'docker-compose.yml', tech: 'Docker' },
      { file: 'prisma/schema.prisma', tech: 'Prisma' }
    ];

    for (const { file, tech } of configFiles) {
      if (fs.existsSync(path.join(rootPath, file))) {
        if (!technologies.find(t => t.name === tech)) {
          technologies.push({
            name: tech,
            version: 'detected',
            type: 'tool',
            confidence: 'medium'
          });
        }
      }
    }

    this.analysisResults.detectedTechnologies = technologies;
  }

  async estimateDocumentation() {
    const estimatedDocs = [];
    const generators = this.config.getEnabledGenerators();
    const formats = this.config.getOutputFormats();

    for (const generator of generators) {
      const fileCount = this.analysisResults.fileStats.byGenerator[generator.name] || 0;
      
      if (fileCount > 0) {
        for (const format of formats) {
          estimatedDocs.push({
            generator: generator.name,
            format: format.name,
            estimatedFiles: this.estimateOutputFiles(generator, fileCount),
            fileCount,
            description: `${generator.description} - ${format.description}`
          });
        }
      }
    }

    this.analysisResults.estimatedDocs = estimatedDocs;
  }

  estimateOutputFiles(generator, inputFileCount) {
    // Lógica para estimar quantos arquivos de documentação serão gerados
    switch (generator.name) {
      case 'API Documentation':
        return Math.ceil(inputFileCount / 3); // Agrupa endpoints por controller
      case 'Component Documentation':
        return Math.ceil(inputFileCount / 2); // Agrupa componentes relacionados
      case 'Architecture Documentation':
        return 3; // Overview, structure, patterns
      default:
        return Math.max(1, Math.ceil(inputFileCount / 5));
    }
  }

  displayPreview() {
    if (!this.analysisResults) {
      console.log('❌ Nenhuma análise disponível para preview');
      return;
    }

    const results = this.analysisResults;
    
    console.log('\n' + '='.repeat(70));
    console.log('📋 PREVIEW DA DOCUMENTAÇÃO A SER GERADA');
    console.log('='.repeat(70));
    
    // Informações do projeto
    console.log(`\n📁 Projeto: ${path.basename(results.projectRoot)}`);
    console.log(`🕒 Analisado em: ${new Date(results.timestamp).toLocaleString()}`);
    
    // Tecnologias detectadas
    if (results.detectedTechnologies.length > 0) {
      console.log('\n🔍 Tecnologias Detectadas:');
      results.detectedTechnologies.forEach(tech => {
        const confidenceIcon = tech.confidence === 'high' ? '🎯' : '❓';
        console.log(`   ${confidenceIcon} ${tech.name} ${tech.version !== 'detected' ? `(v${tech.version})` : ''}`);
      });
    }
    
    // Estatísticas de arquivos
    console.log('\n📊 Estatísticas de Arquivos:');
    console.log(`   📄 Total: ${results.fileStats.total} arquivos`);
    
    if (Object.keys(results.fileStats.byType).length > 0) {
      console.log('   Por tipo:');
      Object.entries(results.fileStats.byType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([ext, count]) => {
          const icon = this.getFileTypeIcon(ext);
          console.log(`     ${icon} ${ext || '(sem extensão)'}: ${count}`);
        });
    }
    
    // Documentação estimada
    if (results.estimatedDocs.length > 0) {
      console.log('\n📝 Documentação a ser Gerada:');
      const groupedByFormat = {};
      
      results.estimatedDocs.forEach(doc => {
        if (!groupedByFormat[doc.format]) {
          groupedByFormat[doc.format] = [];
        }
        groupedByFormat[doc.format].push(doc);
      });
      
      Object.entries(groupedByFormat).forEach(([format, docs]) => {
        console.log(`\n   📁 Formato: ${format}`);
        docs.forEach(doc => {
          console.log(`     ✨ ${doc.generator}: ~${doc.estimatedFiles} arquivo(s)`);
          console.log(`        📄 Baseado em ${doc.fileCount} arquivo(s) fonte`);
        });
      });
    }
    
    // Warnings
    if (results.warnings.length > 0) {
      console.log('\n⚠️ Avisos:');
      results.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }
    
    // Estimativa de tempo
    const estimatedTime = this.estimateGenerationTime();
    console.log(`\n⏱️ Tempo Estimado: ${estimatedTime}`);
    
    // Configuração OpenAI
    const openaiConfig = this.config.getOpenAIConfig();
    console.log(`\n🤖 OpenAI: ${openaiConfig.enabled ? '✅ Ativo' : '❌ Desabilitado'}`);
    if (openaiConfig.enabled) {
      console.log(`   📱 Modelo: ${openaiConfig.model}`);
      console.log(`   🌡️ Temperature: ${openaiConfig.temperature}`);
    }
    
    console.log('\n' + '='.repeat(70));
  }

  getFileTypeIcon(ext) {
    const icons = {
      '.js': '📜',
      '.ts': '📘',
      '.tsx': '⚛️',
      '.jsx': '⚛️',
      '.vue': '💚',
      '.py': '🐍',
      '.java': '☕',
      '.php': '🐘',
      '.go': '🐹',
      '.rs': '🦀',
      '.json': '📋',
      '.md': '📝',
      '.yml': '⚙️',
      '.yaml': '⚙️',
      '.css': '🎨',
      '.scss': '🎨',
      '.html': '🌐'
    };
    return icons[ext] || '📄';
  }

  estimateGenerationTime() {
    const fileCount = this.analysisResults.fileStats.total;
    const openaiEnabled = this.config.get('openai.enabled');
    
    if (fileCount < 10) {
      return openaiEnabled ? '30s - 2min' : '5-15s';
    } else if (fileCount < 50) {
      return openaiEnabled ? '2-5min' : '15-30s';
    } else if (fileCount < 200) {
      return openaiEnabled ? '5-15min' : '30s-2min';
    } else {
      return openaiEnabled ? '15min+' : '2-5min';
    }
  }

  async confirmGeneration() {
    if (!this.config.shouldConfirmGeneration()) {
      return true;
    }

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
      console.log('\n❓ Deseja continuar com a geração da documentação?');
      const response = await question('   (s/n) [s]: ') || 's';
      return response.toLowerCase() === 's';
    } finally {
      rl.close();
    }
  }

  generateSummaryReport() {
    if (!this.analysisResults) return null;

    const results = this.analysisResults;
    const totalEstimatedFiles = results.estimatedDocs.reduce((sum, doc) => sum + doc.estimatedFiles, 0);
    
    return {
      projectName: path.basename(results.projectRoot),
      timestamp: results.timestamp,
      technologies: results.detectedTechnologies.length,
      sourceFiles: results.fileStats.total,
      estimatedDocs: totalEstimatedFiles,
      formats: this.config.getOutputFormats().length,
      generators: this.config.getEnabledGenerators().length,
      openaiEnabled: this.config.get('openai.enabled'),
      warnings: results.warnings.length
    };
  }
}

module.exports = PreviewManager;
