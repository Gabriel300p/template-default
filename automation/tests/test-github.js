require('dotenv').config();
const { Octokit } = require('@octokit/rest');

async function testGitHubAPI() {
  try {
    console.log('🔍 Teste simples da GitHub API');
    
    if (!process.env.TOKEN_GITHUB) {
      console.log('❌ TOKEN_GITHUB não configurado');
      return;
    }
    
    const octokit = new Octokit({
      auth: process.env.TOKEN_GITHUB,
    });
    
    console.log('📡 Testando conexão...');
    
    // Teste 1: Info do repo
    console.log('📋 Obtendo informações do repositório...');
    const repoInfo = await octokit.repos.get({
      owner: 'Gabriel300p',
      repo: 'default'
    });
    
    console.log('✅ Repositório:', repoInfo.data.full_name);
    console.log('   Branch padrão:', repoInfo.data.default_branch);
    console.log('   Privado:', repoInfo.data.private);
    
    // Teste 2: Listar conteúdo da raiz
    console.log('\n📁 Listando conteúdo da raiz...');
    const contents = await octokit.repos.getContent({
      owner: 'Gabriel300p',
      repo: 'default',
      path: ''
    });
    
    console.log('📊 Itens na raiz:', contents.data.length);
    contents.data.slice(0, 5).forEach(item => {
      console.log('   -', item.name, '(' + item.type + ')');
    });
    
    // Teste 3: Verificar se existe frontend
    console.log('\n📁 Verificando pasta frontend...');
    try {
      const frontendContents = await octokit.repos.getContent({
        owner: 'Gabriel300p',
        repo: 'default',
        path: 'frontend'
      });
      console.log('✅ Pasta frontend existe com', frontendContents.data.length, 'itens');
    } catch (error) {
      console.log('⚠️  Pasta frontend não encontrada:', error.status);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    if (error.status) console.log('   Status:', error.status);
  }
}

testGitHubAPI();
