require('dotenv').config();
const CodeAnalyzer = require('./scripts/analyze-code');

async function finalTest() {
  try {
    console.log('🎯 TESTE FINAL - Sistema de Documentação Completo');
    
    const analyzer = new CodeAnalyzer();
    
    // Executar análise sem criar issue
    const result = await analyzer.analyze({
      manual: true,
      files: [
        'frontend/src/App.tsx',
        'frontend/src/main.tsx'
      ],
      createNotification: false // Desabilitar issue
    });
    
    console.log('\n🎉 RESULTADO FINAL:');
    console.log('✅ Sucesso:', result.success);
    
    if (result.success) {
      console.log('📊 Estatísticas Finais:');
      console.log('   - Arquivos processados:', result.stats.processedFiles);
      console.log('   - Total de tokens:', result.stats.totalTokens);
      console.log('   - Custo total: $' + result.stats.totalCost);
      console.log('   - Tipos de documentação:', Object.keys(result.documentation));
      
      console.log('\n📄 Documentação gerada:');
      Object.entries(result.documentation).forEach(([type, docs]) => {
        console.log(`   📝 ${type}: ${docs.length} documentos`);
      });
      
      console.log('\n🎯 SISTEMA TOTALMENTE FUNCIONAL! ✅');
    } else {
      console.log('❌ Falha:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Erro no teste final:', error.message);
  }
}

finalTest();
