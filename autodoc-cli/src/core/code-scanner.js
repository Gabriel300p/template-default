/**
 * Code Scanner - Escaneia e encontra arquivos de código
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

class CodeScanner {
  constructor() {
    this.defaultExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.py'];
    this.defaultExcludePatterns = [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.next/**',
      '.nuxt/**',
      '__pycache__/**',
      '*.min.js',
      '*.test.*',
      '*.spec.*'
    ];
  }

  /**
   * Escaneia arquivos de código em um diretório
   */
  async scanFiles(directory, options = {}) {
    const {
      extensions = this.defaultExtensions,
      excludePatterns = this.defaultExcludePatterns,
      includeTests = false
    } = options;

    // Converter extensões para padrão glob
    const extensionPattern = extensions.length > 1 
      ? `{${extensions.join(',')}}` 
      : extensions[0];

    // Padrão de busca - normalizar para glob (sempre usar / mesmo no Windows)
    const searchPattern = (directory + '/**/*' + extensionPattern).replace(/\\/g, '/');
    
    try {
      // Buscar arquivos
      const files = await glob(searchPattern, {
        ignore: includeTests ? excludePatterns.filter(p => !p.includes('test') && !p.includes('spec')) : excludePatterns,
        absolute: true,
        nodir: true
      });

      // Filtrar e normalizar caminhos
      return files
        .filter(file => this.isValidCodeFile(file))
        .sort();

    } catch (error) {
      console.warn(`⚠️ Erro ao escanear diretório ${directory}:`, error.message);
      return [];
    }
  }

  /**
   * Escaneia estrutura de diretórios para detectar padrões
   */
  async scanStructure(directory) {
    const structure = {
      hasComponents: false,
      hasPages: false,
      hasHooks: false,
      hasServices: false,
      hasUtils: false,
      hasTypes: false,
      directories: []
    };

    try {
      await this.scanStructureRecursive(directory, structure, 0);
    } catch (error) {
      console.warn(`⚠️ Erro ao escanear estrutura:`, error.message);
    }

    return structure;
  }

  async scanStructureRecursive(dir, structure, depth) {
    if (depth > 5) return; // Limitar profundidade

    const items = await fs.readdir(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        const dirName = item.toLowerCase();
        
        // Detectar padrões
        if (dirName.includes('component')) structure.hasComponents = true;
        if (dirName.includes('page')) structure.hasPages = true;
        if (dirName.includes('hook')) structure.hasHooks = true;
        if (dirName.includes('service')) structure.hasServices = true;
        if (dirName.includes('util') || dirName.includes('helper')) structure.hasUtils = true;
        if (dirName.includes('type') || dirName.includes('@type')) structure.hasTypes = true;

        structure.directories.push({
          name: item,
          path: itemPath,
          depth
        });

        // Recursão
        await this.scanStructureRecursive(itemPath, structure, depth + 1);
      }
    }
  }

  /**
   * Encontra arquivos de configuração relevantes
   */
  async findConfigFiles(directory) {
    const configPatterns = [
      'package.json',
      'tsconfig.json',
      'jsconfig.json',
      '.autodoc.yml',
      '.autodoc.yaml',
      '.autodoc.json',
      'vite.config.*',
      'webpack.config.*',
      'next.config.*',
      'nuxt.config.*',
      'vue.config.*'
    ];

    const configFiles = [];

    for (const pattern of configPatterns) {
      try {
        const files = await glob(path.join(directory, pattern), { absolute: true });
        configFiles.push(...files);
      } catch (error) {
        // Ignorar erros
      }
    }

    return configFiles;
  }

  /**
   * Analisa dependências de um arquivo
   */
  async analyzeDependencies(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const extension = path.extname(filePath);

      if (['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
        return this.analyzeJavaScriptDependencies(content);
      }

      if (extension === '.py') {
        return this.analyzePythonDependencies(content);
      }

      if (extension === '.vue') {
        return this.analyzeVueDependencies(content);
      }

    } catch (error) {
      console.warn(`⚠️ Erro ao analisar dependências de ${filePath}:`, error.message);
    }

    return [];
  }

  analyzeJavaScriptDependencies(content) {
    const dependencies = [];

    // Import statements
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push({
        type: 'import',
        source: match[1],
        isRelative: match[1].startsWith('.'),
        isNodeModule: !match[1].startsWith('.')
      });
    }

    // Require statements
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.push({
        type: 'require',
        source: match[1],
        isRelative: match[1].startsWith('.'),
        isNodeModule: !match[1].startsWith('.')
      });
    }

    return dependencies;
  }

  analyzePythonDependencies(content) {
    const dependencies = [];

    // Import statements
    const importRegex = /(?:from\s+([^\s]+)\s+)?import\s+([^\n]+)/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push({
        type: 'import',
        module: match[1] || 'builtin',
        items: match[2].split(',').map(item => item.trim()),
        isRelative: match[1] && match[1].startsWith('.')
      });
    }

    return dependencies;
  }

  analyzeVueDependencies(content) {
    // Extrair script do Vue SFC
    const scriptMatch = content.match(/<script[^>]*>(.*?)<\/script>/s);
    if (scriptMatch) {
      return this.analyzeJavaScriptDependencies(scriptMatch[1]);
    }

    return [];
  }

  /**
   * Verifica se é um arquivo de código válido
   */
  isValidCodeFile(filePath) {
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);

    // Ignorar arquivos de teste se não incluídos
    if (fileName.includes('.test.') || fileName.includes('.spec.')) {
      return false;
    }

    // Ignorar arquivos minificados
    if (fileName.includes('.min.')) {
      return false;
    }

    // Ignorar arquivos de configuração específicos
    const configFiles = [
      'webpack.config.js',
      'vite.config.js',
      'jest.config.js',
      'tailwind.config.js'
    ];

    if (configFiles.includes(fileName)) {
      return false;
    }

    return true;
  }

  /**
   * Obtém estatísticas de um conjunto de arquivos
   */
  async getFileStats(files) {
    const stats = {
      totalFiles: files.length,
      totalLines: 0,
      totalSize: 0,
      byExtension: {},
      byDirectory: {}
    };

    for (const file of files) {
      try {
        const stat = await fs.stat(file);
        const content = await fs.readFile(file, 'utf8');
        const extension = path.extname(file);
        const directory = path.dirname(file);

        stats.totalSize += stat.size;
        stats.totalLines += content.split('\n').length;

        // Por extensão
        if (!stats.byExtension[extension]) {
          stats.byExtension[extension] = { count: 0, lines: 0, size: 0 };
        }
        stats.byExtension[extension].count++;
        stats.byExtension[extension].lines += content.split('\n').length;
        stats.byExtension[extension].size += stat.size;

        // Por diretório
        const dirName = path.basename(directory);
        if (!stats.byDirectory[dirName]) {
          stats.byDirectory[dirName] = { count: 0, lines: 0, size: 0 };
        }
        stats.byDirectory[dirName].count++;
        stats.byDirectory[dirName].lines += content.split('\n').length;
        stats.byDirectory[dirName].size += stat.size;

      } catch (error) {
        // Ignorar erros de arquivo específico
      }
    }

    return stats;
  }
}

module.exports = { CodeScanner };
