/**
 * AutoDoc Engine - Motor principal refatorado
 * Baseado no sistema FeatureDocsEngine existente, adaptado para uso universal
 */

const fs = require('fs-extra');
const path = require('path');
const { ComponentAnalyzer } = require('../analyzers/component-analyzer');
const { CodeScanner } = require('./code-scanner');
const { DocumentationGenerator } = require('../generators/documentation-generator');
const { GitAnalyzer } = require('./git-analyzer');

class AutoDocEngine {
  constructor(options = {}) {
    this.componentAnalyzer = new ComponentAnalyzer();
    this.codeScanner = new CodeScanner();
    this.docGenerator = new DocumentationGenerator();
    this.gitAnalyzer = new GitAnalyzer();
    this.options = options;
  }

  /**
   * Gera documentação completa
   */
  async generate(config) {
    const startTime = Date.now();
    
    try {
      // 1. Detectar estrutura do projeto
      const projectStructure = await this.analyzeProjectStructure(config);
      
      // 2. Analisar código-fonte com AST
      const codeAnalysis = await this.analyzeCodebase(config, projectStructure);
      
      // 3. Gerar documentação
      const docs = await this.generateDocumentation(codeAnalysis, config);
      
      // 4. Salvar arquivos
      const files = await this.saveDocumentation(docs, config);
      
      const endTime = Date.now();
      
      return {
        success: true,
        files,
        stats: {
          analysisTime: endTime - startTime,
          generationTime: docs.generationTime || 0,
          totalFiles: codeAnalysis.totalFiles,
          componentsAnalyzed: codeAnalysis.components?.length || 0,
          functionsAnalyzed: codeAnalysis.functions?.length || 0,
          ai: docs.aiStats
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: process.env.DEBUG ? error.stack : undefined
      };
    }
  }

  /**
   * Apenas analisa sem gerar documentação
   */
  async analyze(config) {
    const projectStructure = await this.analyzeProjectStructure(config);
    const codeAnalysis = await this.analyzeCodebase(config, projectStructure);
    
    return {
      totalFiles: codeAnalysis.totalFiles,
      components: codeAnalysis.components,
      functions: codeAnalysis.functions,
      classes: codeAnalysis.classes,
      imports: codeAnalysis.imports,
      exports: codeAnalysis.exports,
      stats: codeAnalysis.stats
    };
  }

  /**
   * Analisa estrutura do projeto
   */
  async analyzeProjectStructure(config) {
    const sourceDir = config.project?.sourceDir || './src';
    const projectRoot = process.cwd();
    
    // Verificar se é repositório Git
    const isGitRepo = await this.gitAnalyzer.checkGitRepository();
    
    // Detectar tipo de projeto
    const packageJsonPath = path.join(projectRoot, 'package.json');
    let projectInfo = {};
    
    if (await fs.exists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        projectInfo = {
          name: packageJson.name,
          version: packageJson.version,
          type: this.detectProjectType(packageJson),
          dependencies: packageJson.dependencies,
          devDependencies: packageJson.devDependencies
        };
      } catch (error) {
        console.warn('⚠️ Erro ao ler package.json:', error.message);
      }
    }

    // Escanear estrutura de diretórios
    const structure = await this.scanDirectoryStructure(sourceDir);
    
    return {
      projectRoot,
      sourceDir,
      isGitRepo,
      projectInfo,
      structure
    };
  }

  /**
   * Analisa código-fonte usando AST
   */
  async analyzeCodebase(config, projectStructure) {
    const { sourceDir } = projectStructure;
    
    // Escanear todos os arquivos de código
    const codeFiles = await this.codeScanner.scanFiles(sourceDir, {
      extensions: this.getSupportedExtensions(config.project?.language),
      excludePatterns: config.exclude || ['node_modules', '.git', 'dist', 'build']
    });

    const analysis = {
      totalFiles: codeFiles.length,
      components: [],
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      stats: {}
    };

    // Analisar cada arquivo
    for (const filePath of codeFiles) {
      try {
        const fileAnalysis = await this.analyzeFile(filePath, config);
        
        if (fileAnalysis) {
          // Agregar resultados
          if (fileAnalysis.components) analysis.components.push(...fileAnalysis.components);
          if (fileAnalysis.functions) analysis.functions.push(...fileAnalysis.functions);
          if (fileAnalysis.classes) analysis.classes.push(...fileAnalysis.classes);
          if (fileAnalysis.imports) analysis.imports.push(...fileAnalysis.imports);
          if (fileAnalysis.exports) analysis.exports.push(...fileAnalysis.exports);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao analisar ${filePath}:`, error.message);
      }
    }

    return analysis;
  }

  /**
   * Analisa um arquivo específico
   */
  async analyzeFile(filePath, config) {
    const ext = path.extname(filePath).toLowerCase();
    
    // Usar ComponentAnalyzer para React/Vue components
    if (['.tsx', '.jsx', '.vue'].includes(ext)) {
      return await this.componentAnalyzer.analyzeComponent(filePath);
    }
    
    // Para outros arquivos TypeScript/JavaScript
    if (['.ts', '.js'].includes(ext)) {
      return await this.componentAnalyzer.analyzeService(filePath);
    }
    
    // Python (implementação básica)
    if (ext === '.py') {
      return await this.analyzePythonFile(filePath);
    }
    
    return null;
  }

  /**
   * Implementação básica para análise de Python
   */
  async analyzePythonFile(filePath) {
    // Placeholder para análise Python
    // Será expandido na próxima versão
    const content = await fs.readFile(filePath, 'utf8');
    
    return {
      filePath,
      type: 'python',
      functions: this.extractPythonFunctions(content),
      classes: this.extractPythonClasses(content),
      imports: this.extractPythonImports(content)
    };
  }

  /**
   * Gera documentação baseada na análise
   */
  async generateDocumentation(codeAnalysis, config) {
    const startTime = Date.now();
    
    const docs = await this.docGenerator.generate({
      analysis: codeAnalysis,
      config,
      template: config.generation?.template || 'standard',
      useAI: config.ai?.enabled || false,
      aiConfig: config.ai
    });
    
    const endTime = Date.now();
    
    return {
      ...docs,
      generationTime: endTime - startTime
    };
  }

  /**
   * Salva documentação em arquivos
   */
  async saveDocumentation(docs, config) {
    const outputDir = config.project?.outputDir || './docs';
    const savedFiles = [];
    
    // Criar diretório se não existir
    await fs.ensureDir(outputDir);
    
    // Salvar cada documento
    for (const [filename, content] of Object.entries(docs.files || {})) {
      const filePath = path.join(outputDir, filename);
      await fs.writeFile(filePath, content, 'utf8');
      savedFiles.push(filePath);
    }
    
    return savedFiles;
  }

  /**
   * Retorna templates disponíveis
   */
  async getAvailableTemplates() {
    return [
      {
        name: 'standard',
        description: 'Documentação completa com todas as seções'
      },
      {
        name: 'simple',
        description: 'Documentação simples focada no essencial'
      },
      {
        name: 'api',
        description: 'Focada em documentação de APIs'
      },
      {
        name: 'components',
        description: 'Focada em componentes UI'
      }
    ];
  }

  // Métodos auxiliares
  
  detectProjectType(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.react) return 'react';
    if (deps.vue) return 'vue';
    if (deps.angular) return 'angular';
    if (deps.next) return 'nextjs';
    if (deps.nuxt) return 'nuxtjs';
    if (deps.typescript) return 'typescript';
    
    return 'javascript';
  }

  getSupportedExtensions(language) {
    const extensionMap = {
      typescript: ['.ts', '.tsx'],
      javascript: ['.js', '.jsx'],
      python: ['.py'],
      auto: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.py']
    };
    
    return extensionMap[language] || extensionMap.auto;
  }

  async scanDirectoryStructure(dir) {
    const structure = {};
    
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          structure[item] = await this.scanDirectoryStructure(itemPath);
        } else {
          structure[item] = 'file';
        }
      }
    } catch (error) {
      // Ignorar erros de acesso
    }
    
    return structure;
  }

  // Métodos básicos para Python (serão expandidos)
  extractPythonFunctions(content) {
    const functionRegex = /def\s+(\w+)\s*\([^)]*\):/g;
    const functions = [];
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'function'
      });
    }
    
    return functions;
  }

  extractPythonClasses(content) {
    const classRegex = /class\s+(\w+)(?:\([^)]*\))?:/g;
    const classes = [];
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      classes.push({
        name: match[1],
        type: 'class'
      });
    }
    
    return classes;
  }

  extractPythonImports(content) {
    const importRegex = /(?:from\s+(\S+)\s+)?import\s+([^\n]+)/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        module: match[1] || 'builtin',
        items: match[2].split(',').map(item => item.trim())
      });
    }
    
    return imports;
  }
}

module.exports = { AutoDocEngine };
