#!/usr/bin/env node

/**
 * AutoDoc CLI - Sistema Inteligente de Documentação Automática
 * CLI principal refatorada do template-default para uso universal
 */

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { AutoDocEngine } = require('./core/autodoc-engine');
const { ConfigManager } = require('./config/config-manager');
const { ProjectDetector } = require('./core/project-detector');

class AutoDocCLI {
  constructor() {
    this.program = new Command();
    this.engine = new AutoDocEngine();
    this.configManager = new ConfigManager();
    this.projectDetector = new ProjectDetector();
    
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('autodoc')
      .description('Sistema inteligente de documentação automática com análise AST e IA')
      .version('1.0.0');

    // Comando principal - geração interativa
    this.program
      .command('generate')
      .alias('g')
      .description('Gera documentação de forma interativa')
      .option('-c, --config <file>', 'Arquivo de configuração (padrão: .autodoc.yml)')
      .option('-o, --output <dir>', 'Diretório de saída (padrão: ./docs)')
      .option('-f, --format <format>', 'Formato de saída: markdown, html, pdf')
      .option('--no-ai', 'Desabilitar geração com IA')
      .option('--template <name>', 'Template específico a usar')
      .option('-v, --verbose', 'Saída detalhada')
      .action(this.generateCommand.bind(this));

    // Comando de inicialização
    this.program
      .command('init')
      .description('Inicializa configuração do AutoDoc no projeto atual')
      .option('-t, --template <type>', 'Tipo de projeto: js, ts, python, react, vue')
      .option('--force', 'Sobrescrever configuração existente')
      .action(this.initCommand.bind(this));

    // Comando de configuração
    this.program
      .command('config')
      .description('Gerencia configurações do AutoDoc')
      .option('--show', 'Mostra configuração atual')
      .option('--edit', 'Abre editor de configuração')
      .option('--set <key=value>', 'Define valor de configuração')
      .action(this.configCommand.bind(this));

    // Comando de análise
    this.program
      .command('analyze')
      .alias('a')
      .description('Analisa projeto sem gerar documentação')
      .option('-d, --dir <directory>', 'Diretório a analisar (padrão: ./src)')
      .option('--stats', 'Mostra estatísticas detalhadas')
      .action(this.analyzeCommand.bind(this));

    // Comando de templates
    this.program
      .command('template')
      .alias('t')
      .description('Gerencia templates de documentação')
      .option('--list', 'Lista templates disponíveis')
      .option('--create <name>', 'Cria novo template')
      .option('--edit <name>', 'Edita template existente')
      .action(this.templateCommand.bind(this));
  }

  async run(argv) {
    try {
      // Banner de boas-vindas
      this.showBanner();
      
      await this.program.parseAsync(argv);
    } catch (error) {
      console.error(chalk.red('❌ Erro:'), error.message);
      throw error;
    }
  }

  showBanner() {
    console.log(chalk.cyan(`
╔════════════════════════════════════════════════════════════╗
║                       🤖 AutoDoc CLI                      ║
║          Sistema Inteligente de Documentação             ║
║                                                          ║
║  📋 AST Analysis + 🧠 AI Generation + 📝 Smart Templates  ║
╚════════════════════════════════════════════════════════════╝
    `));
  }

  async generateCommand(options) {
    const spinner = ora('Inicializando AutoDoc...').start();
    
    try {
      // Detectar tipo de projeto
      const projectInfo = await this.projectDetector.detect();
      spinner.succeed(`Projeto detectado: ${projectInfo.type} (${projectInfo.language})`);

      // Carregar ou criar configuração
      const config = await this.configManager.loadOrCreate(options.config);
      
      if (!options.config && !await this.configManager.hasConfig()) {
        spinner.info('Primeira execução detectada. Iniciando configuração...');
        await this.runInteractiveSetup(projectInfo);
      }

      // Executar geração
      spinner.start('Analisando código-fonte...');
      const result = await this.engine.generate({
        ...config,
        ...options,
        projectInfo
      });

      if (result.success) {
        spinner.succeed(`Documentação gerada com sucesso!`);
        console.log(chalk.green('📄 Arquivos criados:'));
        result.files.forEach(file => {
          console.log(chalk.gray('  ➜'), chalk.white(file));
        });
        
        if (result.stats) {
          this.showStats(result.stats);
        }
      } else {
        spinner.fail('Falha na geração da documentação');
        console.error(chalk.red('Erro:'), result.error);
      }

    } catch (error) {
      spinner.fail('Erro durante a geração');
      throw error;
    }
  }

  async initCommand(options) {
    const spinner = ora('Inicializando configuração...').start();

    try {
      // Verificar se já existe configuração
      if (await this.configManager.hasConfig() && !options.force) {
        spinner.warn('Configuração já existe. Use --force para sobrescrever.');
        return;
      }

      // Detectar projeto
      const projectInfo = await this.projectDetector.detect();
      spinner.succeed(`Projeto ${projectInfo.type} detectado`);

      // Setup interativo
      await this.runInteractiveSetup(projectInfo, options);
      
      spinner.succeed('Configuração criada com sucesso!');
      console.log(chalk.green('✨ Pronto! Execute'), chalk.cyan('autodoc generate'), chalk.green('para gerar documentação.'));
      
    } catch (error) {
      spinner.fail('Erro na inicialização');
      throw error;
    }
  }

  async runInteractiveSetup(projectInfo, options = {}) {
    console.log(chalk.yellow('🔧 Configuração Interativa do AutoDoc\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Nome do projeto:',
        default: path.basename(process.cwd())
      },
      {
        type: 'list',
        name: 'language',
        message: 'Linguagem principal:',
        choices: [
          { name: 'TypeScript', value: 'typescript' },
          { name: 'JavaScript', value: 'javascript' },
          { name: 'Python', value: 'python' },
          { name: 'Auto-detectar', value: 'auto' }
        ],
        default: projectInfo.language || 'auto'
      },
      {
        type: 'input',
        name: 'sourceDir',
        message: 'Diretório do código-fonte:',
        default: this.detectSourceDir(projectInfo)
      },
      {
        type: 'input',
        name: 'outputDir',
        message: 'Diretório de saída da documentação:',
        default: './docs'
      },
      {
        type: 'list',
        name: 'template',
        message: 'Template de documentação:',
        choices: [
          { name: 'Padrão (Completo)', value: 'standard' },
          { name: 'Simples (README)', value: 'simple' },
          { name: 'API (Foco em APIs)', value: 'api' },
          { name: 'Componentes (UI)', value: 'components' }
        ],
        default: 'standard'
      },
      {
        type: 'confirm',
        name: 'useAI',
        message: 'Habilitar geração com IA (requer OpenAI API Key)?',
        default: true
      }
    ]);

    // Configurar IA se solicitado
    if (answers.useAI) {
      const aiAnswers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'OpenAI API Key (opcional - pode ser configurada via .env):',
          mask: '*'
        },
        {
          type: 'list',
          name: 'model',
          message: 'Modelo de IA:',
          choices: [
            { name: 'GPT-4o Mini (Rápido e econômico)', value: 'gpt-4o-mini' },
            { name: 'GPT-4o (Mais inteligente)', value: 'gpt-4o' },
            { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
          ],
          default: 'gpt-4o-mini'
        }
      ]);
      
      answers.ai = {
        enabled: true,
        model: aiAnswers.model,
        apiKey: aiAnswers.apiKey || undefined
      };
    } else {
      answers.ai = { enabled: false };
    }

    // Salvar configuração
    await this.configManager.create({
      project: {
        name: answers.projectName,
        language: answers.language,
        sourceDir: answers.sourceDir,
        outputDir: answers.outputDir
      },
      generation: {
        template: answers.template,
        format: 'markdown',
        includePrivate: false,
        includeTests: false
      },
      ai: answers.ai
    });

    console.log(chalk.green('✅ Configuração salva em'), chalk.cyan('.autodoc.yml'));
  }

  detectSourceDir(projectInfo) {
    const candidates = ['./src', './lib', './', './app'];
    
    for (const dir of candidates) {
      if (fs.existsSync(path.join(process.cwd(), dir))) {
        return dir;
      }
    }
    
    return './src';
  }

  async configCommand(options) {
    if (options.show) {
      const config = await this.configManager.load();
      console.log(chalk.cyan('📋 Configuração Atual:'));
      console.log(JSON.stringify(config, null, 2));
      return;
    }

    if (options.edit) {
      console.log(chalk.yellow('🔧 Funcionalidade de edição será implementada na próxima versão'));
      return;
    }

    if (options.set) {
      const [key, value] = options.set.split('=');
      await this.configManager.set(key, value);
      console.log(chalk.green('✅ Configuração atualizada:'), chalk.cyan(key), '=', chalk.white(value));
      return;
    }

    console.log(chalk.yellow('Use --show, --edit ou --set key=value'));
  }

  async analyzeCommand(options) {
    const spinner = ora('Analisando projeto...').start();

    try {
      // Carregar configuração do projeto
      const config = await this.configManager.load();
      
      // Override com opções da linha de comando se fornecidas
      if (options.dir) {
        config.project.sourceDir = options.dir;
      }

      const analysis = await this.engine.analyze(config);

      spinner.succeed('Análise concluída');

      console.log(chalk.cyan('📊 Resultado da Análise:'));
      console.log(chalk.white(`📁 Arquivos encontrados: ${analysis.totalFiles}`));
      console.log(chalk.white(`⚛️  Componentes: ${analysis.components?.length || 0}`));
      console.log(chalk.white(`🔧 Funções: ${analysis.functions?.length || 0}`));
      console.log(chalk.white(`📘 Classes: ${analysis.classes?.length || 0}`));

      if (options.stats && analysis.stats) {
        this.showDetailedStats(analysis.stats);
      }

    } catch (error) {
      spinner.fail('Erro na análise');
      throw error;
    }
  }

  async templateCommand(options) {
    if (options.list) {
      const templates = await this.engine.getAvailableTemplates();
      console.log(chalk.cyan('📝 Templates Disponíveis:'));
      templates.forEach(template => {
        console.log(chalk.white('  ➜'), chalk.cyan(template.name), chalk.gray(`- ${template.description}`));
      });
      return;
    }

    console.log(chalk.yellow('🔧 Funcionalidades de template serão implementadas na próxima versão'));
  }

  showStats(stats) {
    console.log(chalk.cyan('\n📊 Estatísticas:'));
    console.log(chalk.gray('  Tempo de análise:'), chalk.white(`${stats.analysisTime}ms`));
    console.log(chalk.gray('  Tempo de geração:'), chalk.white(`${stats.generationTime}ms`));
    
    if (stats.ai) {
      console.log(chalk.gray('  Tokens IA utilizados:'), chalk.white(`${stats.ai.tokensUsed}`));
      console.log(chalk.gray('  Custo estimado:'), chalk.white(`$${stats.ai.estimatedCost}`));
    }
  }

  showDetailedStats(stats) {
    console.log(chalk.cyan('\n📈 Estatísticas Detalhadas:'));
    Object.entries(stats).forEach(([key, value]) => {
      console.log(chalk.gray(`  ${key}:`), chalk.white(value));
    });
  }
}

module.exports = { AutoDocCLI };
