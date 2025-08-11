/**
 * Settings Manager - Gerenciamento de configurações
 * Sistema flexível de configurações para o Feature Documentation System
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor(customConfig = {}) {
    this.defaultConfig = {
      // Configurações de análise
      analysis: {
        includePrivate: false,
        includeTests: false,
        complexityThreshold: 10,
        maxDepth: 5
      },
      
      // Configurações de saída
      output: {
        path: './docs/features',
        format: 'markdown',
        createIndex: true,
        groupByFeature: true
      },
      
      // Configurações de templates
      templates: {
        default: 'standard',
        audience: 'developer',
        language: 'pt-BR'
      },
      
      // Configurações Git
      git: {
        enabled: true,
        baseBranch: 'main',
        includeCommitInfo: true
      },
      
      // Configurações de UI
      ui: {
        interactive: true,
        showPreview: true,
        confirmGeneration: true
      },
      
      // Configurações OpenAI
      ai: {
        enabled: false,
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.3
      }
    };
    
    this.config = this.mergeConfig(this.defaultConfig, customConfig);
    this.configPath = path.join(process.cwd(), 'feature-docs.config.json');
  }

  /**
   * Mescla configurações padrão com customizadas
   */
  mergeConfig(defaultConfig, customConfig) {
    const merged = { ...defaultConfig };
    
    for (const [key, value] of Object.entries(customConfig)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  /**
   * Carrega configuração de arquivo
   */
  loadFromFile(configPath = this.configPath) {
    try {
      if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.config = this.mergeConfig(this.defaultConfig, fileConfig);
        return true;
      }
    } catch (error) {
      console.warn(`Erro ao carregar configuração: ${error.message}`);
    }
    return false;
  }

  /**
   * Salva configuração atual no arquivo
   */
  saveToFile(configPath = this.configPath) {
    try {
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
      return true;
    } catch (error) {
      console.error(`Erro ao salvar configuração: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtém valor de configuração
   */
  get(path) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Define valor de configuração
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.config;
    
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }

  /**
   * Valida configuração atual
   */
  validate() {
    const errors = [];
    
    // Validar output path
    if (!this.config.output.path) {
      errors.push('output.path é obrigatório');
    }
    
    // Validar formato de saída
    const validFormats = ['markdown', 'html', 'json'];
    if (!validFormats.includes(this.config.output.format)) {
      errors.push(`output.format deve ser um de: ${validFormats.join(', ')}`);
    }
    
    // Validar threshold de complexidade
    if (typeof this.config.analysis.complexityThreshold !== 'number' || 
        this.config.analysis.complexityThreshold < 1) {
      errors.push('analysis.complexityThreshold deve ser número positivo');
    }
    
    // Validar configuração AI se habilitada
    if (this.config.ai.enabled) {
      if (!this.config.ai.model) {
        errors.push('ai.model é obrigatório quando AI está habilitado');
      }
      
      if (typeof this.config.ai.maxTokens !== 'number' || this.config.ai.maxTokens < 100) {
        errors.push('ai.maxTokens deve ser número >= 100');
      }
      
      if (typeof this.config.ai.temperature !== 'number' || 
          this.config.ai.temperature < 0 || this.config.ai.temperature > 2) {
        errors.push('ai.temperature deve estar entre 0 e 2');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Cria configuração interativa (versão simplificada)
   */
  async createInteractiveConfig() {
    console.log('🔧 Configuração Interativa');
    console.log('='.repeat(40));
    console.log('⚠️ Pressione ENTER para usar valores padrão');
    console.log('');
    
    try {
      // Usar valores padrão para evitar problemas de input no Windows
      console.log('📁 Caminho de saída: ./docs/features (padrão)');
      console.log('📄 Formato: markdown (padrão)');
      console.log('🤖 IA: habilitada (padrão) - Configure OPENAI_API_KEY para usar');
      console.log('🔄 Git: habilitado (padrão)');
      
      // Configurações padrão aplicadas
      this.set('output.path', './docs/features');
      this.set('output.format', 'markdown');
      this.set('ai.enabled', true);  // Habilitar por padrão
      this.set('git.enabled', true);
      
      console.log('\n✅ Configuração padrão aplicada!');
      console.log('💡 Para personalizar, edite o arquivo: feature-docs.config.json');
      
      this.saveToFile();
      
    } catch (error) {
      console.error('❌ Erro na configuração:', error.message);
    }
  }

  /**
   * Alias para createInteractiveConfig para compatibilidade
   */
  async interactiveSetup() {
    return await this.createInteractiveConfig();
  }

  /**
   * Verifica se arquivo de configuração existe
   */
  exists(configPath = this.configPath) {
    return fs.existsSync(configPath);
  }

  /**
   * Obtém templates selecionados para geração
   */
  getSelectedTemplates() {
    // Retorna templates com informações detalhadas
    return [
      { name: 'technical', description: 'Documentação técnica para desenvolvedores' },
      { name: 'design', description: 'Especificações de design e UI' },
      { name: 'business', description: 'Documentação de negócio para PMs' },
      { name: 'overview', description: 'Visão geral da feature' }
    ];
  }

  /**
   * Obtém formatos de saída configurados
   */
  getOutputFormats() {
    const format = this.config.output.format || 'markdown';
    return [
      { 
        name: format, 
        path: this.config.output.path || './docs/features',
        description: `Documentação em formato ${format.toUpperCase()}`
      }
    ];
  }

  /**
   * Mostra configuração atual
   */
  display() {
    console.log('⚙️ Configuração Atual:');
    console.log('='.repeat(40));
    console.log(JSON.stringify(this.config, null, 2));
  }

  /**
   * Reset para configuração padrão
   */
  reset() {
    this.config = { ...this.defaultConfig };
  }

  /**
   * Obtém configuração completa
   */
  getConfig() {
    return { ...this.config };
  }
}

module.exports = ConfigManager;
