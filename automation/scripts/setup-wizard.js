#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const execAsync = promisify(exec);

class SetupWizard {
  constructor() {
    this.configPath = path.join(__dirname, '../config/project.json');
    this.packagePath = path.join(__dirname, '../package.json');
  }

  async run() {
    console.log('🚀 Setup Wizard - Sistema de Documentação Automática\n');
    
    try {
      // 1. Verificar Node.js
      await this.checkNodeVersion();
      
      // 2. Verificar dependências
      await this.checkDependencies();
      
      // 3. Verificar configuração
      await this.checkConfiguration();
      
      // 4. Verificar variáveis de ambiente
      await this.checkEnvironmentVariables();
      
      // 5. Testar conectividade
      await this.testConnectivity();
      
      console.log('\n✅ Setup concluído com sucesso!');
      console.log('\n📋 Próximos passos:');
      console.log('   1. Configure as secrets no GitHub (OPENAI_API_KEY, TOKEN_GITHUB)');
      console.log('   2. Execute: npm run analyze:test');
      console.log('   3. Faça um PR para testar o sistema completo');
      console.log('\n📚 Documentação: automation/SETUP.md');
      
    } catch (error) {
      console.error('\n❌ Erro no setup:', error.message);
      console.log('\n🔍 Verifique:');
      console.log('   - Node.js 18+ está instalado');
      console.log('   - Dependências foram instaladas (npm install)');
      console.log('   - Configuração em config/project.json está correta');
      
      process.exit(1);
    }
  }

  async checkNodeVersion() {
    console.log('🟢 Verificando versão do Node.js...');
    
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const majorVersion = parseInt(version.substring(1).split('.')[0]);
      
      if (majorVersion < 18) {
        throw new Error(`Node.js ${version} detectado. Requer versão 18 ou superior.`);
      }
      
      console.log(`   ✅ Node.js ${version} (OK)`);
      
    } catch (error) {
      throw new Error(`Erro ao verificar Node.js: ${error.message}`);
    }
  }

  async checkDependencies() {
    console.log('📦 Verificando dependências...');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(this.packagePath, 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      
      console.log(`   ✅ Dependências definidas: ${dependencies.length}`);
      
      // Verificar se node_modules existe
      const nodeModulesPath = path.join(__dirname, '../node_modules');
      try {
        await fs.access(nodeModulesPath);
        console.log('   ✅ node_modules encontrado');
      } catch {
        console.log('   ⚠️ node_modules não encontrado - execute: npm install');
      }
      
    } catch (error) {
      throw new Error(`Erro ao verificar dependências: ${error.message}`);
    }
  }

  async checkConfiguration() {
    console.log('⚙️ Verificando configuração...');
    
    try {
      const config = JSON.parse(await fs.readFile(this.configPath, 'utf8'));
      
      // Verificações básicas
      const required = ['name', 'main_branch', 'repository', 'stack'];
      const missing = required.filter(key => !config[key]);
      
      if (missing.length > 0) {
        throw new Error(`Configuração incompleta. Campos obrigatórios: ${missing.join(', ')}`);
      }
      
      console.log(`   ✅ Projeto: ${config.name}`);
      console.log(`   ✅ Branch principal: ${config.main_branch}`);
      console.log(`   ✅ Repositório: ${config.repository.owner}/${config.repository.name}`);
      console.log(`   ✅ Stack: ${config.stack.frontend?.join(', ') || 'Não definido'}`);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Arquivo de configuração não encontrado: config/project.json');
      }
      throw new Error(`Erro na configuração: ${error.message}`);
    }
  }

  async checkEnvironmentVariables() {
    console.log('🔐 Verificando variáveis de ambiente...');
    
    const envVars = {
      'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
      'TOKEN_GITHUB': process.env.TOKEN_GITHUB
    };
    
    Object.entries(envVars).forEach(([name, value]) => {
      if (value) {
        const masked = value.substring(0, 8) + '...';
        console.log(`   ✅ ${name}: ${masked} (configurado)`);
      } else {
        console.log(`   ⚠️ ${name}: não configurado (necessário para produção)`);
      }
    });
    
    console.log('\n   💡 Para configurar localmente:');
    console.log('      export OPENAI_API_KEY="sua-chave"');
    console.log('      export TOKEN_GITHUB="seu-token"');
    
    console.log('\n   💡 Para produção no GitHub:');
    console.log('      Settings → Secrets → Actions → New repository secret');
  }

  async testConnectivity() {
    console.log('🔌 Testando conectividade...');
    
    try {
      // Teste básico de importação dos módulos
      const OpenAIClient = require('../scripts/utils/openai-client');
      const GitHubClient = require('../scripts/utils/github-client');
      const DocumentationTemplates = require('../scripts/utils/templates');
      
      console.log('   ✅ Módulos carregados com sucesso');
      
      // Se as variáveis estiverem configuradas, teste as conexões
      if (process.env.OPENAI_API_KEY && process.env.TOKEN_GITHUB) {
        console.log('   🧪 Testando conexões...');
        
        // Teste básico do GitHub
        const github = new GitHubClient();
        await github.getRepositoryInfo();
        console.log('   ✅ Conexão GitHub OK');
        
        console.log('   ✅ Conectividade validada');
      } else {
        console.log('   ⚠️ Credenciais não configuradas - pule testes de conectividade');
      }
      
    } catch (error) {
      console.log(`   ⚠️ Erro na conectividade: ${error.message}`);
      console.log('   💡 Isso é normal se as credenciais não estiverem configuradas');
    }
  }

  async generateSampleConfig() {
    const sampleConfig = {
      name: "Meu Projeto",
      description: "Descrição do projeto",
      main_branch: "main",
      repository: {
        owner: "meu-usuario",
        name: "meu-repositorio"
      },
      stack: {
        frontend: ["react", "typescript", "vite"],
        backend: ["nodejs", "supabase"],
        mobile: ["react-native"]
      },
      documentation: {
        wiki_enabled: true,
        issue_labels: {
          documentation: "📚 documentation",
          "auto-generated": "🤖 auto-generated",
          technical: "🔧 technical",
          "user-guide": "👥 user-guide",
          executive: "📈 executive"
        }
      }
    };
    
    const configPath = path.join(__dirname, '../config/project-sample.json');
    await fs.writeFile(configPath, JSON.stringify(sampleConfig, null, 2));
    
    console.log(`📄 Configuração de exemplo criada: ${configPath}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const wizard = new SetupWizard();
  wizard.run().catch(console.error);
}

module.exports = SetupWizard;
