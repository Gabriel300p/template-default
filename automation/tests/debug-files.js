require('dotenv').config();
const GitHubClient = require('./scripts/utils/github-client');

async function debugFiles() {
  try {
    console.log('🔍 Debug: Detecção de arquivos');
    
    const github = new GitHubClient();
    
    // Teste 1: Arquivos específicos
    console.log('\n📋 Teste 1: Filtro com arquivos específicos');
    const testFiles = ['frontend/src/App.tsx', 'frontend/src/main.tsx'];
    const filtered = await github.filterRelevantFiles(testFiles);
    console.log('   Entrada:', testFiles);
    console.log('   Saída:', filtered);
    
    // Teste 2: Informações do repositório
    console.log('\n📋 Teste 2: Informações do repositório');
    const repoInfo = await github.getRepositoryInfo();
    console.log('   Repo:', repoInfo.full_name);
    console.log('   Branch padrão:', repoInfo.default_branch);
    
    // Teste 3: Buscar todos os arquivos
    console.log('\n📋 Teste 3: Todos os arquivos do repositório');
    const allFiles = await github.getAllRepositoryFiles();
    console.log('   Total de arquivos:', allFiles.length);
    
    // Mostrar alguns exemplos
    const jsFiles = allFiles.filter(f => f.includes('.js') || f.includes('.ts'));
    console.log('   Arquivos JS/TS encontrados:', jsFiles.length);
    console.log('   Exemplos:', jsFiles.slice(0, 5));
    
    // Teste 4: Filtrar todos os arquivos
    console.log('\n📋 Teste 4: Aplicar filtros em todos os arquivos');
    const relevantFiles = await github.filterRelevantFiles(allFiles);
    console.log('   Arquivos relevantes após filtro:', relevantFiles.length);
    console.log('   Lista:', relevantFiles);
    
  } catch (error) {
    console.log('❌ Erro no debug:', error.message);
    console.log('   Stack:', error.stack);
  }
}

debugFiles();
