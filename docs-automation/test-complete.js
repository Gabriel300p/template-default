#!/usr/bin/env node

// Teste completo do sistema de documentação de features

const path = require('path');
const fs = require('fs').promises;

// Simular variáveis de ambiente para teste
process.env.OPENAI_API_KEY = 'test_key_for_local_testing';
process.env.TOKEN_GITHUB = 'test_token_for_local_testing';
process.env.DEBUG_MODE = 'true';

console.log('🧪 INICIANDO TESTE COMPLETO DO SISTEMA');
console.log('=====================================');

async function testComplete() {
  try {
    // 1. Testar importações
    console.log('\n📦 1. Testando importações...');
    const FeatureDocumentationGenerator = require('./scripts/analyze-features.js');
    console.log('   ✅ analyze-features.js importado');
    
    const OpenAIClient = require('./scripts/utils/openai-client.js');
    console.log('   ✅ openai-client.js importado');
    
    const GitHubClient = require('./scripts/utils/github-client.js');
    console.log('   ✅ github-client.js importado');
    
    const FeatureAnalyzer = require('./scripts/utils/feature-analyzer.js');
    console.log('   ✅ feature-analyzer.js importado');

    // 2. Testar instanciação
    console.log('\n🏗️  2. Testando instanciação...');
    const generator = new FeatureDocumentationGenerator({ debug: true });
    console.log('   ✅ FeatureDocumentationGenerator instanciado');

    // 3. Testar detecção de features
    console.log('\n🔍 3. Testando detecção de features...');
    const changedFeatures = await generator.detectChangedFeatures();
    console.log(`   ✅ Features detectadas: ${changedFeatures.join(', ')}`);

    // 4. Testar análise de estrutura
    console.log('\n📁 4. Testando análise de estrutura...');
    const projectRoot = path.join(__dirname, '../');
    const authPath = path.join(projectRoot, 'frontend/src/features/auth');
    
    // Verificar se o diretório existe
    try {
      await fs.access(authPath);
      console.log(`   ✅ Diretório auth encontrado: ${authPath}`);
      
      const analyzer = new FeatureAnalyzer();
      const structure = await analyzer.analyzeFeatureStructure(authPath);
      console.log('   ✅ Estrutura da feature auth analisada:');
      console.log(`      - Componentes: ${structure.components?.length || 0}`);
      console.log(`      - Hooks: ${structure.hooks?.length || 0}`);
      console.log(`      - Páginas: ${structure.pages?.length || 0}`);
      console.log(`      - Serviços: ${structure.services?.length || 0}`);
      
    } catch (error) {
      console.log(`   ❌ Erro ao acessar diretório: ${error.message}`);
    }

    // 5. Testar template
    console.log('\n📝 5. Testando template...');
    try {
      const templatePath = path.join(__dirname, 'templates/feature-documentation.md');
      const template = await fs.readFile(templatePath, 'utf-8');
      console.log(`   ✅ Template carregado (${template.length} caracteres)`);
    } catch (error) {
      console.log(`   ❌ Erro ao carregar template: ${error.message}`);
    }

    // 6. Testar geração completa
    console.log('\n🚀 6. Testando geração completa...');
    const result = await generator.generateFeatureDocs();
    
    if (result.success) {
      console.log('   ✅ Geração completa executada com sucesso!');
      console.log(`   📊 Stats: ${JSON.stringify(result.stats, null, 2)}`);
    } else {
      console.log(`   ❌ Erro na geração: ${result.error}`);
    }

    console.log('\n✨ TESTE COMPLETO FINALIZADO!');
    return true;

  } catch (error) {
    console.error('\n💥 ERRO NO TESTE:', error);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Executar teste
testComplete().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 ERRO FATAL:', error);
  process.exit(1);
});
