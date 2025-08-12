/**
 * Documentation Generator - Gerador de documentação refatorado
 * Baseado no sistema existente, adaptado para uso universal
 */

const fs = require('fs-extra');
const path = require('path');

class DocumentationGenerator {
  constructor() {
    this.templates = this.getDefaultTemplates();
  }

  /**
   * Gera documentação completa
   */
  async generate(options) {
    const {
      analysis,
      config,
      template = 'standard',
      useAI = false,
      aiConfig = {}
    } = options;

    const startTime = Date.now();

    try {
      // Selecionar template
      const selectedTemplate = this.templates[template] || this.templates.standard;

      // Preparar dados para o template
      const templateData = this.prepareTemplateData(analysis, config);

      // Gerar conteúdo
      let content;
      if (useAI && aiConfig.enabled) {
        content = await this.generateWithAI(templateData, selectedTemplate, aiConfig);
      } else {
        content = this.generateStandard(templateData, selectedTemplate);
      }

      const endTime = Date.now();

      return {
        files: content,
        generationTime: endTime - startTime,
        template: template,
        aiStats: useAI ? this.getAIStats() : null
      };

    } catch (error) {
      throw new Error(`Erro na geração da documentação: ${error.message}`);
    }
  }

  /**
   * Prepara dados para o template
   */
  prepareTemplateData(analysis, config) {
    return {
      project: {
        name: config.project?.name || 'Projeto',
        language: config.project?.language || 'javascript',
        description: this.generateProjectDescription(analysis)
      },
      
      overview: {
        totalFiles: analysis.totalFiles || 0,
        totalComponents: analysis.components?.length || 0,
        totalFunctions: analysis.functions?.length || 0,
        totalClasses: analysis.classes?.length || 0
      },

      components: this.processComponents(analysis.components || []),
      functions: this.processFunctions(analysis.functions || []),
      classes: this.processClasses(analysis.classes || []),
      
      architecture: this.analyzeArchitecture(analysis),
      dependencies: this.analyzeDependencies(analysis),
      
      timestamp: new Date().toISOString(),
      generator: 'AutoDoc CLI v1.0.0'
    };
  }

  /**
   * Geração padrão (sem IA)
   */
  generateStandard(data, template) {
    const files = {};

    // README principal
    files['README.md'] = this.generateReadme(data, template);

    // Documentação de componentes (se houver)
    if (data.components.length > 0) {
      files['COMPONENTS.md'] = this.generateComponentsDoc(data.components);
    }

    // Documentação de APIs (se houver)
    if (data.functions.length > 0) {
      files['API.md'] = this.generateApiDoc(data.functions);
    }

    // Documentação de arquitetura
    files['ARCHITECTURE.md'] = this.generateArchitectureDoc(data.architecture);

    return files;
  }

  /**
   * Geração com IA
   */
  async generateWithAI(data, template, aiConfig) {
    try {
      const openai = await this.getOpenAIClient(aiConfig);
      if (!openai) {
        console.warn('⚠️ IA não disponível, usando geração padrão');
        return this.generateStandard(data, template);
      }

      // Gerar conteúdo melhorado com IA
      const files = {};

      // README com IA
      const readmePrompt = this.buildReadmePrompt(data);
      files['README.md'] = await this.generateWithAIPrompt(openai, readmePrompt, aiConfig);

      // Outros arquivos...
      if (data.components.length > 0) {
        const componentsPrompt = this.buildComponentsPrompt(data.components);
        files['COMPONENTS.md'] = await this.generateWithAIPrompt(openai, componentsPrompt, aiConfig);
      }

      return files;

    } catch (error) {
      console.warn('⚠️ Erro na geração com IA, usando método padrão:', error.message);
      return this.generateStandard(data, template);
    }
  }

  /**
   * Gera README principal
   */
  generateReadme(data, template) {
    return `# ${data.project.name}

${data.project.description}

## 📋 Visão Geral

Este projeto contém:
- **${data.overview.totalFiles}** arquivos de código
- **${data.overview.totalComponents}** componentes
- **${data.overview.totalFunctions}** funções
- **${data.overview.totalClasses}** classes

## 🏗️ Arquitetura

${this.generateArchitectureSection(data.architecture)}

## 📦 Dependências

${this.generateDependenciesSection(data.dependencies)}

## 🚀 Como usar

\`\`\`bash
# Instalar dependências
npm install

# Executar projeto
npm start
\`\`\`

---

*Documentação gerada automaticamente por ${data.generator} em ${new Date(data.timestamp).toLocaleString('pt-BR')}*
`;
  }

  /**
   * Gera documentação de componentes
   */
  generateComponentsDoc(components) {
    let content = `# 📋 Componentes

## Visão Geral

Este documento lista todos os ${components.length} componentes encontrados no projeto.

`;

    components.forEach(component => {
      content += `## ${component.name}

**Arquivo:** \`${component.filePath}\`
**Tipo:** ${component.type}

### Props
${this.formatProps(component.props)}

### Hooks Utilizados
${this.formatHooks(component.hooks)}

### Métodos
${this.formatMethods(component.methods)}

---

`;
    });

    return content;
  }

  /**
   * Gera documentação de API
   */
  generateApiDoc(functions) {
    let content = `# 🔧 API Reference

## Funções (${functions.length})

`;

    functions.forEach(func => {
      content += `### ${func.name}

**Tipo:** ${func.type}
**Async:** ${func.async ? 'Sim' : 'Não'}

\`\`\`javascript
${func.signature || func.name}
\`\`\`

---

`;
    });

    return content;
  }

  /**
   * Gera documentação de arquitetura
   */
  generateArchitectureDoc(architecture) {
    return `# 🏗️ Arquitetura

## Estrutura do Projeto

${this.generateDirectoryTree(architecture)}

## Padrões Identificados

${this.generatePatterns(architecture)}

## Fluxo de Dados

${this.generateDataFlow(architecture)}
`;
  }

  // Métodos auxiliares

  generateProjectDescription(analysis) {
    const language = analysis.language || 'JavaScript';
    const componentCount = analysis.components?.length || 0;
    
    if (componentCount > 0) {
      return `Projeto ${language} com ${componentCount} componentes e arquitetura modular.`;
    }
    
    return `Projeto ${language} com estrutura organizada e código bem documentado.`;
  }

  processComponents(components) {
    return components.map(comp => ({
      name: comp.name || 'Componente',
      filePath: comp.filePath || '',
      type: comp.type || 'react',
      props: comp.props || [],
      hooks: comp.hooks || [],
      methods: comp.methods || [],
      complexity: comp.complexity || 'low'
    }));
  }

  processFunctions(functions) {
    return functions.map(func => ({
      name: func.name || 'function',
      type: func.type || 'function',
      async: func.async || false,
      signature: func.signature || func.name
    }));
  }

  processClasses(classes) {
    return classes.map(cls => ({
      name: cls.name || 'Class',
      methods: cls.methods || [],
      properties: cls.properties || []
    }));
  }

  analyzeArchitecture(analysis) {
    return {
      hasComponents: (analysis.components?.length || 0) > 0,
      hasFunctions: (analysis.functions?.length || 0) > 0,
      hasClasses: (analysis.classes?.length || 0) > 0,
      patterns: this.detectPatterns(analysis)
    };
  }

  analyzeDependencies(analysis) {
    const allImports = analysis.imports || [];
    const external = [];
    const internal = [];

    allImports.forEach(imp => {
      if (imp.isNodeModule) {
        external.push(imp.source);
      } else {
        internal.push(imp.source);
      }
    });

    return {
      external: [...new Set(external)],
      internal: [...new Set(internal)]
    };
  }

  detectPatterns(analysis) {
    const patterns = [];

    if (analysis.components?.some(c => c.hooks?.length > 0)) {
      patterns.push('React Hooks');
    }

    if (analysis.functions?.some(f => f.async)) {
      patterns.push('Async/Await');
    }

    return patterns;
  }

  formatProps(props) {
    if (!props || props.length === 0) return 'Nenhuma prop definida.';
    
    return props.map(prop => 
      `- **${prop.name}** (${prop.type}): ${prop.description || 'Sem descrição'}`
    ).join('\n');
  }

  formatHooks(hooks) {
    if (!hooks || hooks.length === 0) return 'Nenhum hook utilizado.';
    
    return hooks.map(hook => `- \`${hook.name || hook}\``).join('\n');
  }

  formatMethods(methods) {
    if (!methods || methods.length === 0) return 'Nenhum método definido.';
    
    return methods.map(method => 
      `- **${method.name}** (${method.type})`
    ).join('\n');
  }

  generateArchitectureSection(architecture) {
    const sections = [];

    if (architecture.hasComponents) {
      sections.push('- 🧩 **Componentes**: Arquitetura baseada em componentes');
    }

    if (architecture.hasFunctions) {
      sections.push('- ⚡ **Funções**: Programação funcional');
    }

    if (architecture.hasClasses) {
      sections.push('- 🏛️ **Classes**: Programação orientada a objetos');
    }

    return sections.join('\n') || 'Arquitetura simples';
  }

  generateDependenciesSection(dependencies) {
    let content = '';

    if (dependencies.external.length > 0) {
      content += `### Dependências Externas\n${dependencies.external.map(dep => `- ${dep}`).join('\n')}\n\n`;
    }

    if (dependencies.internal.length > 0) {
      content += `### Dependências Internas\n${dependencies.internal.slice(0, 10).map(dep => `- ${dep}`).join('\n')}`;
    }

    return content || 'Nenhuma dependência identificada.';
  }

  generateDirectoryTree(architecture) {
    return `\`\`\`
src/
├── components/
├── hooks/
├── services/
└── utils/
\`\`\``;
  }

  generatePatterns(architecture) {
    return architecture.patterns?.join('\n- ') || 'Nenhum padrão específico identificado.';
  }

  generateDataFlow(architecture) {
    return 'Fluxo de dados será analisado em versões futuras.';
  }

  // IA Methods (placeholder)

  async getOpenAIClient(aiConfig) {
    try {
      const OpenAI = require('openai').default || require('openai');
      const apiKey = aiConfig.apiKey || process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return null;
      }

      return new OpenAI({ apiKey });
    } catch (error) {
      return null;
    }
  }

  buildReadmePrompt(data) {
    return `Crie um README.md profissional para um projeto ${data.project.language} com ${data.overview.totalFiles} arquivos, ${data.overview.totalComponents} componentes. Inclua descrição, instalação, uso e estrutura.`;
  }

  buildComponentsPrompt(components) {
    return `Documente ${components.length} componentes React/Vue de forma clara e profissional. Inclua props, hooks e exemplos de uso.`;
  }

  async generateWithAIPrompt(openai, prompt, aiConfig) {
    try {
      const response = await openai.chat.completions.create({
        model: aiConfig.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em documentação técnica. Gere documentação clara, profissional e útil em português brasileiro.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.maxTokens || 2000,
        temperature: aiConfig.temperature || 0.3
      });

      return response.choices[0]?.message?.content || 'Erro na geração';
    } catch (error) {
      throw error;
    }
  }

  getAIStats() {
    return {
      tokensUsed: 0,
      estimatedCost: 0,
      model: 'gpt-4o-mini'
    };
  }

  getDefaultTemplates() {
    return {
      standard: {
        name: 'Padrão',
        description: 'Documentação completa',
        sections: ['overview', 'architecture', 'components', 'api']
      },
      simple: {
        name: 'Simples',
        description: 'README básico',
        sections: ['overview']
      },
      api: {
        name: 'API',
        description: 'Focado em APIs',
        sections: ['overview', 'api', 'examples']
      },
      components: {
        name: 'Componentes',
        description: 'Focado em componentes UI',
        sections: ['overview', 'components', 'examples']
      }
    };
  }
}

module.exports = { DocumentationGenerator };
