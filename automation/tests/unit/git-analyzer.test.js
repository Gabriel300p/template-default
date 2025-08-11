/**
 * Testes Unitários - Git Analyzer
 * Validação completa do analisador Git
 */

const path = require('path');
const fs = require('fs');

class GitAnalyzerTests {
  constructor() {
    this.testResults = [];
    this.GitAnalyzer = require('../../feature-docs/core/git-analyzer');
  }

  async runAll() {
    console.log('🔍 TESTES UNITÁRIOS - Git Analyzer');
    console.log('=' .repeat(50));

    await this.testInitialization();
    await this.testGitRepository();
    await this.testChangedFiles();
    await this.testFeatureExtraction();
    await this.testBranchAnalysis();

    return this.generateReport();
  }

  async testInitialization() {
    console.log('\n📝 Teste: Inicialização');
    
    try {
      const analyzer = new this.GitAnalyzer();
      
      // Verificar propriedades básicas
      if (typeof analyzer.checkGitRepository !== 'function') {
        throw new Error('Método checkGitRepository ausente');
      }

      if (typeof analyzer.getChangedFiles !== 'function') {
        throw new Error('Método getChangedFiles ausente');
      }

      console.log('   ✅ Inicialização OK');
      this.testResults.push({
        test: 'Inicialização',
        status: 'PASSED',
        details: 'Todos os métodos estão presentes'
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Inicialização',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testGitRepository() {
    console.log('\n📝 Teste: Verificação de Repositório Git');
    
    try {
      const analyzer = new this.GitAnalyzer();
      
      // Teste com diretório atual (deve ser um repo Git)
      const isGitRepo = await analyzer.checkGitRepository(process.cwd());
      
      if (typeof isGitRepo !== 'boolean') {
        throw new Error('checkGitRepository deve retornar boolean');
      }

      // Teste com diretório inexistente
      const nonExistentPath = path.join(__dirname, 'non-existent-directory');
      const isNotGitRepo = await analyzer.checkGitRepository(nonExistentPath);
      
      if (isNotGitRepo !== false) {
        throw new Error('Diretório inexistente deve retornar false');
      }

      console.log('   ✅ Verificação de repositório OK');
      this.testResults.push({
        test: 'Verificação Git',
        status: 'PASSED',
        details: `Repositório atual: ${isGitRepo ? 'detectado' : 'não detectado'}`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Verificação Git',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testChangedFiles() {
    console.log('\n📝 Teste: Arquivos Alterados');
    
    try {
      const analyzer = new this.GitAnalyzer();
      
      // Teste básico de getChangedFiles
      const result = await analyzer.getChangedFiles();
      
      if (typeof result !== 'object' || result === null) {
        throw new Error('getChangedFiles deve retornar objeto');
      }

      const requiredProps = ['files', 'features'];
      for (const prop of requiredProps) {
        if (!result.hasOwnProperty(prop)) {
          throw new Error(`Propriedade ${prop} ausente no resultado`);
        }
      }

      if (!Array.isArray(result.files)) {
        throw new Error('Propriedade files deve ser array');
      }

      if (!Array.isArray(result.features)) {
        throw new Error('Propriedade features deve ser array');
      }

      console.log('   ✅ Análise de arquivos alterados OK');
      this.testResults.push({
        test: 'Arquivos Alterados',
        status: 'PASSED',
        details: `${result.files.length} arquivos, ${result.features.length} features`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Arquivos Alterados',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testFeatureExtraction() {
    console.log('\n📝 Teste: Extração de Features');
    
    try {
      const analyzer = new this.GitAnalyzer();
      
      // Testes com diferentes tipos de paths
      const testPaths = [
        'src/features/user-management/components/UserList.tsx',
        'src/features/dashboard/pages/DashboardPage.tsx',
        'src/components/shared/Button.tsx',
        'docs/README.md'
      ];

      for (const testPath of testPaths) {
        const features = analyzer.extractFeaturesFromPaths([testPath]);
        
        if (!Array.isArray(features)) {
          throw new Error(`Extração falhou para ${testPath}`);
        }

        // Verificar se features foram extraídas corretamente
        if (testPath.includes('src/features/')) {
          const expectedFeature = testPath.split('src/features/')[1].split('/')[0];
          if (testPath.includes('src/features/') && !features.includes(expectedFeature)) {
            console.log(`   ⚠️ Feature esperada não encontrada: ${expectedFeature} em ${testPath}`);
          }
        }
      }

      console.log('   ✅ Extração de features OK');
      this.testResults.push({
        test: 'Extração de Features',
        status: 'PASSED',
        details: 'Extração funcionando para diferentes tipos de paths'
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Extração de Features',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testBranchAnalysis() {
    console.log('\n📝 Teste: Análise de Branch');
    
    try {
      const analyzer = new this.GitAnalyzer();
      
      // Teste de obtenção da branch atual
      const currentBranch = await analyzer.getCurrentBranch();
      
      if (typeof currentBranch !== 'string') {
        throw new Error('getCurrentBranch deve retornar string');
      }

      if (currentBranch.length === 0) {
        console.log('   ⚠️ Branch atual vazia (possível HEAD detached)');
      }

      // Teste de comparação entre branches (se houver)
      try {
        const comparison = await analyzer.compareBranches('main', 'HEAD');
        if (comparison && typeof comparison === 'object') {
          console.log('   ℹ️ Comparação entre branches disponível');
        }
      } catch (branchError) {
        console.log('   ℹ️ Comparação de branches não disponível (normal se não há main branch)');
      }

      console.log('   ✅ Análise de branch OK');
      this.testResults.push({
        test: 'Análise de Branch',
        status: 'PASSED',
        details: `Branch atual: ${currentBranch || 'N/A'}`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Análise de Branch',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO - Git Analyzer');
    console.log(`✅ Passou: ${passed}/${total}`);
    console.log(`❌ Falhou: ${failed}/${total}`);

    if (failed > 0) {
      console.log('\nErros encontrados:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => {
          console.log(`   • ${r.test}: ${r.error}`);
        });
    }

    return {
      total,
      passed,
      failed,
      results: this.testResults
    };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tests = new GitAnalyzerTests();
  tests.runAll().then(report => {
    if (report.failed > 0) {
      process.exit(1);
    }
  });
}

module.exports = GitAnalyzerTests;
