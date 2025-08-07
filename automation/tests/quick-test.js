require('dotenv').config();
const GitHubClient = require('./scripts/utils/github-client');

async function quickTest() {
  try {
    const github = new GitHubClient();
    
    console.log('🧪 Teste rápido de alguns arquivos específicos');
    
    // Listar arquivos da pasta src do frontend
    const { owner, name } = (await github.loadProjectConfig(), github.config.repository);
    
    console.log('📋 Listando conteúdo de frontend/src...');
    
    const { data } = await github.octokit.repos.getContent({
      owner: 'Gabriel300p',
      repo: 'default',
      path: 'frontend/src'
    });
    
    const files = data
      .filter(item => item.type === 'file')
      .map(item => item.path);
    
    console.log('📁 Arquivos encontrados em src:');
    files.forEach(f => console.log('   -', f));
    
    console.log('\n🔍 Testando filtro...');
    const filtered = await github.filterRelevantFiles(files);
    
    console.log('✅ Arquivos filtrados:');
    filtered.forEach(f => console.log('   -', f));
    
    console.log('\n📊 Resultado:', filtered.length, 'de', files.length, 'arquivos passaram no filtro');
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

// Timeout de 10 segundos
setTimeout(() => {
  console.log('⏰ Timeout - encerrando teste');
  process.exit(0);
}, 10000);

quickTest();
