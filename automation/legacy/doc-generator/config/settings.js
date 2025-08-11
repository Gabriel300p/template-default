#!/usr/bin/env node

/**
 * Configurações Centralizadas do Sistema de Documentação
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, 'user-settings.json');
    this.defaultSettings = this.getDefaultSettings();
    this.settings = this.loadSettings();
  }

  getDefaultSettings() {
    return {
      // Configurações OpenAI
      openai: {
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.3,
        timeout: 30000,
        enabled: true,
        fallbackEnabled: true
      },

      // Configurações de Output
      output: {
        baseDir: 'docs',
        formats: {
          dev: {
            enabled: true,
            path: 'dev',
            description: 'Documentação técnica para desenvolvedores'
          },
          ai: {
            enabled: true,
            path: 'ai',
            description: 'Contexto estruturado para IA/LLMs'
          },
          export: {
            enabled: true,
            path: 'export',
            description: 'Formato limpo para Wiki/ClickUp'
          }
        }
      },

      // Geradores de Documentação
      generators: {
        api: {
          enabled: true,
          name: 'API Documentation',
          description: 'Documenta endpoints, controllers e modelos',
          filePatterns: ['**/*.controller.ts', '**/api/**/*.ts', '**/routes/**/*.js']
        },
        components: {
          enabled: true,
          name: 'Component Documentation',
          description: 'Documenta componentes React/Vue e hooks',
          filePatterns: ['**/*.tsx', '**/*.vue', '**/components/**/*.ts']
        },
        architecture: {
          enabled: true,
          name: 'Architecture Documentation',
          description: 'Mapeia estrutura e padrões do projeto',
          filePatterns: ['**/src/**', '**/lib/**', '**/app/**']
        },
        database: {
          enabled: false,
          name: 'Database Documentation',
          description: 'Documenta schemas e modelos de dados',
          filePatterns: ['**/*.prisma', '**/models/**/*.ts', '**/schemas/**/*.js']
        },
        tests: {
          enabled: false,
          name: 'Test Documentation',
          description: 'Documenta estratégias e casos de teste',
          filePatterns: ['**/*.test.ts', '**/*.spec.js', '**/tests/**/*.ts']
        }
      },

      // Configurações de Análise
      analysis: {
        maxFileSize: 1024 * 1024, // 1MB
        excludePatterns: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/.git/**',
          '**/coverage/**'
        ],
        includePatterns: [
          '**/src/**',
          '**/lib/**',
          '**/app/**',
          '**/components/**',
          '**/pages/**'
        ]
      },

      // Configurações de Preview
      preview: {
        enabled: true,
        showSummary: true,
        showFileList: true,
        confirmBeforeGeneration: true
      },

      // Configurações de Performance
      performance: {
        maxConcurrentFiles: 10,
        batchSize: 5,
        enableCaching: true,
        cacheTimeout: 3600000 // 1 hour
      }
    };
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.configPath)) {
        const userSettings = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        return this.mergeSettings(this.defaultSettings, userSettings);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar configurações do usuário, usando padrões:', error.message);
    }
    return { ...this.defaultSettings };
  }

  mergeSettings(defaults, user) {
    const merged = { ...defaults };
    
    for (const [key, value] of Object.entries(user)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = this.mergeSettings(defaults[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  saveSettings(newSettings = null) {
    try {
      const settingsToSave = newSettings || this.settings;
      fs.writeFileSync(this.configPath, JSON.stringify(settingsToSave, null, 2));
      console.log('✅ Configurações salvas em:', this.configPath);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error.message);
      return false;
    }
  }

  get(path) {
    return this.getNestedValue(this.settings, path);
  }

  set(path, value) {
    this.setNestedValue(this.settings, path, value);
    return this;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (current[key] === undefined) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Métodos de conveniência
  getOpenAIConfig() {
    return this.get('openai');
  }

  getEnabledGenerators() {
    const generators = this.get('generators');
    return Object.entries(generators)
      .filter(([_, config]) => config.enabled)
      .map(([name, config]) => ({ name, ...config }));
  }

  getOutputFormats() {
    const formats = this.get('output.formats');
    return Object.entries(formats)
      .filter(([_, config]) => config.enabled)
      .map(([name, config]) => ({ name, ...config }));
  }

  isPreviewEnabled() {
    return this.get('preview.enabled');
  }

  shouldConfirmGeneration() {
    return this.get('preview.confirmBeforeGeneration');
  }

  // Validação de configurações
  validate() {
    const errors = [];
    
    // Validar OpenAI
    const openai = this.getOpenAIConfig();
    if (openai.enabled && !openai.model) {
      errors.push('Modelo OpenAI não especificado');
    }

    // Validar geradores
    const enabledGenerators = this.getEnabledGenerators();
    if (enabledGenerators.length === 0) {
      errors.push('Nenhum gerador habilitado');
    }

    // Validar formatos de saída
    const outputFormats = this.getOutputFormats();
    if (outputFormats.length === 0) {
      errors.push('Nenhum formato de saída habilitado');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Configuração interativa
  async interactiveSetup() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    console.log('\n🛠️ Configuração Interativa do Sistema de Documentação\n');

    try {
      // OpenAI Configuration
      console.log('🤖 Configuração OpenAI:');
      const enableOpenAI = await question('Habilitar OpenAI? (s/n) [s]: ') || 's';
      this.set('openai.enabled', enableOpenAI.toLowerCase() === 's');

      if (this.get('openai.enabled')) {
        const model = await question('Modelo OpenAI [gpt-4o-mini]: ') || 'gpt-4o-mini';
        this.set('openai.model', model);

        const temperature = await question('Temperature (0-1) [0.3]: ') || '0.3';
        this.set('openai.temperature', parseFloat(temperature));
      }

      // Generators Configuration
      console.log('\n📝 Geradores de Documentação:');
      const generators = this.get('generators');
      for (const [name, config] of Object.entries(generators)) {
        const enable = await question(`Habilitar ${config.name}? (s/n) [${config.enabled ? 's' : 'n'}]: `);
        if (enable) {
          this.set(`generators.${name}.enabled`, enable.toLowerCase() === 's');
        }
      }

      // Preview Configuration
      console.log('\n👀 Configuração de Preview:');
      const showPreview = await question('Mostrar preview antes de gerar? (s/n) [s]: ') || 's';
      this.set('preview.enabled', showPreview.toLowerCase() === 's');

      const confirmGeneration = await question('Confirmar antes de gerar? (s/n) [s]: ') || 's';
      this.set('preview.confirmBeforeGeneration', confirmGeneration.toLowerCase() === 's');

      console.log('\n✅ Configuração concluída!');
      
      const save = await question('Salvar configurações? (s/n) [s]: ') || 's';
      if (save.toLowerCase() === 's') {
        this.saveSettings();
      }

    } finally {
      rl.close();
    }
  }

  // Reset para padrões
  reset() {
    this.settings = { ...this.defaultSettings };
    console.log('🔄 Configurações resetadas para os padrões');
  }

  // Exibir configuração atual
  display() {
    console.log('\n📋 Configurações Atuais:');
    console.log('='.repeat(50));
    
    console.log('\n🤖 OpenAI:');
    const openai = this.getOpenAIConfig();
    console.log(`   Habilitado: ${openai.enabled ? '✅' : '❌'}`);
    console.log(`   Modelo: ${openai.model}`);
    console.log(`   Temperature: ${openai.temperature}`);
    
    console.log('\n📝 Geradores:');
    const generators = this.getEnabledGenerators();
    generators.forEach(gen => {
      console.log(`   ✅ ${gen.name}`);
    });

    console.log('\n📁 Formatos de Saída:');
    const formats = this.getOutputFormats();
    formats.forEach(format => {
      console.log(`   ✅ ${format.name} (${format.path})`);
    });

    console.log('\n👀 Preview:');
    console.log(`   Habilitado: ${this.get('preview.enabled') ? '✅' : '❌'}`);
    console.log(`   Confirmar: ${this.get('preview.confirmBeforeGeneration') ? '✅' : '❌'}`);

    console.log('='.repeat(50));
  }
}

module.exports = ConfigManager;
