#!/usr/bin/env node

/**
 * Classe Base para Geradores de Documentação
 * Fornece funcionalidades comuns e padronização
 */

const fs = require('fs');
const path = require('path');

class BaseGenerator {
  constructor(config, enhancer = null) {
    this.config = config;
    this.enhancer = enhancer;
    this.projectRoot = '';
    this.outputPath = '';
    this.generatedFiles = [];
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesProcessed: 0,
      documentsGenerated: 0,
      enhancementsApplied: 0,
      startTime: null,
      endTime: null
    };
  }

  // Método abstrato - deve ser implementado pelos geradores específicos
  async generate(projectRoot, outputPath) {
    throw new Error('Método generate() deve ser implementado pelo gerador específico');
  }

  // Configurar contexto de geração
  setupContext(projectRoot, outputPath) {
    this.projectRoot = projectRoot;
    this.outputPath = outputPath;
    this.stats.startTime = Date.now();
    this.generatedFiles = [];
    this.errors = [];
    this.warnings = [];
  }

  // Finalizar contexto de geração
  finalizeContext() {
    this.stats.endTime = Date.now();
    this.stats.documentsGenerated = this.generatedFiles.length;
  }

  // Utilitários de arquivo
  async readFile(filePath) {
    try {
      this.stats.filesProcessed++;
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      this.addError(`Erro ao ler arquivo ${filePath}: ${error.message}`);
      return null;
    }
  }

  async writeFile(filePath, content) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      this.generatedFiles.push(filePath);
      return true;
    } catch (error) {
      this.addError(`Erro ao escrever arquivo ${filePath}: ${error.message}`);
      return false;
    }
  }

  // Busca de arquivos com padrões
  findFiles(patterns, baseDir = null) {
    const searchDir = baseDir || this.projectRoot;
    const found = [];
    
    if (!fs.existsSync(searchDir)) {
      return found;
    }

    const searchRecursive = (dir) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(this.projectRoot, fullPath);
        
        // Verificar se deve ser excluído
        if (this.shouldExcludeFile(relativePath)) {
          continue;
        }
        
        if (item.isDirectory()) {
          searchRecursive(fullPath);
        } else if (item.isFile()) {
          // Verificar se corresponde aos padrões
          if (this.matchesPatterns(relativePath, patterns)) {
            found.push({
              fullPath,
              relativePath,
              name: item.name,
              ext: path.extname(item.name)
            });
          }
        }
      }
    };

    searchRecursive(searchDir);
    return found;
  }

  shouldExcludeFile(filePath) {
    const excludePatterns = this.config.get('analysis.excludePatterns') || [];
    return excludePatterns.some(pattern => {
      const regex = this.globToRegex(pattern);
      return regex.test(filePath);
    });
  }

  matchesPatterns(filePath, patterns) {
    return patterns.some(pattern => {
      const regex = this.globToRegex(pattern);
      return regex.test(filePath);
    });
  }

  globToRegex(glob) {
    const regex = glob
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.')
      .replace(/\?/g, '.');
    return new RegExp(`^${regex}$`);
  }

  // Enhancement com OpenAI
  async enhanceContent(content, type, context = {}) {
    if (!this.enhancer || !this.enhancer.isEnabled) {
      return content;
    }

    try {
      const enhanced = await this.enhancer.enhance(content, type, context);
      if (enhanced !== content) {
        this.stats.enhancementsApplied++;
      }
      return enhanced;
    } catch (error) {
      this.addWarning(`Erro ao melhorar conteúdo com OpenAI: ${error.message}`);
      return content;
    }
  }

  // Análise de código base
  analyzeCode(content, filePath) {
    const analysis = {
      filePath,
      size: content.length,
      lines: content.split('\n').length,
      functions: [],
      classes: [],
      exports: [],
      imports: [],
      comments: [],
      language: this.detectLanguage(filePath)
    };

    // Análise básica de JavaScript/TypeScript
    if (analysis.language === 'javascript' || analysis.language === 'typescript') {
      analysis.functions = this.extractFunctions(content);
      analysis.classes = this.extractClasses(content);
      analysis.exports = this.extractExports(content);
      analysis.imports = this.extractImports(content);
    }

    analysis.comments = this.extractComments(content);
    return analysis;
  }

  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.jsx': 'javascript',
      '.vue': 'vue',
      '.py': 'python',
      '.java': 'java',
      '.php': 'php',
      '.go': 'go',
      '.rs': 'rust'
    };
    return languageMap[ext] || 'unknown';
  }

  extractFunctions(content) {
    const functions = [];
    const patterns = [
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
      /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*\([^)]*\)\s*=>/g,
      /async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        functions.push({
          name: match[1],
          line: content.substring(0, match.index).split('\n').length
        });
      }
    });

    return functions;
  }

  extractClasses(content) {
    const classes = [];
    const classPattern = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      classes.push({
        name: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return classes;
  }

  extractExports(content) {
    const exports = [];
    const patterns = [
      /export\s+(?:default\s+)?(?:function\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /export\s*\{\s*([^}]+)\s*\}/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1].includes(',')) {
          // Multiple exports
          match[1].split(',').forEach(exp => {
            const name = exp.trim().replace(/\s+as\s+.*$/, '');
            if (name) exports.push({ name });
          });
        } else {
          exports.push({ name: match[1] });
        }
      }
    });

    return exports;
  }

  extractImports(content) {
    const imports = [];
    const importPattern = /import\s+(?:.*?\s+from\s+)?['"](.*?)['"]/g;
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({ source: match[1] });
    }

    return imports;
  }

  extractComments(content) {
    const comments = [];
    const patterns = [
      /\/\*\*(.*?)\*\//gs,  // JSDoc comments
      /\/\*(.*?)\*\//gs,    // Block comments
      /\/\/(.*)$/gm         // Line comments
    ];

    patterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const type = ['jsdoc', 'block', 'line'][index];
        comments.push({
          type,
          content: match[1].trim(),
          line: content.substring(0, match.index).split('\n').length
        });
      }
    });

    return comments;
  }

  // Geração de markdown
  generateMarkdown(sections) {
    let markdown = '';
    
    for (const section of sections) {
      switch (section.type) {
        case 'header':
          markdown += `${'#'.repeat(section.level)} ${section.content}\n\n`;
          break;
        case 'paragraph':
          markdown += `${section.content}\n\n`;
          break;
        case 'list':
          section.items.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += '\n';
          break;
        case 'code':
          markdown += `\`\`\`${section.language || ''}\n${section.content}\n\`\`\`\n\n`;
          break;
        case 'table':
          if (section.headers) {
            markdown += `| ${section.headers.join(' | ')} |\n`;
            markdown += `| ${section.headers.map(() => '---').join(' | ')} |\n`;
          }
          section.rows.forEach(row => {
            markdown += `| ${row.join(' | ')} |\n`;
          });
          markdown += '\n';
          break;
      }
    }

    return markdown;
  }

  // Utilitários de erro e log
  addError(message) {
    this.errors.push({
      message,
      timestamp: new Date().toISOString()
    });
  }

  addWarning(message) {
    this.warnings.push({
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Relatório de geração
  getGenerationReport() {
    const duration = this.stats.endTime - this.stats.startTime;
    
    return {
      success: this.errors.length === 0,
      stats: {
        ...this.stats,
        duration,
        errorCount: this.errors.length,
        warningCount: this.warnings.length
      },
      files: this.generatedFiles,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  // Log formatado
  log(message, level = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${icons[level]} ${message}`);
  }
}

module.exports = BaseGenerator;
