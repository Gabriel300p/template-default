require('dotenv').config();
const CodeAnalyzer = require('../scripts/analyze-code');

async function testOptimizedSystem() {
  try {
    console.log('🚀 TESTE SISTEMA OTIMIZADO - Documentação Híbrida');
    
    const analyzer = new CodeAnalyzer();
    
    // Teste com documentação híbrida (mais econômica)
    const result = await analyzer.analyze({
      manual: true,
      files: [
        'frontend/src/App.tsx'  // Apenas 1 arquivo para economizar
      ],
      createNotification: false
    });
    
    console.log('\n📊 RESULTADOS:');
    console.log('✅ Sucesso:', result.success);
    
    if (result.success) {
      console.log('💰 Economia Alcançada:');
      console.log('   - Arquivos processados:', result.stats.processedFiles);
      console.log('   - Tokens totais:', result.stats.totalTokens);
      console.log('   - Custo total: $' + result.stats.totalCost.toFixed(4));
      console.log('   - Custo por arquivo: $' + (result.stats.totalCost / result.stats.processedFiles).toFixed(4));
      
      console.log('\n📝 Documentação Gerada:');
      Object.entries(result.documentation).forEach(([type, docs]) => {
        if (docs.length > 0) {
          console.log(`   🎯 ${type}: ${docs.length} documento(s)`);
        }
      });
      
      // Comparação com sistema anterior
      const previousCost = 0.0051; // Custo do teste anterior com 2 arquivos
      const currentCost = result.stats.totalCost;
      const savings = ((previousCost - currentCost) / previousCost * 100);
      
      console.log('\n💰 Comparação de Custos:');
      console.log('   - Sistema anterior (2 arquivos): $' + previousCost.toFixed(4));
      console.log('   - Sistema otimizado (1 arquivo): $' + currentCost.toFixed(4));
      console.log('   - Economia estimada: ' + savings.toFixed(1) + '%');
      
      console.log('\n🎯 SISTEMA OTIMIZADO FUNCIONANDO! ✅');
    } else {
      console.log('❌ Falha:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

testOptimizedSystem();
