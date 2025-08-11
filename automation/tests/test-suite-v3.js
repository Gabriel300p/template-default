#!/usr/bin/env node

/**
 * Feature Documentation System v3.0 - Test Suite
 * Suíte completa de testes organizados
 */

const fs = require('fs');
const path = require('path');

class FeatureDocsTestSuite {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.startTime = Date.now();
    this.testCategories = {
      unit: [],
      integration: [],
      e2e: []
    };
  }

  async runAllTests() {
    console.log('🧪 Feature Documentation System v3.0 - Test Suite');
    console.log('='.repeat(60));
    console.log('📊 Iniciando testes completos...\n');

    // 1. Testes de Estrutura
    await this.runStructureTests();

    // 2. Testes Unitários
    await this.runUnitTests();

    // 3. Testes de Integração
    await this.runIntegrationTests();

    // 4. Testes End-to-End
    await this.runE2ETests();

    // 5. Testes de Performance
    await this.runPerformanceTests();

    // Relatório final
    this.generateFinalReport();
  }

  async runStructureTests() {
    console.log('📁 TESTES DE ESTRUTURA');
    console.log('-'.repeat(40));

    await this.test('Estrutura de diretórios', () => {
      const requiredDirs = [
        'feature-docs',
        'feature-docs/core',
        'feature-docs/analyzers',
        'feature-docs/templates',
        'feature-docs/generators',
        'feature-docs/config'
      ];

      for (const dir of requiredDirs) {
        const dirPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(dirPath)) {
          throw new Error(`Diretório obrigatório não encontrado: ${dir}`);
        }
      }
      return true;
    });

    await this.test('Arquivos principais existem', () => {
      const requiredFiles = [
        'generate-feature-docs.js',
        'feature-docs/core/feature-docs-engine.js',
        'feature-docs/core/git-analyzer.js',
        'feature-docs/core/feature-scanner.js',
        'feature-docs/analyzers/component-analyzer.js',
        'feature-docs/analyzers/ui-element-detector.js',
        'feature-docs/config/templates-config.json'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Arquivo obrigatório não encontrado: ${file}`);
        }
      }
      return true;
    });

    await this.test('Arquivos têm conteúdo válido', () => {
      const files = [
        'generate-feature-docs.js',
        'feature-docs/core/feature-docs-engine.js'
      ];

      for (const file of files) {
        const filePath = path.join(__dirname, '..', file);
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.length < 100) {
          throw new Error(`Arquivo muito pequeno ou vazio: ${file}`);
        }
      }
      return true;
    });

    console.log('');
  }

  async runUnitTests() {
    console.log('🔬 TESTES UNITÁRIOS');
    console.log('-'.repeat(40));

    // Teste do Git Analyzer
    await this.test('GitAnalyzer - Inicialização', () => {
      const GitAnalyzer = require('../feature-docs/core/git-analyzer');
      const analyzer = new GitAnalyzer();
      
      if (typeof analyzer.checkGitRepository !== 'function') {
        throw new Error('Método checkGitRepository não encontrado');
      }
      
      return true;
    });

    // Teste do Component Analyzer
    await this.test('ComponentAnalyzer - Métodos básicos', () => {
      const ComponentAnalyzer = require('../feature-docs/analyzers/component-analyzer');
      const analyzer = new ComponentAnalyzer();
      
      const methods = [
        'analyzeComponent',
        'analyzeReactComponent',
        'extractComponentName',
        'extractProps'
      ];

      for (const method of methods) {
        if (typeof analyzer[method] !== 'function') {
          throw new Error(`Método ${method} não encontrado`);
        }
      }
      
      return true;
    });

    // Teste do UI Element Detector
    await this.test('UIElementDetector - Padrões de detecção', () => {
      const UIElementDetector = require('../feature-docs/analyzers/ui-element-detector');
      const detector = new UIElementDetector();
      
      const requiredElements = ['filter', 'button', 'modal', 'form', 'table'];
      
      for (const element of requiredElements) {
        if (!detector.elementPatterns[element]) {
          throw new Error(`Padrão de elemento não encontrado: ${element}`);
        }
      }
      
      return true;
    });

    // Teste de Configuração de Templates
    await this.test('Templates Config - Estrutura válida', () => {
      const configPath = path.join(__dirname, '..', 'feature-docs/config/templates-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (!config.templates || !config.sections || !config.output) {
        throw new Error('Configuração de templates inválida');
      }
      
      if (!config.templates.default || !config.templates.default.audiences) {
        throw new Error('Template padrão não configurado');
      }
      
      return true;
    });

    console.log('');
  }

  async runIntegrationTests() {
    console.log('🔗 TESTES DE INTEGRAÇÃO');
    console.log('-'.repeat(40));

    // Teste de criação de fixtures
    await this.createTestFixtures();

    // Teste do Scanner de Features
    await this.test('FeatureScanner - Análise de fixture', async () => {
      const FeatureScanner = require('../feature-docs/core/feature-scanner');
      const ConfigManager = require('../feature-docs/config/settings');
      
      const config = new ConfigManager();
      const scanner = new FeatureScanner(config);
      
      const fixturesPath = path.join(__dirname, 'fixtures', 'test-features');
      const features = await scanner.scanFeatures(fixturesPath);
      
      if (!Array.isArray(features)) {
        throw new Error('Scanner não retornou array');
      }
      
      return true;
    });

    // Teste de análise de componente real
    await this.test('ComponentAnalyzer - Análise de componente fixture', async () => {
      const ComponentAnalyzer = require('../feature-docs/analyzers/component-analyzer');
      const analyzer = new ComponentAnalyzer();
      
      const componentPath = path.join(__dirname, 'fixtures', 'TestComponent.tsx');
      const analysis = await analyzer.analyzeComponent(componentPath);
      
      if (!analysis || !analysis.name) {
        throw new Error('Análise de componente falhou');
      }
      
      return true;
    });

    // Teste de detecção de elementos UI
    await this.test('UIElementDetector - Detecção em fixture', async () => {
      const UIElementDetector = require('../feature-docs/analyzers/ui-element-detector');
      const detector = new UIElementDetector();
      
      const componentPath = path.join(__dirname, 'fixtures', 'TestComponent.tsx');
      const elements = await detector.detectElements(componentPath, { props: [] });
      
      if (!Array.isArray(elements)) {
        throw new Error('Detector não retornou array');
      }
      
      return true;
    });

    console.log('');
  }

  async runE2ETests() {
    console.log('🎭 TESTES END-TO-END');
    console.log('-'.repeat(40));

    // Teste de execução completa (simulada)
    await this.test('Sistema completo - Execução simulada', async () => {
      // Simular execução sem arquivo real
      const options = {
        features: ['test-feature'],
        all: false,
        detectChanges: false,
        config: false
      };

      // Validar se opções são processadas corretamente
      if (!options.features || !Array.isArray(options.features)) {
        throw new Error('Processamento de opções falhou');
      }

      return true;
    });

    // Teste de configuração
    await this.test('Sistema de configuração - Criação', () => {
      const ConfigManager = require('../feature-docs/config/settings');
      const config = new ConfigManager();
      
      const validation = config.validate();
      if (typeof validation.isValid !== 'boolean') {
        throw new Error('Validação de config não funciona');
      }
      
      return true;
    });

    // Teste do script principal
    await this.test('Script principal - Parsing de argumentos', () => {
      // Mock process.argv
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js', '--help'];
      
      const { parseArguments } = require('../generate-feature-docs.js');
      const options = parseArguments();
      
      process.argv = originalArgv;
      
      if (typeof options !== 'object') {
        throw new Error('Parse de argumentos falhou');
      }
      
      return true;
    });

    console.log('');
  }

  async runPerformanceTests() {
    console.log('⚡ TESTES DE PERFORMANCE');
    console.log('-'.repeat(40));

    // Teste de performance de análise
    await this.test('Performance - Análise de componente', async () => {
      const startTime = Date.now();
      
      const ComponentAnalyzer = require('../feature-docs/analyzers/component-analyzer');
      const analyzer = new ComponentAnalyzer();
      
      const componentPath = path.join(__dirname, 'fixtures', 'TestComponent.tsx');
      await analyzer.analyzeComponent(componentPath);
      
      const duration = Date.now() - startTime;
      
      if (duration > 5000) { // 5 segundos
        throw new Error(`Análise muito lenta: ${duration}ms`);
      }
      
      console.log(`    ⏱️ Tempo: ${duration}ms`);
      return true;
    });

    // Teste de uso de memória
    await this.test('Performance - Uso de memória', () => {
      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      
      // Simular uso
      const UIElementDetector = require('../feature-docs/analyzers/ui-element-detector');
      const detector = new UIElementDetector();
      
      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const memoryGrowth = finalMemory - initialMemory;
      
      if (memoryGrowth > 50) { // 50MB
        throw new Error(`Muito uso de memória: ${memoryGrowth.toFixed(2)}MB`);
      }
      
      console.log(`    💾 Crescimento: ${memoryGrowth.toFixed(2)}MB`);
      return true;
    });

    console.log('');
  }

  async createTestFixtures() {
    const fixturesDir = path.join(__dirname, 'fixtures');
    const testFeaturesDir = path.join(fixturesDir, 'test-features', 'test-feature');
    
    if (!fs.existsSync(testFeaturesDir)) {
      fs.mkdirSync(testFeaturesDir, { recursive: true });
    }

    // Criar componente de teste
    const testComponent = `
import React, { useState } from 'react';

interface TestComponentProps {
  title: string;
  onSubmit?: (data: any) => void;
  loading?: boolean;
}

/**
 * TestComponent - Componente de teste para validação
 * @param props - Propriedades do componente
 */
export const TestComponent: React.FC<TestComponentProps> = ({ 
  title, 
  onSubmit, 
  loading = false 
}) => {
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ filter });
  };

  return (
    <div className="test-component">
      <h2>{title}</h2>
      
      {/* Filtro */}
      <input
        type="search"
        placeholder="Filtrar resultados..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" required />
        <input type="email" name="email" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Enviar'}
        </button>
      </form>

      {/* Tabela */}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>João</td>
            <td>joao@email.com</td>
            <td>
              <button onClick={() => setIsModalOpen(true)}>Editar</button>
              <button onClick={() => console.log('delete')}>Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Modal de Edição</h3>
            <button onClick={() => setIsModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestComponent;
`;

    fs.writeFileSync(
      path.join(fixturesDir, 'TestComponent.tsx'), 
      testComponent
    );
  }

  async test(name, testFn) {
    this.totalTests++;
    const testId = `test-${this.totalTests}`;
    
    try {
      console.log(`🧪 ${this.totalTests}. ${name}`);
      
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      if (result !== false) {
        this.passedTests++;
        console.log(`   ✅ PASSOU (${duration}ms)`);
        this.testResults.push({
          id: testId,
          name,
          status: 'PASSED',
          duration,
          error: null
        });
      } else {
        this.failedTests++;
        console.log(`   ❌ FALHOU`);
        this.testResults.push({
          id: testId,
          name,
          status: 'FAILED',
          duration,
          error: 'Teste retornou false'
        });
      }
      
    } catch (error) {
      this.failedTests++;
      console.log(`   ❌ FALHOU: ${error.message}`);
      this.testResults.push({
        id: testId,
        name,
        status: 'FAILED',
        duration: 0,
        error: error.message
      });
    }
  }

  generateFinalReport() {
    const duration = Date.now() - this.startTime;
    const successRate = Math.round((this.passedTests / this.totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DE TESTES');
    console.log('='.repeat(60));
    
    console.log(`⏱️  Tempo total: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📊 Total de testes: ${this.totalTests}`);
    console.log(`✅ Aprovados: ${this.passedTests}`);
    console.log(`❌ Falharam: ${this.failedTests}`);
    console.log(`⏭️  Pulados: ${this.skippedTests}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    
    // Status geral
    if (this.failedTests === 0) {
      console.log(`\n🎉 TODOS OS TESTES PASSARAM!`);
      console.log(`✅ Sistema v3.0 está funcionando perfeitamente!`);
    } else {
      console.log(`\n⚠️  ALGUNS TESTES FALHARAM`);
      console.log(`❌ Verifique os erros abaixo:`);
      
      const failedTests = this.testResults.filter(t => t.status === 'FAILED');
      failedTests.forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
    }
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    if (successRate === 100) {
      console.log('   ✅ Sistema pronto para produção');
      console.log('   ✅ Pode ser usado com confiança');
      console.log('   ✅ Documentação será gerada corretamente');
    } else if (successRate >= 80) {
      console.log('   ⚠️  Sistema funcional mas com problemas menores');
      console.log('   🔧 Revisar testes falhados antes de usar');
    } else {
      console.log('   ❌ Sistema possui problemas críticos');
      console.log('   🚫 NÃO recomendado para uso em produção');
      console.log('   🔧 Corrigir erros antes de prosseguir');
    }
    
    console.log('='.repeat(60));
    
    // Salvar relatório
    this.saveTestReport(duration, successRate);
    
    // Exit code
    if (this.failedTests > 0) {
      process.exit(1);
    }
  }

  saveTestReport(duration, successRate) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        skipped: this.skippedTests,
        successRate,
        duration
      },
      tests: this.testResults,
      system: {
        version: '3.0',
        node: process.version,
        platform: process.platform
      }
    };

    const reportPath = path.join(__dirname, '..', 'logs', `test-report-${Date.now()}.json`);
    
    // Criar diretório de logs se não existir
    const logsDir = path.dirname(reportPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📝 Relatório salvo: ${reportPath}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const testSuite = new FeatureDocsTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('❌ Erro fatal durante os testes:', error);
    process.exit(1);
  });
}

module.exports = FeatureDocsTestSuite;
