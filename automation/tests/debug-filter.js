require('dotenv').config();
const GitHubClient = require('./scripts/utils/github-client');

async function debugFilter() {
  try {
    console.log('🔍 Debug detalhado do filtro');
    
    const github = new GitHubClient();
    
    // Carregar configuração
    await github.ensureConfigLoaded();
    console.log('✅ Configuração carregada');
    
    // Verificar padrões de filtro
    const { include, exclude } = github.config.file_patterns;
    console.log('\n📋 Padrões de inclusão:');
    include.forEach(p => console.log('   +', p));
    
    console.log('\n📋 Padrões de exclusão:');
    exclude.forEach(p => console.log('   -', p));
    
    // Testar arquivos específicos
    const testFiles = [
      'frontend/src/App.tsx',
      'frontend/src/main.tsx',
      'frontend/src/routes/__root.tsx',
      'frontend/package.json',
      'automation/scripts/analyze-code.js'
    ];
    
    console.log('\n🧪 Testando arquivos individuais:');
    
    for (const file of testFiles) {
      console.log(`\n📄 Testando: ${file}`);
      
      // Teste de exclusão
      const isExcluded = exclude.some(pattern => {
        const regex = github.globToRegex(pattern);
        const match = regex.test(file);
        if (match) {
          console.log(`   ❌ EXCLUÍDO por: ${pattern}`);
          console.log(`      Regex: ${regex}`);
        }
        return match;
      });
      
      if (isExcluded) {
        console.log(`   ❌ Arquivo excluído`);
        continue;
      }
      
      // Teste de inclusão
      let included = false;
      for (const pattern of include) {
        const regex = github.globToRegex(pattern);
        const match = regex.test(file);
        
        console.log(`   🔧 Teste padrão: ${pattern}`);
        console.log(`      Regex: ${regex}`);
        console.log(`      Match: ${match}`);
        
        if (match) {
          console.log(`   ✅ INCLUÍDO por: ${pattern}`);
          included = true;
          break;
        }
      }
      
      if (!included) {
        console.log(`   ⚠️  NÃO INCLUÍDO - nenhum padrão correspondeu`);
      }
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('Stack:', error.stack);
  }
}

debugFilter();
