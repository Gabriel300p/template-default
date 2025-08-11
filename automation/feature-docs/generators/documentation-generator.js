/**
 * Documentation Generator - Gerador de documentação
 * Sistema completo de geração de documentação para features
 */

const fs = require('fs');
const path = require('path');

class DocumentationGenerator {
  constructor(config = {}) {
    this.config = {
      format: 'markdown',
      template: 'standard',
      audience: 'developer',
      language: 'pt-BR',
      includeIndex: true,
      ...config
    };

    this.templates = this.loadTemplates();
  }

  /**
   * Carrega templates de documentação
   */
  loadTemplates() {
    const templatesPath = path.join(__dirname, '..', 'config', 'templates-config.json');
    
    try {
      if (fs.existsSync(templatesPath)) {
        return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar templates, usando padrão');
    }

    // Template padrão se não conseguir carregar
    return {
      templates: {
        standard: {
          audiences: {
            developer: {
              sections: ['overview', 'components', 'apis', 'examples', 'testing'],
              format: 'technical'
            }
          }
        }
      },
      sections: {
        overview: { title: 'Visão Geral', required: true },
        components: { title: 'Componentes', required: true },
        apis: { title: 'APIs', required: false },
        examples: { title: 'Exemplos', required: false },
        testing: { title: 'Testes', required: false }
      }
    };
  }

  /**
   * Gera documentação completa para uma feature
   */
  async generateFeatureDoc(feature, options = {}) {
    const config = { ...this.config, ...options };
    
    console.log(`📝 Gerando documentação para feature: ${feature.name}`);
    
    try {
      const documentation = {
        metadata: this.generateMetadata(feature),
        content: await this.generateContent(feature, config),
        files: []
      };

      // Gerar arquivo principal
      const mainContent = await this.renderTemplate(documentation, config);
      const fileName = this.getFileName(feature.name, config.format);
      const filePath = path.join(config.outputPath || './docs/features', fileName);

      documentation.files.push({
        path: filePath,
        content: mainContent,
        type: 'main'
      });

      // Gerar arquivos adicionais se necessário
      if (config.generateComponentDocs) {
        const componentDocs = await this.generateComponentDocs(feature.components, config);
        documentation.files.push(...componentDocs);
      }

      return documentation;
      
    } catch (error) {
      console.error(`❌ Erro ao gerar documentação para ${feature.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Alias para compatibilidade com o engine
   */
  async generateForFeature(feature, options = {}) {
    try {
      const documentation = await this.generateFeatureDoc(feature, options);
      
      // Salvar arquivos no sistema
      const outputPath = options.outputPath || './docs/features';
      const featureOutputPath = path.join(outputPath, feature.name);
      
      // Criar diretório da feature
      if (!fs.existsSync(featureOutputPath)) {
        fs.mkdirSync(featureOutputPath, { recursive: true });
      }
      
      const savedFiles = [];
      let documentsGenerated = 0;
      
      // Salvar cada arquivo
      for (const file of documentation.files) {
        const fullPath = path.join(featureOutputPath, path.basename(file.path));
        fs.writeFileSync(fullPath, file.content, 'utf8');
        savedFiles.push(fullPath);
        documentsGenerated++;
        console.log(`✅ Arquivo gerado: ${fullPath}`);
      }
      
      return {
        name: feature.name,
        documentsGenerated,
        savedFiles,
        outputPath: featureOutputPath,
        success: true
      };
      
    } catch (error) {
      console.error(`❌ Erro ao gerar documentação para ${feature.name}:`, error.message);
      return {
        name: feature.name,
        documentsGenerated: 0,
        savedFiles: [],
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera metadados da documentação
   */
  generateMetadata(feature) {
    return {
      name: feature.name,
      title: this.formatTitle(feature.name),
      description: feature.description || `Documentação da feature ${feature.name}`,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      components: feature.components ? feature.components.length : 0,
      pages: feature.pages ? feature.pages.length : 0,
      hooks: feature.hooks ? feature.hooks.length : 0
    };
  }

  /**
   * Gera conteúdo da documentação
   */
  async generateContent(feature, config) {
    // Garantir que templates existem
    if (!this.templates || !this.templates.templates) {
      console.warn('⚠️ Templates não carregados, usando template padrão simples');
      return await this.generateSimpleContent(feature, config);
    }

    const template = this.templates.templates[config.template] || this.templates.templates.standard;
    
    if (!template || !template.audiences) {
      console.warn('⚠️ Template inválido, usando template padrão simples');
      return await this.generateSimpleContent(feature, config);
    }

    const audienceConfig = template.audiences[config.audience] || template.audiences.developer;
    
    const content = {};

    for (const sectionName of audienceConfig.sections) {
      const section = this.templates.sections[sectionName];
      if (section) {
        content[sectionName] = await this.generateSection(sectionName, feature, config);
      }
    }

    return content;
  }

  /**
   * Gera conteúdo simples quando templates não estão disponíveis
   */
  async generateSimpleContent(feature, config) {
    const content = {
      overview: this.generateOverviewSection(feature),
      components: this.generateComponentsSection(feature.components || [])
    };

    // Tentar melhorar com IA se disponível
    if (config.ai && config.ai.enabled) {
      console.log('🤖 Melhorando documentação com IA...');
      try {
        const enhancedContent = await this.enhanceWithAI(content, feature, config);
        return enhancedContent || content;
      } catch (error) {
        console.warn('⚠️ Erro na IA, usando conteúdo padrão:', error.message);
      }
    }

    return content;
  }

  /**
   * Melhora conteúdo usando OpenAI
   */
  async enhanceWithAI(content, feature, config) {
    const openai = await this.getOpenAIClient(config);
    if (!openai) return null;

    const prompt = this.buildPromptForFeature(feature, content);
    
    try {
      const response = await openai.chat.completions.create({
        model: config.ai.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em documentação técnica. Analise a feature e seus componentes para gerar documentação clara e útil em português brasileiro.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.ai.maxTokens || 2000,
        temperature: config.ai.temperature || 0.3
      });

      const aiContent = response.choices[0]?.message?.content;
      if (aiContent) {
        return this.parseAIResponse(aiContent, content);
      }
    } catch (error) {
      console.warn('⚠️ Erro na chamada da OpenAI:', error.message);
    }

    return null;
  }

  /**
   * Obtém cliente OpenAI
   */
  async getOpenAIClient(config) {
    try {
      const { OpenAI } = require('openai');
      const apiKey = config.ai.apiKey || process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ API Key da OpenAI não encontrada');
        return null;
      }

      return new OpenAI({ apiKey });
    } catch (error) {
      console.warn('⚠️ OpenAI não disponível:', error.message);
      return null;
    }
  }

  /**
   * Constrói prompt para a feature
   */
  buildPromptForFeature(feature, content) {
    let prompt = `# Análise da Feature: ${feature.name}\n\n`;
    
    prompt += `## Informações da Feature:\n`;
    prompt += `- Nome: ${feature.name}\n`;
    prompt += `- Componentes: ${feature.components?.length || 0}\n`;
    prompt += `- Localização: ${feature.path}\n\n`;

    if (feature.components && feature.components.length > 0) {
      prompt += `## Componentes Encontrados:\n`;
      feature.components.slice(0, 5).forEach(comp => {
        prompt += `### ${comp.name} (${comp.type})\n`;
        prompt += `- Props: ${comp.props?.length || 0}\n`;
        prompt += `- Hooks: ${comp.hooks?.length || 0}\n`;
        prompt += `- Complexidade: ${comp.complexity || 'baixa'}\n`;
        if (comp.uiElements && comp.uiElements.length > 0) {
          prompt += `- UI Elements: ${comp.uiElements.map(el => el.type).join(', ')}\n`;
        }
        prompt += `\n`;
      });
    }

    prompt += `## Tarefa:\n`;
    prompt += `Gere uma documentação clara e útil para esta feature, incluindo:\n`;
    prompt += `1. Descrição da funcionalidade principal\n`;
    prompt += `2. Como usar os componentes\n`;
    prompt += `3. Exemplos práticos\n`;
    prompt += `4. Dicas de implementação\n\n`;
    prompt += `Responda em formato markdown estruturado em português brasileiro.`;

    return prompt;
  }

  /**
   * Analisa resposta da IA e integra com conteúdo existente
   */
  parseAIResponse(aiResponse, originalContent) {
    try {
      // Por enquanto, vamos usar a resposta da IA para melhorar a descrição
      const enhanced = { ...originalContent };
      
      if (enhanced.overview && enhanced.overview.content) {
        enhanced.overview.content.description = aiResponse.substring(0, 500) + '...';
        enhanced.overview.content.aiGenerated = true;
      }

      return enhanced;
    } catch (error) {
      console.warn('⚠️ Erro ao processar resposta da IA:', error.message);
      return originalContent;
    }
  }

  /**
   * Gera uma seção específica da documentação
   */
  async generateSection(sectionName, feature, config) {
    switch (sectionName) {
      case 'overview':
        return this.generateOverviewSection(feature);
      
      case 'components':
        return this.generateComponentsSection(feature.components || []);
      
      case 'apis':
        return this.generateApiSection(feature.apis || []);
      
      case 'examples':
        return this.generateExamplesSection(feature);
      
      case 'testing':
        return this.generateTestingSection(feature);
      
      default:
        return { title: section.title, content: 'Seção em desenvolvimento' };
    }
  }

  /**
   * Gera seção de visão geral
   */
  generateOverviewSection(feature) {
    return {
      title: 'Visão Geral',
      content: {
        description: feature.description || `A feature ${feature.name} fornece funcionalidades essenciais para o sistema.`,
        purpose: feature.purpose || 'Gerenciar e organizar funcionalidades específicas do sistema.',
        architecture: this.describeArchitecture(feature),
        dependencies: feature.dependencies || [],
        structure: this.describeStructure(feature)
      }
    };
  }

  /**
   * Gera seção de componentes
   */
  generateComponentsSection(components) {
    const componentDocs = components.map(component => ({
      name: component.name,
      type: component.type,
      description: component.description || this.generateComponentDescription(component),
      props: component.props || [],
      hooks: component.hooks || [],
      methods: component.methods || [],
      examples: this.generateComponentExamples(component),
      complexity: component.complexity,
      uiElements: component.uiElements || []
    }));

    return {
      title: 'Componentes',
      content: {
        overview: `Esta feature contém ${components.length} componente(s).`,
        components: componentDocs,
        diagram: this.generateComponentDiagram(components)
      }
    };
  }

  /**
   * Gera seção de APIs
   */
  generateApiSection(apis) {
    return {
      title: 'APIs',
      content: {
        endpoints: apis,
        authentication: 'Token JWT necessário para endpoints protegidos',
        rateLimit: 'Limite de 1000 requisições por hora',
        examples: this.generateApiExamples(apis)
      }
    };
  }

  /**
   * Gera seção de exemplos
   */
  generateExamplesSection(feature) {
    return {
      title: 'Exemplos de Uso',
      content: {
        basic: this.generateBasicExamples(feature),
        advanced: this.generateAdvancedExamples(feature),
        integration: this.generateIntegrationExamples(feature)
      }
    };
  }

  /**
   * Gera seção de testes
   */
  generateTestingSection(feature) {
    return {
      title: 'Testes',
      content: {
        overview: 'Estratégias e exemplos de teste para esta feature',
        unitTests: this.generateUnitTestExamples(feature),
        integrationTests: this.generateIntegrationTestExamples(feature),
        e2eTests: this.generateE2ETestExamples(feature)
      }
    };
  }

  /**
   * Renderiza template final
   */
  async renderTemplate(documentation, config) {
    switch (config.format) {
      case 'markdown':
        return this.renderMarkdown(documentation);
      case 'html':
        return this.renderHtml(documentation);
      case 'json':
        return JSON.stringify(documentation, null, 2);
      default:
        return this.renderMarkdown(documentation);
    }
  }

  /**
   * Renderiza documentação em Markdown
   */
  renderMarkdown(documentation) {
    const { metadata, content } = documentation;
    
    let markdown = `# ${metadata.title}\n\n`;
    markdown += `> ${metadata.description}\n\n`;
    markdown += `**Última atualização:** ${new Date(metadata.lastUpdated).toLocaleDateString('pt-BR')}\n\n`;
    
    if (metadata.components > 0) {
      markdown += `📊 **Estatísticas:**\n`;
      markdown += `- Componentes: ${metadata.components}\n`;
      markdown += `- Páginas: ${metadata.pages}\n`;
      markdown += `- Hooks: ${metadata.hooks}\n\n`;
    }

    markdown += `---\n\n`;

    // Renderizar cada seção
    for (const [sectionName, section] of Object.entries(content)) {
      markdown += this.renderMarkdownSection(sectionName, section);
    }

    return markdown;
  }

  /**
   * Renderiza seção em Markdown
   */
  renderMarkdownSection(sectionName, section) {
    let markdown = `## ${section.title}\n\n`;

    switch (sectionName) {
      case 'overview':
        markdown += `${section.content.description}\n\n`;
        if (section.content.purpose) {
          markdown += `### Objetivo\n${section.content.purpose}\n\n`;
        }
        break;

      case 'components':
        markdown += `${section.content.overview}\n\n`;
        for (const component of section.content.components) {
          markdown += `### ${component.name}\n\n`;
          markdown += `**Tipo:** ${component.type}\n\n`;
          markdown += `${component.description}\n\n`;
          
          if (component.props.length > 0) {
            markdown += `**Props:**\n\n`;
            markdown += `| Nome | Tipo | Obrigatório | Descrição |\n`;
            markdown += `|------|------|-------------|------------|\n`;
            for (const prop of component.props) {
              markdown += `| ${prop.name} | ${prop.type} | ${prop.required ? 'Sim' : 'Não'} | ${prop.description || '-'} |\n`;
            }
            markdown += `\n`;
          }

          if (component.uiElements.length > 0) {
            markdown += `**Elementos UI detectados:**\n`;
            for (const element of component.uiElements) {
              markdown += `- ${element.type}: ${element.confidence}% de confiança\n`;
            }
            markdown += `\n`;
          }
        }
        break;

      default:
        if (typeof section.content === 'string') {
          markdown += `${section.content}\n\n`;
        } else {
          markdown += `_Seção em desenvolvimento_\n\n`;
        }
    }

    return markdown;
  }

  /**
   * Utilitários
   */
  formatTitle(name) {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getFileName(featureName, format) {
    const extension = format === 'markdown' ? 'md' : format;
    return `${featureName}.${extension}`;
  }

  describeArchitecture(feature) {
    if (feature.components && feature.components.length > 0) {
      const types = [...new Set(feature.components.map(c => c.type))];
      return `Arquitetura baseada em componentes ${types.join(', ')}`;
    }
    return 'Arquitetura modular';
  }

  describeStructure(feature) {
    const structure = [];
    if (feature.components) structure.push(`${feature.components.length} componentes`);
    if (feature.pages) structure.push(`${feature.pages.length} páginas`);
    if (feature.hooks) structure.push(`${feature.hooks.length} hooks`);
    return structure.join(', ');
  }

  generateComponentDescription(component) {
    let desc = `Componente ${component.type}`;
    if (component.props && component.props.length > 0) {
      desc += ` com ${component.props.length} propriedade(s)`;
    }
    if (component.hooks && component.hooks.length > 0) {
      desc += ` e ${component.hooks.length} hook(s)`;
    }
    return desc + '.';
  }

  generateComponentExamples(component) {
    // Gera exemplos básicos baseados nas props
    return [`// Exemplo de uso do ${component.name}`, `<${component.name} />`];
  }

  generateComponentDiagram(components) {
    // Gera diagrama simples de componentes
    return components.map(c => `[${c.name}]`).join(' -> ');
  }

  generateApiExamples(apis) {
    return apis.map(api => ({
      endpoint: api.endpoint,
      method: api.method,
      example: `curl -X ${api.method} ${api.endpoint}`
    }));
  }

  generateBasicExamples(feature) {
    return `Exemplo básico de uso da feature ${feature.name}`;
  }

  generateAdvancedExamples(feature) {
    return `Exemplos avançados para casos complexos`;
  }

  generateIntegrationExamples(feature) {
    return `Como integrar ${feature.name} com outras features`;
  }

  generateUnitTestExamples(feature) {
    return `Exemplos de testes unitários para ${feature.name}`;
  }

  generateIntegrationTestExamples(feature) {
    return `Testes de integração recomendados`;
  }

  generateE2ETestExamples(feature) {
    return `Cenários end-to-end para validação`;
  }

  /**
   * Salva documentação no sistema de arquivos
   */
  async saveDocumentation(documentation, outputPath) {
    const results = {
      generatedFiles: [],
      errors: []
    };

    // Criar diretório se não existir
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      for (const file of documentation.files) {
        const filePath = file.path;
        const fileDir = path.dirname(filePath);
        
        // Criar diretório do arquivo
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }

        // Salvar arquivo
        fs.writeFileSync(filePath, file.content);
        results.generatedFiles.push(filePath);
        
        console.log(`✅ Arquivo gerado: ${filePath}`);
      }
    } catch (error) {
      results.errors.push(`Erro ao salvar arquivo: ${error.message}`);
    }

    return results;
  }
}

module.exports = DocumentationGenerator;
