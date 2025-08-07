#!/usr/bin/env node

// Teste simples sem OpenAI

console.log('🧪 TESTE SIMPLES - SEM OPENAI');
console.log('============================');

const path = require('path');
const fs = require('fs').promises;

async function testSimple() {
  try {
    // 1. Testar FeatureAnalyzer (sem OpenAI)
    console.log('\n📁 1. Testando FeatureAnalyzer...');
    const FeatureAnalyzer = require('./scripts/utils/feature-analyzer.js');
    const analyzer = new FeatureAnalyzer();
    console.log('   ✅ FeatureAnalyzer instanciado');

    // 2. Testar análise de estrutura
    console.log('\n🔍 2. Testando análise de estrutura...');
    const projectRoot = path.join(__dirname, '../');
    const authPath = path.join(projectRoot, 'frontend/src/features/auth');
    
    console.log(`   Testando caminho: ${authPath}`);
    
    try {
      await fs.access(authPath);
      console.log('   ✅ Diretório encontrado');
      
      const structure = await analyzer.analyzeFeatureStructure(authPath);
      console.log('   ✅ Estrutura analisada:');
      console.log(JSON.stringify(structure, null, 2));
      
      const files = await analyzer.getFeatureFiles(authPath);
      console.log(`   ✅ Arquivos coletados: ${files.length}`);
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }

    // 3. Testar template
    console.log('\n📝 3. Testando template...');
    try {
      const templatePath = path.join(__dirname, 'templates/feature-documentation.md');
      const template = await fs.readFile(templatePath, 'utf-8');
      console.log(`   ✅ Template carregado (${template.length} chars)`);
    } catch (error) {
      console.log(`   ❌ Template: ${error.message}`);
    }

    console.log('\n✅ TESTE SIMPLES OK!');
    return true;
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
    return false;
  }
}

testSimple().then(success => {
  process.exit(success ? 0 : 1);
});
