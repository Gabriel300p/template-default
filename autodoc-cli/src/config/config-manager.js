/**
 * Config Manager - Gerenciamento de configurações do AutoDoc
 * Sistema flexível baseado no sistema existente, adaptado para uso universal
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('yaml');

class ConfigManager {
  constructor() {
    this.defaultConfig = {
      project: {
        name: 'untitled-project',
        language: 'auto',
        sourceDir: './src',
        outputDir: './docs'
      },
      
      generation: {
        template: 'standard',
        format: 'markdown',
        includePrivate: false,
        includeTests: false,
        createIndex: true,
        groupByFeature: true
      },

      analysis: {
        complexityThreshold: 10,
        maxDepth: 5,
        followImports: true,
        extractComments: true
      },

      ai: {
        enabled: false,
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.3,
        apiKey: null
      },

      git: {
        enabled: true,
        baseBranch: 'main',
        includeCommitInfo: true
      },

      exclude: [
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage',
        '.next',
        '.nuxt',
        '__pycache__'
      ]
    };

    this.configFiles = [
      '.autodoc.yml',
      '.autodoc.yaml',
      '.autodoc.json',
      'autodoc.config.yml',
      'autodoc.config.yaml',
      'autodoc.config.json'
    ];
  }

  /**
   * Carrega configuração ou cria uma nova se não existir
   */
  async loadOrCreate(configPath = null) {
    if (configPath && await fs.exists(configPath)) {
      return await this.load(configPath);
    }

    // Procurar arquivo de configuração
    const foundConfig = await this.findConfigFile();
    if (foundConfig) {
      return await this.load(foundConfig);
    }

    // Retornar configuração padrão
    return this.defaultConfig;
  }

  /**
   * Carrega configuração de arquivo específico
   */
  async load(configPath = null) {
    const configFile = configPath || await this.findConfigFile();
    
    if (!configFile || !await fs.exists(configFile)) {
      return this.defaultConfig;
    }

    try {
      const content = await fs.readFile(configFile, 'utf8');
      let config;

      if (configFile.endsWith('.json')) {
        config = JSON.parse(content);
      } else {
        config = yaml.parse(content);
      }

      return this.mergeConfig(this.defaultConfig, config);

    } catch (error) {
      console.warn(`⚠️ Erro ao carregar configuração ${configFile}:`, error.message);
      return this.defaultConfig;
    }
  }

  /**
   * Cria nova configuração
   */
  async create(config, configPath = '.autodoc.yml') {
    const finalConfig = this.mergeConfig(this.defaultConfig, config);
    
    try {
      let content;

      if (configPath.endsWith('.json')) {
        content = JSON.stringify(finalConfig, null, 2);
      } else {
        content = yaml.stringify(finalConfig);
      }

      await fs.writeFile(configPath, content, 'utf8');
      return finalConfig;

    } catch (error) {
      throw new Error(`Erro ao criar configuração: ${error.message}`);
    }
  }

  /**
   * Atualiza configuração existente
   */
  async update(updates, configPath = null) {
    const currentConfig = await this.load(configPath);
    const newConfig = this.mergeConfig(currentConfig, updates);
    
    const configFile = configPath || await this.findConfigFile() || '.autodoc.yml';
    await this.create(newConfig, configFile);
    
    return newConfig;
  }

  /**
   * Define valor específico na configuração
   */
  async set(keyPath, value, configPath = null) {
    const config = await this.load(configPath);
    
    // Navegar pelo path (ex: "ai.enabled")
    const keys = keyPath.split('.');
    let current = config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    const finalKey = keys[keys.length - 1];
    current[finalKey] = this.parseValue(value);
    
    const configFile = configPath || await this.findConfigFile() || '.autodoc.yml';
    await this.create(config, configFile);
    
    return config;
  }

  /**
   * Verifica se existe configuração
   */
  async hasConfig() {
    return (await this.findConfigFile()) !== null;
  }

  /**
   * Encontra arquivo de configuração existente
   */
  async findConfigFile() {
    for (const configFile of this.configFiles) {
      if (await fs.exists(configFile)) {
        return configFile;
      }
    }
    return null;
  }

  /**
   * Mescla configurações (deep merge)
   */
  mergeConfig(defaultConfig, userConfig) {
    const merged = JSON.parse(JSON.stringify(defaultConfig));
    
    return this.deepMerge(merged, userConfig);
  }

  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  /**
   * Parse valores de string para tipos apropriados
   */
  parseValue(value) {
    if (typeof value !== 'string') return value;
    
    // Boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    
    // JSON
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value);
      } catch (error) {
        // Se não conseguir parsear, retornar como string
      }
    }
    
    return value;
  }

  /**
   * Valida configuração
   */
  validateConfig(config) {
    const errors = [];

    // Validar estrutura básica
    if (!config.project) {
      errors.push('Seção "project" é obrigatória');
    }

    if (!config.generation) {
      errors.push('Seção "generation" é obrigatória');
    }

    // Validar valores específicos
    if (config.project?.sourceDir && !fs.existsSync(config.project.sourceDir)) {
      errors.push(`Diretório de origem não existe: ${config.project.sourceDir}`);
    }

    if (config.ai?.enabled && !config.ai?.apiKey && !process.env.OPENAI_API_KEY) {
      errors.push('API Key da OpenAI é obrigatória quando IA está habilitada');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera configuração de exemplo
   */
  generateExampleConfig(projectType = 'javascript') {
    const examples = {
      javascript: {
        project: {
          name: 'my-javascript-project',
          language: 'javascript',
          sourceDir: './src',
          outputDir: './docs'
        },
        generation: {
          template: 'standard',
          format: 'markdown',
          includePrivate: false,
          includeTests: false
        },
        ai: {
          enabled: true,
          model: 'gpt-4o-mini'
        }
      },
      
      react: {
        project: {
          name: 'my-react-app',
          language: 'typescript',
          sourceDir: './src',
          outputDir: './docs'
        },
        generation: {
          template: 'components',
          format: 'markdown',
          includePrivate: false,
          includeTests: true
        },
        ai: {
          enabled: true,
          model: 'gpt-4o-mini'
        }
      },

      python: {
        project: {
          name: 'my-python-project',
          language: 'python',
          sourceDir: './',
          outputDir: './docs'
        },
        generation: {
          template: 'standard',
          format: 'markdown',
          includePrivate: false,
          includeTests: false
        },
        ai: {
          enabled: true,
          model: 'gpt-4o-mini'
        }
      }
    };

    return examples[projectType] || examples.javascript;
  }

  /**
   * Exporta configuração atual
   */
  async exportConfig(format = 'yaml') {
    const config = await this.load();
    
    if (format === 'json') {
      return JSON.stringify(config, null, 2);
    }
    
    return yaml.stringify(config);
  }
}

module.exports = { ConfigManager };
