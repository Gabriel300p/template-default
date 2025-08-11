#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const OpenAIClient = require('./utils/openai-client');
const GitHubClient = require('./utils/github-client');
const DocumentationTemplates = require('./utils/templates');

class CodeAnalyzer {
  constructor() {
    this.openai = new OpenAIClient();
    this.github = new GitHubClient();
    this.templates = new DocumentationTemplates();
    
    this.stats = {
      totalFiles: 0,
      processedFiles: 0,
      totalTokens: 0,
      totalCost: 0,
      errors: []
    };
  }

  /**
   * Método principal que orquestra todo o processo
   */
  async analyze(options = {}) {
    try {
      console.log('🚀 Iniciando análise de código...');
      
      // 1. Obter informações do contexto
      const context = await this.getAnalysisContext(options);
      console.log(`📊 Contexto: ${context.type} | Arquivos: ${context.files.length}`);
      
      // 2. Filtrar arquivos relevantes
      const relevantFiles = await this.github.filterRelevantFiles(context.files);
      console.log(`✅ Arquivos relevantes: ${relevantFiles.length}`);
      
      if (relevantFiles.length === 0) {
        console.log('⚠️ Nenhum arquivo relevante encontrado para análise');
        return { success: false, reason: 'no_relevant_files' };
      }
      
      // 3. Obter conteúdo dos arquivos
      const filesWithContent = await this.getFilesContent(relevantFiles);
      console.log(`📄 Conteúdo obtido: ${filesWithContent.length} arquivos`);
      
      // 4. Gerar documentação com IA
      if (process.argv.includes('--test')) {
        console.log('🧪 Modo teste ativado - Gerando documentação mock...');
        const documentation = await this.generateMockDocumentation(filesWithContent, context);
        console.log('📝 Documentação mock gerada com sucesso!');
        return {
          success: true,
          stats: this.stats,
          documentation,
          mode: 'test'
        };
      }
      
      const documentation = await this.generateDocumentation(filesWithContent, context);
      
      // 5. Atualizar Wiki (apenas se habilitada)
      let wikiUpdates = null;
      if (this.github.config.documentation?.wiki_enabled && !process.argv.includes('--no-wiki')) {
        wikiUpdates = await this.updateWiki(documentation, context);
      } else {
        console.log('ℹ️  Wiki desabilitada - pulando atualização');
      }
      
      // 6. Criar notificação
      if (options.createNotification !== false) {
        await this.createNotificationIssue(context, documentation, wikiUpdates);
      }
      
      // 7. Log final
      await this.logResults();
      
      console.log('✅ Análise concluída com sucesso!');
      
      return {
        success: true,
        stats: this.stats,
        documentation,
        wikiUpdates
      };
      
    } catch (error) {
      console.error('❌ Erro na análise:', error);
      this.stats.errors.push(error.message);
      
      return {
        success: false,
        error: error.message,
        stats: this.stats
      };
    }
  }

  /**
   * Obtém contexto da análise (PR, commit, ou manual)
   */
  async getAnalysisContext(options) {
    const context = {
      type: 'manual',
      files: [],
      metadata: {}
    };

    // Análise de Pull Request
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' && process.env.GITHUB_PR_NUMBER) {
      const prNumber = parseInt(process.env.GITHUB_PR_NUMBER);
      
      context.type = 'pull_request';
      context.metadata = await this.github.getPullRequestInfo(prNumber);
      context.files = await this.github.getModifiedFiles(prNumber);
      
      console.log(`🔄 Analisando PR #${prNumber}: ${context.metadata.title}`);
    }
    
    // Análise de Push/Commit
    else if (process.env.GITHUB_SHA && process.env.GITHUB_EVENT_NAME === 'push') {
      const sha = process.env.GITHUB_SHA;
      
      context.type = 'push';
      context.metadata.sha = sha;
      context.files = await this.github.getModifiedFiles(null, sha);
      
      console.log(`📝 Analisando commit: ${sha.substring(0, 7)}`);
    }
    
    // Análise manual (para testes)
    else if (options.manual) {
      context.type = 'manual';
      context.files = options.files || [];
      
      console.log('🧪 Análise manual iniciada');
    }
    
    // Análise completa do repositório
    else {
      context.type = 'full_analysis';
      context.files = await this.getAllRelevantFiles();
      
      console.log('📚 Análise completa do repositório');
    }

    this.stats.totalFiles = context.files.length;
    
    return context;
  }

  /**
   * Obtém conteúdo dos arquivos
   */
  async getFilesContent(files) {
    const filesWithContent = [];
    
    for (const file of files) {
      try {
        // Compatibilidade: string direta ou objeto com filename/path
        const filePath = typeof file === 'string' ? file : (file.filename || file.path);
        
        if (!filePath) {
          console.log('⚠️ Arquivo sem path válido:', file);
          continue;
        }
        
        const content = await this.github.getFileContent(filePath);
        
        if (content && content.content.trim().length > 0) {
          filesWithContent.push({
            path: filePath,
            content: content.content,
            status: typeof file === 'object' ? (file.status || 'unknown') : 'manual',
            changes: typeof file === 'object' ? (file.changes || 0) : 0
          });
        }
        
      } catch (error) {
        console.warn(`⚠️ Erro ao obter conteúdo de ${file.filename || file.path}:`, error.message);
        this.stats.errors.push(`Arquivo ${file.filename || file.path}: ${error.message}`);
      }
    }
    
    return filesWithContent;
  }

  /**
   * Gera documentação usando IA para diferentes tipos
   */
  async generateDocumentation(files, context) {
    const documentation = {
      technical: [],
      user: [],
      technical: [],
      user: [],
      executive: []
    };

    // Documentação Técnica (padrão)
    console.log('🤖 Gerando documentação técnica...');
    const technicalDocs = await this.openai.processBatch(files, 'technical');
    documentation.technical = technicalDocs;
    
    this.updateStats(technicalDocs);

    // Documentação de Usuário (se houver mudanças de UI)
    const hasUIChanges = files.some(f => 
      f.path.includes('components') || 
      f.path.includes('pages') || 
      f.path.includes('.tsx') ||
      f.path.includes('routes')
    );
    
    if (hasUIChanges && process.env.GENERATE_USER === 'true') {
      console.log('👥 Gerando documentação de usuário...');
      const userDocs = await this.openai.processBatch(files, 'user');
      documentation.user = userDocs;
      
      this.updateStats(userDocs);
    }

    // Documentação Executiva (se for PR importante ou análise completa)
    if (context.type === 'full_analysis' || 
        (context.type === 'pull_request' && files.length > 3)) {
      
      console.log('📈 Gerando relatório executivo...');
      const executiveDocs = await this.generateExecutiveReport(files, context);
      documentation.executive = [executiveDocs];
    }

    this.stats.processedFiles = files.length;
    
    return documentation;
  }

  /**
   * Gera documentação mock para testes
   */
  async generateMockDocumentation(files, context) {
    console.log('🧪 Gerando documentação mock (sem chamadas para APIs externas)...');
    
    const documentation = {
      technical: [],
      user: [],
      executive: []
    };

    // Gerar documentação técnica mock
    console.log('🔧 Gerando documentação técnica mock...');
    for (const file of files) {
      const mockDoc = {
        type: 'technical',
        file: file.path,
        content: this.generateMockTechnicalDoc(file),
        title: `📄 ${path.basename(file.path)}`,
        timestamp: new Date().toISOString()
      };
      
      documentation.technical.push(mockDoc);
      console.log(`   ✅ Mock técnico gerado para: ${file.path}`);
    }

    // Gerar documentação de usuário mock (se aplicável)
    const hasUIChanges = files.some(f => 
      f.path.includes('components') || 
      f.path.includes('pages') || 
      f.path.includes('.tsx') ||
      f.path.includes('routes')
    );
    
    if (hasUIChanges) {
      console.log('👥 Gerando documentação de usuário mock...');
      const mockUserDoc = {
        type: 'user',
        content: this.generateMockUserDoc(files),
        title: '👤 Guia do Usuário',
        timestamp: new Date().toISOString()
      };
      
      documentation.user.push(mockUserDoc);
    }

    // Gerar relatório executivo mock (se aplicável)
    if (context.type === 'full_analysis' || files.length > 3) {
      console.log('📈 Gerando relatório executivo mock...');
      const mockExecutiveDoc = {
        type: 'executive',
        content: this.generateMockExecutiveDoc(files, context),
        title: '📊 Relatório Executivo',
        timestamp: new Date().toISOString()
      };
      
      documentation.executive.push(mockExecutiveDoc);
    }

    // Simular estatísticas
    this.stats.processedFiles = files.length;
    this.stats.totalTokens = files.length * 150; // Mock token count
    this.stats.estimatedCost = (this.stats.totalTokens / 1000) * 0.002; // Mock cost
    
    console.log('✅ Documentação mock completa gerada!');
    
    return documentation;
  }

  /**
   * Gera documento técnico mock
   */
  generateMockTechnicalDoc(file) {
    const fileName = path.basename(file.path);
    const fileExtension = path.extname(file.path);
    
    return `# 📄 ${fileName}

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

## 📋 Visão Geral
Este é um documento técnico mock para o arquivo \`${file.path}\`.

**Tipo:** ${this.getFileType(fileExtension)}
**Linguagem:** ${this.getLanguageFromExtension(fileExtension)}
**Tamanho:** ${file.content ? file.content.length : 0} caracteres

## 🔧 Funcionalidades Detectadas
${this.detectFunctionalities(file.content || '')}

## 📦 Dependências
${this.detectDependencies(file.content || '')}

## 🚀 Como Usar
Documentação de uso seria gerada aqui baseada na análise do código.

## 📝 Observações
- Este é um documento gerado automaticamente em modo teste
- Para análise completa, execute sem a flag --test
- A análise real incluiria insights detalhados da IA

---
*Documentação gerada automaticamente pelo sistema de análise*`;
  }

  /**
   * Gera documento de usuário mock
   */
  generateMockUserDoc(files) {
    return `# 👤 Guia do Usuário - Mock

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

## 🎯 Funcionalidades Analisadas
${files.map(f => `- ${path.basename(f.path)}`).join('\n')}

## 📋 Resumo das Mudanças
Este guia mock documenta as mudanças detectadas nos ${files.length} arquivos analisados.

## ✅ Como Usar
1. Acesse a aplicação
2. Navegue até a funcionalidade modificada
3. Teste as novas funcionalidades

## 📝 Notas
- Esta é uma documentação mock gerada para teste
- A versão completa incluiria screenshots e exemplos detalhados

---
*Guia gerado automaticamente*`;
  }

  /**
   * Gera relatório executivo mock
   */
  generateMockExecutiveDoc(files, context) {
    return `# 📊 Relatório Executivo - Mock

**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Contexto:** ${context.type}
**Arquivos Analisados:** ${files.length}

## 📋 Resumo das Mudanças
Foram analisados ${files.length} arquivos do projeto ${this.github.config.name}.

## 💼 Impacto no Negócio
- **Arquivos Técnicos:** ${files.filter(f => f.path.includes('.ts') || f.path.includes('.js')).length}
- **Componentes UI:** ${files.filter(f => f.path.includes('component')).length}
- **Rotas/Páginas:** ${files.filter(f => f.path.includes('routes') || f.path.includes('pages')).length}

## 📈 Métricas Estimadas
- **Complexidade:** Média
- **Impacto:** ${files.length > 5 ? 'Alto' : 'Moderado'}
- **Risco:** Baixo (análise mock)

## 💰 Valor Entregue
Implementação de melhorias no sistema com foco em:
- Manutenibilidade do código
- Experiência do usuário
- Qualidade técnica

## 🎯 Próximos Passos
1. Revisar documentação técnica
2. Testar funcionalidades
3. Implementar feedback dos usuários

---
*Relatório gerado automaticamente em modo teste*`;
  }

  /**
   * Detecta funcionalidades no código (análise básica)
   */
  detectFunctionalities(content) {
    if (!content) return '- Funcionalidades não detectadas (conteúdo não disponível)';
    
    const functions = content.match(/function\s+\w+|const\s+\w+\s*=|export\s+(function|const)/g) || [];
    const components = content.match(/const\s+\w+\s*[:=].*=>\s*{|function\s+\w+\s*\(/g) || [];
    const hooks = content.match(/use[A-Z]\w+/g) || [];
    
    const features = [];
    if (functions.length > 0) features.push(`- ${functions.length} funções detectadas`);
    if (components.length > 0) features.push(`- ${components.length} componentes detectados`);
    if (hooks.length > 0) features.push(`- ${hooks.length} hooks React detectados`);
    
    return features.length > 0 ? features.join('\n') : '- Análise de funcionalidades indisponível';
  }

  /**
   * Detecta dependências (análise básica)
   */
  detectDependencies(content) {
    if (!content) return '- Dependências não detectadas';
    
    const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
    const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    
    const deps = [...new Set([...imports, ...requires])].slice(0, 10);
    
    return deps.length > 0 ? 
      deps.map(dep => `- ${dep}`).join('\n') : 
      '- Nenhuma dependência externa detectada';
  }

  /**
   * Determina tipo do arquivo
   */
  getFileType(extension) {
    const types = {
      '.tsx': 'Componente React TypeScript',
      '.ts': 'TypeScript',
      '.jsx': 'Componente React JavaScript', 
      '.js': 'JavaScript',
      '.json': 'Configuração JSON',
      '.md': 'Documentação Markdown'
    };
    
    return types[extension] || 'Arquivo de código';
  }

  /**
   * Determina linguagem do arquivo
   */
  getLanguageFromExtension(extension) {
    const languages = {
      '.tsx': 'typescript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.js': 'javascript',
      '.json': 'json',
      '.md': 'markdown'
    };
    
    return languages[extension] || 'text';
  }

  /**
   * Gera relatório executivo
   */
  async generateExecutiveReport(files, context) {
    const variables = {
      file_list: files.map(f => `- ${f.path} (${f.status || 'modified'})`).join('\n'),
      changes_summary: this.generateChangesSummary(files),
      date: new Date().toLocaleDateString('pt-BR'),
      project_name: this.github.config.name,
      file_count: files.length,
      code_metrics: this.generateCodeMetrics(files)
    };

    const result = await this.openai.generateDocumentation(
      'executive', 
      'impact_analysis', 
      variables
    );

    this.updateStats([result]);
    
    return {
      type: 'executive',
      title: `Relatório Executivo - ${variables.date}`,
      content: result.content,
      usage: result.usage
    };
  }

  /**
   * Atualiza páginas do Wiki
   */
  async updateWiki(documentation, context) {
    const wikiUpdates = [];
    
    try {
      // Atualizar documentação técnica
      if (documentation.technical.length > 0) {
        const technicalContent = this.formatTechnicalDocumentation(documentation.technical);
        const technicalUpdate = await this.github.updateWikiPage(
          this.github.config.output.wiki.structure.technical,
          technicalContent,
          `📚 Atualização técnica - ${new Date().toLocaleDateString('pt-BR')}`
        );
        wikiUpdates.push({ type: 'technical', ...technicalUpdate });
      }

      // Atualizar guia do usuário
      if (documentation.user.length > 0) {
        const userContent = this.formatUserDocumentation(documentation.user);
        const userUpdate = await this.github.updateWikiPage(
          this.github.config.output.wiki.structure.user,
          userContent,
          `👥 Atualização do guia do usuário - ${new Date().toLocaleDateString('pt-BR')}`
        );
        wikiUpdates.push({ type: 'user', ...userUpdate });
      }

      // Atualizar resumo executivo
      if (documentation.executive.length > 0) {
        const executiveContent = this.formatExecutiveDocumentation(documentation.executive);
        const executiveUpdate = await this.github.updateWikiPage(
          this.github.config.output.wiki.structure.executive,
          executiveContent,
          `📈 Relatório executivo - ${new Date().toLocaleDateString('pt-BR')}`
        );
        wikiUpdates.push({ type: 'executive', ...executiveUpdate });
      }

      // Atualizar página inicial do Wiki
      const repoInfo = await this.github.getRepositoryInfo();
      const homeContent = this.templates.generateWikiHomePage(repoInfo, this.stats);
      const homeUpdate = await this.github.updateWikiPage(
        'Home',
        homeContent,
        `🏠 Atualização da página inicial - ${new Date().toLocaleDateString('pt-BR')}`
      );
      wikiUpdates.push({ type: 'home', ...homeUpdate });

    } catch (error) {
      console.error('❌ Erro ao atualizar Wiki:', error);
      this.stats.errors.push(`Wiki update: ${error.message}`);
    }
    
    return wikiUpdates;
  }

  /**
   * Cria issue de notificação
   */
  async createNotificationIssue(context, documentation, wikiUpdates) {
    try {
      const changes = {
        files: context.files,
        stats: this.calculateChangeStats(context.files)
      };

      const docsForIssue = wikiUpdates ? wikiUpdates.map(update => ({
        type: update.type,
        title: update.pageName,
        url: update.url
      })) : [];

      const issueBody = this.templates.generateNotificationIssue(changes, docsForIssue);
      const issueTitle = `📚 Documentação Atualizada - ${new Date().toLocaleDateString('pt-BR')}`;

      const issue = await this.github.createIssue(
        issueTitle,
        issueBody,
        [this.github.config.documentation.issue_labels.documentation]
      );

      console.log(`📝 Issue de notificação criada: #${issue.number}`);
      
      return issue;

    } catch (error) {
      console.error('❌ Erro ao criar issue de notificação:', error);
      this.stats.errors.push(`Issue creation: ${error.message}`);
    }
  }

  // Helper methods
  updateStats(results) {
    results.forEach(result => {
      if (result.usage) {
        this.stats.totalTokens += result.usage.total_tokens;
        const cost = this.openai.calculateCost(result.usage);
        this.stats.totalCost += parseFloat(cost.totalCost);
      }
    });
  }

  generateChangesSummary(files) {
    const additions = files.reduce((sum, f) => sum + (f.additions || 0), 0);
    const deletions = files.reduce((sum, f) => sum + (f.deletions || 0), 0);
    
    return `${files.length} arquivos modificados, ${additions} adições, ${deletions} remoções`;
  }

  generateCodeMetrics(files) {
    const metrics = {
      totalFiles: files.length,
      totalLines: 0,
      languages: {}
    };

    files.forEach(file => {
      const lines = file.content.split('\n').length;
      metrics.totalLines += lines;
      
      const ext = path.extname(file.path);
      metrics.languages[ext] = (metrics.languages[ext] || 0) + 1;
    });

    return JSON.stringify(metrics, null, 2);
  }

  calculateChangeStats(files) {
    return {
      additions: files.reduce((sum, f) => sum + (f.additions || 0), 0),
      deletions: files.reduce((sum, f) => sum + (f.deletions || 0), 0),
      changes: files.reduce((sum, f) => sum + (f.changes || 0), 0)
    };
  }

  formatTechnicalDocumentation(docs) {
    const header = this.templates.generateTechnicalIndex(
      docs.map(doc => ({
        type: 'technical',
        title: path.basename(doc.filePath),
        link: `#${this.slugify(path.basename(doc.filePath))}`,
        category: this.categorizeFile(doc.filePath)
      }))
    );

    const content = docs.map(doc => {
      if (doc.error) {
        return `## ❌ ${path.basename(doc.filePath)}\n\nErro ao processar: ${doc.error}`;
      }
      return doc.documentation;
    }).join('\n\n---\n\n');

    return `${header}\n\n---\n\n${content}`;
  }

  formatUserDocumentation(docs) {
    const header = this.templates.generateUserIndex(
      docs.map(doc => ({
        type: 'user',
        title: path.basename(doc.filePath),
        link: `#${this.slugify(path.basename(doc.filePath))}`,
        category: this.categorizeFile(doc.filePath)
      }))
    );

    const content = docs.map(doc => {
      if (doc.error) {
        return `## ❌ ${path.basename(doc.filePath)}\n\nErro ao processar: ${doc.error}`;
      }
      return doc.documentation;
    }).join('\n\n---\n\n');

    return `${header}\n\n---\n\n${content}`;
  }

  formatExecutiveDocumentation(docs) {
    const reports = docs.map(doc => ({
      title: doc.title,
      link: `#${this.slugify(doc.title)}`,
      date: new Date().toLocaleDateString('pt-BR')
    }));

    const header = this.templates.generateExecutiveIndex(reports);
    const content = docs.map(doc => doc.content).join('\n\n---\n\n');

    return `${header}\n\n---\n\n${content}`;
  }

  categorizeFile(filePath) {
    if (filePath.includes('components')) return 'components';
    if (filePath.includes('hooks')) return 'hooks';
    if (filePath.includes('utils')) return 'utils';
    if (filePath.includes('api')) return 'api';
    if (filePath.includes('services')) return 'api';
    if (filePath.includes('database') || filePath.includes('.prisma')) return 'database';
    if (filePath.includes('auth')) return 'authentication';
    if (filePath.includes('routes')) return 'routing';
    if (filePath.includes('store') || filePath.includes('state')) return 'state';
    if (filePath.includes('styles') || filePath.includes('.css')) return 'ui';
    if (filePath.includes('test') || filePath.includes('.test.')) return 'tests';
    if (filePath.includes('config')) return 'config';
    
    return 'geral';
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async getAllRelevantFiles() {
    // Busca todos os arquivos relevantes do repositório
    try {
      console.log('🔍 Buscando arquivos do repositório...');
      
      const allFiles = await this.github.getAllRepositoryFiles();
      console.log(`📁 Encontrados ${allFiles.length} arquivos`);
      
      const relevantFiles = await this.github.filterRelevantFiles(allFiles);
      console.log(`✅ Filtrados ${relevantFiles.length} arquivos relevantes`);
      
      return relevantFiles;
    } catch (error) {
      console.error('❌ Erro ao obter arquivos:', error.message);
      
      // Fallback: usar arquivos padrão se houver erro
      console.log('🔄 Usando arquivos padrão como fallback...');
      return [
        'frontend/src/App.tsx',
        'frontend/src/main.tsx',
        'frontend/src/routes/__root.tsx'
      ];
    }
  }

  async logResults() {
    const logData = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      environment: {
        node_version: process.version,
        github_event: process.env.GITHUB_EVENT_NAME,
        github_ref: process.env.GITHUB_REF
      }
    };

    console.log('\n📊 Estatísticas da Análise:');
    console.log(`   Total de arquivos: ${this.stats.totalFiles}`);
    console.log(`   Arquivos processados: ${this.stats.processedFiles}`);
    console.log(`   Total de tokens: ${this.stats.totalTokens}`);
    console.log(`   Custo estimado: $${this.stats.totalCost.toFixed(4)}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`   Erros: ${this.stats.errors.length}`);
      console.log('   Detalhes dos erros:');
      this.stats.errors.forEach(error => console.log(`     - ${error}`));
    }

    // Log para arquivo (se necessário para debugging)
    try {
      const logPath = path.join(__dirname, '../logs');
      await fs.mkdir(logPath, { recursive: true });
      
      const logFile = path.join(logPath, `analysis-${Date.now()}.json`);
      await fs.writeFile(logFile, JSON.stringify(logData, null, 2));
      
      console.log(`📋 Log salvo em: ${logFile}`);
    } catch (error) {
      console.warn('⚠️ Não foi possível salvar log:', error.message);
    }
  }
}

// Se executado diretamente
if (require.main === module) {
  const analyzer = new CodeAnalyzer();
  
  // Parse argumentos da linha de comando
  const args = process.argv.slice(2);
  const options = {};
  
  if (args.includes('--test')) {
    options.manual = true;
    options.createNotification = false;
    options.files = [
      { path: 'frontend/src/App.tsx', filename: 'frontend/src/App.tsx' }
    ];
  }
  
  analyzer.analyze(options)
    .then(result => {
      if (result.success) {
        console.log('✅ Análise concluída!');
        process.exit(0);
      } else {
        console.error('❌ Falha na análise:', result.error || result.reason);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = CodeAnalyzer;
