require('dotenv').config();
const CodeAnalyzer = require('./scripts/analyze-code');

async function testWithSpecificFiles() {
  try {
    console.log('🚀 Teste com arquivos específicos (modo produção)');
    
    const analyzer = new CodeAnalyzer();
    
    // Executar análise com arquivos específicos
    const result = await analyzer.analyze({
      manual: true,
      files: [
        'frontend/src/App.tsx',
        'frontend/src/main.tsx'
      ]
    });
    
    console.log('✅ Resultado da análise:', result.success ? 'SUCESSO' : 'FALHA');
    
    if (result.success) {
      console.log('📊 Estatísticas:');
      console.log('   - Arquivos processados:', result.stats.processedFiles);
      console.log('   - Total de tokens:', result.stats.totalTokens);
      console.log('   - Custo estimado: $' + result.stats.totalCost);
      console.log('   - Documentação gerada:', Object.keys(result.documentation));
    } else {
      console.log('❌ Erro:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Erro na análise:', error.message);
  }
}

testWithSpecificFiles();
