const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

class OpenAIClient {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.config = {
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,  // Reduzido para economizar
      temperature: 0.1,   // Mais determinístico e focado
    };
  }

  /**
   * Carrega prompts de configuração
   */
  async loadPrompts() {
    try {
      const promptsPath = path.join(__dirname, '../../config/prompts.json');
      const promptsContent = await fs.readFile(promptsPath, 'utf8');
      return JSON.parse(promptsContent);
    } catch (error) {
      console.error('Erro ao carregar prompts:', error);
      throw error;
    }
  }

  /**
   * Substitui variáveis no template do prompt
   */
  replacePromptVariables(template, variables) {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    
    return result;
  }

  /**
   * Gera documentação usando OpenAI
   */
  async generateDocumentation(type, promptType, variables) {
    try {
      const prompts = await this.loadPrompts();
      
      if (!prompts[type] || !prompts[type].prompts[promptType]) {
        throw new Error(`Prompt não encontrado: ${type}.${promptType}`);
      }

      const systemPrompt = prompts[type].system_prompt;
      const userPrompt = this.replacePromptVariables(
        prompts[type].prompts[promptType],
        variables
      );

      console.log(`🤖 Gerando documentação ${type}/${promptType}...`);

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.config.max_tokens,
        temperature: this.config.temperature,
      });

      const content = response.choices[0].message.content;
      
      // Log para monitoramento de custos
      console.log(`📊 Tokens utilizados: ${response.usage.total_tokens}`);
      
      return {
        content,
        usage: response.usage,
        type,
        promptType
      };

    } catch (error) {
      console.error('Erro ao gerar documentação:', error);
      throw error;
    }
  }

  /**
   * Analisa arquivo e determina o tipo de análise necessária
   */
  /**
   * Determina o tipo de análise baseado no arquivo e contexto
   */
  determineAnalysisType(filePath, content, context = 'technical') {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();
    
    // Para documentação de usuário, usar tipos específicos
    if (context === 'user') {
      // Se é um processo/workflow
      if (fileName.includes('workflow') || fileName.includes('process') || 
          content.includes('useState') || content.includes('useEffect')) {
        return 'workflow_guide';
      }
      // Padrão para usuário: guia de funcionalidade
      return 'feature_guide';
    }
    
    // Para documentação técnica
    if (context === 'technical') {
      // Análise baseada no nome do arquivo
      if (fileName.includes('api') || fileName.includes('endpoint') || fileName.includes('route')) {
        return 'api_analysis';
      }
      
      if (fileName.includes('schema') || fileName.includes('model') || ext === '.prisma' || ext === '.sql') {
        return 'database_analysis';
      }
      
      // Análise baseada no conteúdo
      if (content.includes('express') || content.includes('router') || content.includes('app.')) {
        return 'api_analysis';
      }
      
      if (content.includes('CREATE TABLE') || content.includes('model ') || content.includes('schema')) {
        return 'database_analysis';
      }
    }
    
    // Para executivo
    if (context === 'executive') {
      return 'impact_analysis';
    }
    
    // Padrão: análise de componente
    return 'component_analysis';
  }

  /**
   * Processa múltiplos arquivos em lote
   */
  async processBatch(files, type = 'technical') {
    const results = [];
    
    for (const file of files) {
      try {
        const analysisType = this.determineAnalysisType(file.path, file.content, type);
        
        const variables = {
          file_path: file.path,
          file_name: path.basename(file.path),
          file_type: path.extname(file.path),
          language: this.detectLanguage(file.path),
          file_content: file.content,
          feature_name: this.extractFeatureName(file.path),
          workflow_name: this.extractWorkflowName(file.path)
        };

        const result = await this.generateDocumentation(type, analysisType, variables);
        
        results.push({
          filePath: file.path,
          documentation: result.content,
          usage: result.usage,
          type: result.type,
          analysisType: result.promptType
        });
        
        // Delay entre requisições para evitar rate limiting
        await this.delay(1000);
        
      } catch (error) {
        console.error(`Erro ao processar ${file.path}:`, error);
        results.push({
          filePath: file.path,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Detecta linguagem do arquivo
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const langMap = {
      '.js': 'javascript',
      '.jsx': 'jsx',
      '.ts': 'typescript',
      '.tsx': 'tsx',
      '.py': 'python',
      '.go': 'go',
      '.java': 'java',
      '.cs': 'csharp',
      '.sql': 'sql',
      '.prisma': 'prisma',
      '.md': 'markdown',
      '.json': 'json'
    };
    
    return langMap[ext] || 'text';
  }

  /**
   * Extrai nome da feature baseado no caminho
   */
  extractFeatureName(filePath) {
    const parts = filePath.split('/');
    const featuresIndex = parts.findIndex(part => part === 'features');
    
    if (featuresIndex !== -1 && parts[featuresIndex + 1]) {
      return parts[featuresIndex + 1];
    }
    
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * Extrai nome do workflow baseado no caminho
   */
  extractWorkflowName(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    return fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calcula custo estimado baseado no uso
   */
  calculateCost(usage) {
    // Preços OpenAI (aproximados em USD)
    const inputCostPer1K = 0.0015; // GPT-3.5-turbo input
    const outputCostPer1K = 0.002; // GPT-3.5-turbo output
    
    const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1K;
    const outputCost = (usage.completion_tokens / 1000) * outputCostPer1K;
    
    return {
      inputCost: inputCost.toFixed(4),
      outputCost: outputCost.toFixed(4),
      totalCost: (inputCost + outputCost).toFixed(4),
      totalTokens: usage.total_tokens
    };
  }
}

module.exports = OpenAIClient;
