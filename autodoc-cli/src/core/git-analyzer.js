/**
 * Git Analyzer
 * Analisa alterações no repositório para documentação incremental
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitAnalyzer {
  constructor() {
    this.isGitRepo = this.checkGitRepository();
  }

  checkGitRepository() {
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getChangedFiles(projectRoot, since = 'main') {
    if (!this.isGitRepo) {
      console.log('⚠️ Não é um repositório Git, analisando todos os arquivos');
      return null;
    }

    try {
      const command = `git diff --name-only ${since}..HEAD`;
      const output = execSync(command, { 
        cwd: projectRoot, 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const changedFiles = output
        .trim()
        .split('\n')
        .filter(file => file.length > 0)
        .map(file => path.resolve(projectRoot, file));

      return changedFiles;

    } catch (error) {
      if (error.message.includes('bad revision')) {
        console.log(`⚠️ Branch '${since}' não encontrada, usando HEAD~1`);
        return this.getChangedFiles(projectRoot, 'HEAD~1');
      }
      
      console.log('⚠️ Erro ao analisar alterações Git:', error.message);
      return null;
    }
  }

  async getFeatureChanges(projectRoot, featuresPath, since = 'main') {
    const allChanges = await this.getChangedFiles(projectRoot, since);
    
    if (!allChanges) {
      return null;
    }

    // Filtrar apenas arquivos dentro de features
    const featureChanges = allChanges.filter(file => {
      return file.includes(featuresPath) || file.includes('/features/');
    });

    // Agrupar por feature
    const changesByFeature = {};
    
    featureChanges.forEach(filePath => {
      const featureName = this.extractFeatureName(filePath, featuresPath);
      if (featureName) {
        if (!changesByFeature[featureName]) {
          changesByFeature[featureName] = [];
        }
        changesByFeature[featureName].push(filePath);
      }
    });

    return {
      total: featureChanges.length,
      byFeature: changesByFeature,
      files: featureChanges
    };
  }

  extractFeatureName(filePath, featuresBasePath) {
    try {
      const relativePath = path.relative(featuresBasePath, filePath);
      const segments = relativePath.split(path.sep);
      
      // Primeira pasta depois de features/ é o nome da feature
      if (segments.length > 0 && !segments[0].startsWith('.')) {
        return segments[0];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async getCommitInfo(projectRoot, since = 'main') {
    if (!this.isGitRepo) {
      return null;
    }

    try {
      // Último commit
      const lastCommit = execSync('git log -1 --format="%h %s %an %ad" --date=short', {
        cwd: projectRoot,
        encoding: 'utf8'
      }).trim();

      // Commits desde a referência
      const commitCount = execSync(`git rev-list --count ${since}..HEAD`, {
        cwd: projectRoot,
        encoding: 'utf8'
      }).trim();

      // Branch atual
      const currentBranch = execSync('git branch --show-current', {
        cwd: projectRoot,
        encoding: 'utf8'
      }).trim();

      return {
        lastCommit,
        commitCount: parseInt(commitCount),
        currentBranch,
        since
      };

    } catch (error) {
      console.log('⚠️ Erro ao obter informações de commit:', error.message);
      return null;
    }
  }

  async getFileLastModified(filePath, projectRoot) {
    if (!this.isGitRepo) {
      // Fallback para data de modificação do sistema
      try {
        const stats = fs.statSync(filePath);
        return {
          date: stats.mtime.toISOString().split('T')[0],
          author: 'unknown',
          commit: 'unknown'
        };
      } catch (error) {
        return null;
      }
    }

    try {
      const relativePath = path.relative(projectRoot, filePath);
      const command = `git log -1 --format="%h %an %ad" --date=short -- "${relativePath}"`;
      
      const output = execSync(command, {
        cwd: projectRoot,
        encoding: 'utf8'
      }).trim();

      if (output) {
        const [commit, author, date] = output.split(' ');
        return { commit, author, date };
      }

      return null;

    } catch (error) {
      return null;
    }
  }

  formatChangesSummary(changes, commitInfo) {
    if (!changes) {
      return 'Análise Git não disponível';
    }

    let summary = '';
    
    if (commitInfo) {
      summary += `📊 Branch: ${commitInfo.currentBranch}\n`;
      summary += `📝 Commits desde ${commitInfo.since}: ${commitInfo.commitCount}\n`;
      summary += `🕒 Último commit: ${commitInfo.lastCommit}\n\n`;
    }

    summary += `📁 Alterações em features: ${changes.total} arquivo(s)\n`;

    if (Object.keys(changes.byFeature).length > 0) {
      summary += `\n📋 Features alteradas:\n`;
      Object.entries(changes.byFeature).forEach(([feature, files]) => {
        summary += `   📂 ${feature}: ${files.length} arquivo(s)\n`;
      });
    }

    return summary;
  }

  isFileModified(filePath, projectRoot, since = 'main') {
    if (!this.isGitRepo) {
      return true; // Assume modificado se não há Git
    }

    try {
      const relativePath = path.relative(projectRoot, filePath);
      const command = `git diff --name-only ${since}..HEAD -- "${relativePath}"`;
      
      const output = execSync(command, {
        cwd: projectRoot,
        encoding: 'utf8'
      }).trim();

      return output.length > 0;

    } catch (error) {
      return true; // Assume modificado em caso de erro
    }
  }

  /**
   * Extrai features de uma lista de paths
   */
  extractFeaturesFromPaths(filePaths) {
    const features = new Set();

    for (const filePath of filePaths) {
      // Normalizar path
      const normalizedPath = filePath.replace(/\\/g, '/');
      
      // Procurar por padrão src/features/feature-name
      const featureMatch = normalizedPath.match(/src\/features\/([^\/]+)/);
      
      if (featureMatch) {
        const featureName = featureMatch[1];
        features.add(featureName);
      }
    }

    return Array.from(features);
  }
}

module.exports = { GitAnalyzer };
