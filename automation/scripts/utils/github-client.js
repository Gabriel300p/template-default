const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

class GitHubClient {
  constructor() {
    if (!process.env.TOKEN_GITHUB) {
      throw new Error('TOKEN_GITHUB environment variable is required');
    }
    
    this.octokit = new Octokit({
      auth: process.env.TOKEN_GITHUB,
    });
    
    // Configuração será carregada na primeira chamada
    this.config = null;
    this.configLoaded = false;
  }

  async ensureConfigLoaded() {
    if (!this.configLoaded) {
      await this.loadProjectConfig();
      this.configLoaded = true;
    }
  }

  async loadProjectConfig() {
    try {
      const configPath = path.join(__dirname, '../../config/project.json');
      const configContent = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configContent);
    } catch (error) {
      console.error('Erro ao carregar configuração do projeto:', error);
      throw error;
    }
  }

  /**
   * Obtém arquivos modificados em um PR ou commit
   */
  async getModifiedFiles(prNumber = null, sha = null) {
    try {
      const { owner, name } = this.config.repository;
      
      if (prNumber) {
        // Arquivos de um Pull Request
        const { data } = await this.octokit.pulls.listFiles({
          owner,
          repo: name,
          pull_number: prNumber,
        });
        
        return data.map(file => ({
          filename: file.filename,
          status: file.status,
          patch: file.patch,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes
        }));
      }
      
      if (sha) {
        // Arquivos de um commit específico
        const { data } = await this.octokit.repos.getCommit({
          owner,
          repo: name,
          ref: sha,
        });
        
        return data.files.map(file => ({
          filename: file.filename,
          status: file.status,
          patch: file.patch,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes
        }));
      }
      
      throw new Error('Deve fornecer prNumber ou sha');
      
    } catch (error) {
      console.error('Erro ao obter arquivos modificados:', error);
      throw error;
    }
  }

  /**
   * Obtém conteúdo de um arquivo
   */
  async getFileContent(filePath, ref = 'main') {
    try {
      const { owner, name } = this.config.repository;
      
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo: name,
        path: filePath,
        ref
      });
      
      if (data.type !== 'file') {
        throw new Error(`${filePath} não é um arquivo`);
      }
      
      // Decodifica o conteúdo base64
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      return {
        path: filePath,
        content,
        sha: data.sha,
        size: data.size,
        encoding: data.encoding
      };
      
    } catch (error) {
      if (error.status === 404) {
        console.warn(`Arquivo não encontrado: ${filePath}`);
        return null;
      }
      
      console.error(`Erro ao obter conteúdo do arquivo ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Filtra arquivos baseado nas configurações do projeto
   */
  async filterRelevantFiles(files) {
    await this.ensureConfigLoaded();
    const { include, exclude } = this.config.file_patterns;
    
    console.log(`🔍 Filtrando ${files.length} arquivos...`);
    
    return files.filter(file => {
      // Compatibilidade: string direta ou objeto com filename/path
      const filename = typeof file === 'string' ? file : (file.filename || file.path);
      
      // Verifica exclusões
      const isExcluded = exclude.some(pattern => {
        const regex = this.globToRegex(pattern);
        return regex.test(filename);
      });
      
      if (isExcluded) return false;
      
      // Verifica inclusões
      const isIncluded = include.some(pattern => {
        const regex = this.globToRegex(pattern);
        const match = regex.test(filename);
        if (match) console.log(`     ✅ Incluído: ${filename}`);
        return match;
      });
      
      return isIncluded;
    });
  }

  /**
   * Converte padrão glob para regex
   */
  globToRegex(pattern) {
    // Primeira etapa: processar chaves
    let step1 = pattern
      .replace(/\{([^}]+)\}/g, '($1)')
      .replace(/,/g, '|');
    
    // Segunda etapa: processar wildcards (** DEVE vir antes de *)
    let step2 = step1
      .replace(/\*\*/g, '___DOUBLE_STAR___')  // Placeholder temporário
      .replace(/\*/g, '[^/]*')                // * simples
      .replace(/___DOUBLE_STAR___/g, '.*')    // ** duplo
      .replace(/\?/g, '[^/]');               // ?
    
    // Terceira etapa: escapar pontos (mas não mexer no .* que veio do **)
    let step3 = step2.replace(/\.(?!\*)/g, '\\.');
    
    const regex = new RegExp(`^${step3}$`);
    
    return regex;
  }

  /**
   * Obtém informações do repositório
   */
  async getRepositoryInfo() {
    try {
      await this.ensureConfigLoaded();
      const { owner, name } = this.config.repository;
      
      const { data } = await this.octokit.repos.get({
        owner,
        repo: name,
      });
      
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        defaultBranch: data.default_branch,
        language: data.language,
        topics: data.topics,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
    } catch (error) {
      console.error('Erro ao obter informações do repositório:', error);
      throw error;
    }
  }

  /**
   * Cria uma issue no GitHub
   */
  async createIssue(title, body, labels = []) {
    try {
      const { owner, name } = this.config.repository;
      
      const { data } = await this.octokit.issues.create({
        owner,
        repo: name,
        title,
        body,
        labels: [...labels, this.config.documentation.issue_labels['auto-generated']]
      });
      
      console.log(`✅ Issue criada: #${data.number} - ${title}`);
      
      return {
        number: data.number,
        url: data.html_url,
        title: data.title
      };
      
    } catch (error) {
      console.error('Erro ao criar issue:', error);
      throw error;
    }
  }

  /**
   * Atualiza ou cria página do Wiki
   */
  async updateWikiPage(pageName, content, commitMessage = null) {
    try {
      const { owner, name } = this.config.repository;
      
      // Nome do repositório wiki
      const wikiRepo = `${name}.wiki`;
      
      // Sanitiza o nome da página
      const sanitizedPageName = this.sanitizeWikiPageName(pageName);
      const fileName = `${sanitizedPageName}.md`;
      
      const message = commitMessage || `📚 Atualização automática: ${pageName}`;
      
      try {
        // Tenta obter o arquivo existente
        const { data: existingFile } = await this.octokit.repos.getContent({
          owner,
          repo: wikiRepo,
          path: fileName
        });
        
        // Atualiza arquivo existente
        await this.octokit.repos.createOrUpdateFileContents({
          owner,
          repo: wikiRepo,
          path: fileName,
          message,
          content: Buffer.from(content).toString('base64'),
          sha: existingFile.sha
        });
        
        console.log(`📝 Wiki atualizada: ${pageName}`);
        
      } catch (error) {
        if (error.status === 404) {
          // Cria novo arquivo
          await this.octokit.repos.createOrUpdateFileContents({
            owner,
            repo: wikiRepo,
            path: fileName,
            message,
            content: Buffer.from(content).toString('base64')
          });
          
          console.log(`📝 Nova página wiki criada: ${pageName}`);
        } else {
          throw error;
        }
      }
      
      return {
        pageName: sanitizedPageName,
        fileName,
        url: `https://github.com/${owner}/${name}/wiki/${sanitizedPageName}`
      };
      
    } catch (error) {
      console.error(`Erro ao atualizar wiki page ${pageName}:`, error);
      throw error;
    }
  }

  /**
   * Sanitiza nome da página do wiki
   */
  sanitizeWikiPageName(name) {
    return name
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Obtém informações do Pull Request
   */
  async getPullRequestInfo(prNumber) {
    try {
      const { owner, name } = this.config.repository;
      
      const { data } = await this.octokit.pulls.get({
        owner,
        repo: name,
        pull_number: prNumber
      });
      
      return {
        number: data.number,
        title: data.title,
        body: data.body,
        author: data.user.login,
        baseBranch: data.base.ref,
        headBranch: data.head.ref,
        state: data.state,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
    } catch (error) {
      console.error(`Erro ao obter informações do PR ${prNumber}:`, error);
      throw error;
    }
  }

  /**
   * Lista branches do repositório
   */
  async listBranches() {
    try {
      const { owner, name } = this.config.repository;
      
      const { data } = await this.octokit.repos.listBranches({
        owner,
        repo: name
      });
      
      return data.map(branch => ({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected
      }));
      
    } catch (error) {
      console.error('Erro ao listar branches:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os arquivos do repositório recursivamente
   */
  async getAllRepositoryFiles(path = '') {
    try {
      await this.ensureConfigLoaded();
      const { owner, name } = this.config.repository;
      
      console.log(`📂 Explorando: ${path || 'raiz'}`);
      
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo: name,
        path
      });
      
      const files = [];
      
      for (const item of data) {
        if (item.type === 'file') {
          files.push(item.path);
        } else if (item.type === 'dir') {
          // Recursão para subdiretórios
          const subFiles = await this.getAllRepositoryFiles(item.path);
          files.push(...subFiles);
        }
      }
      
      return files;
      
    } catch (error) {
      console.error(`Erro ao obter arquivos de ${path}:`, error.message);
      throw error;
    }
  }
}

module.exports = GitHubClient;
