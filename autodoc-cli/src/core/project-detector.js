/**
 * Project Detector - Detecta tipo e características do projeto
 */

const fs = require('fs-extra');
const path = require('path');

class ProjectDetector {
  constructor() {
    this.detectors = [
      this.detectReact.bind(this),
      this.detectVue.bind(this),
      this.detectNextJS.bind(this),
      this.detectNuxtJS.bind(this),
      this.detectPython.bind(this),
      this.detectTypeScript.bind(this),
      this.detectJavaScript.bind(this)
    ];
  }

  async detect(projectPath = process.cwd()) {
    let projectInfo = {
      type: 'unknown',
      language: 'unknown',
      framework: null,
      sourceDir: './src',
      features: []
    };

    // Tentar cada detector
    for (const detector of this.detectors) {
      const result = await detector(projectPath);
      if (result.detected) {
        projectInfo = { ...projectInfo, ...result };
        break;
      }
    }

    // Detectar diretório de código
    projectInfo.sourceDir = await this.detectSourceDirectory(projectPath);

    return projectInfo;
  }

  async detectReact(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.exists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.react) {
          return {
            detected: true,
            type: 'react',
            language: deps.typescript ? 'typescript' : 'javascript',
            framework: 'react',
            features: [
              'components',
              'hooks',
              deps['react-router-dom'] ? 'routing' : null,
              deps['@tanstack/react-query'] ? 'state-management' : null
            ].filter(Boolean)
          };
        }
      } catch (error) {
        // Ignorar erro de leitura
      }
    }

    return { detected: false };
  }

  async detectVue(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.exists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.vue) {
          return {
            detected: true,
            type: 'vue',
            language: deps.typescript ? 'typescript' : 'javascript',
            framework: 'vue',
            features: ['components', 'composables']
          };
        }
      } catch (error) {
        // Ignorar erro
      }
    }

    return { detected: false };
  }

  async detectNextJS(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.exists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.next) {
          return {
            detected: true,
            type: 'nextjs',
            language: deps.typescript ? 'typescript' : 'javascript',
            framework: 'nextjs',
            features: ['pages', 'components', 'api-routes']
          };
        }
      } catch (error) {
        // Ignorar erro
      }
    }

    return { detected: false };
  }

  async detectNuxtJS(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.exists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.nuxt) {
          return {
            detected: true,
            type: 'nuxtjs',
            language: deps.typescript ? 'typescript' : 'javascript',
            framework: 'nuxtjs',
            features: ['pages', 'components', 'composables']
          };
        }
      } catch (error) {
        // Ignorar erro
      }
    }

    return { detected: false };
  }

  async detectPython(projectPath) {
    const indicators = [
      'requirements.txt',
      'setup.py',
      'pyproject.toml',
      'Pipfile'
    ];

    for (const indicator of indicators) {
      if (await fs.exists(path.join(projectPath, indicator))) {
        return {
          detected: true,
          type: 'python',
          language: 'python',
          framework: null,
          features: ['modules', 'classes', 'functions']
        };
      }
    }

    // Verificar se há arquivos .py
    try {
      const files = await fs.readdir(projectPath);
      const hasPythonFiles = files.some(file => file.endsWith('.py'));
      
      if (hasPythonFiles) {
        return {
          detected: true,
          type: 'python',
          language: 'python',
          framework: null,
          features: ['modules', 'classes', 'functions']
        };
      }
    } catch (error) {
      // Ignorar erro
    }

    return { detected: false };
  }

  async detectTypeScript(projectPath) {
    const indicators = [
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json'
    ];

    for (const indicator of indicators) {
      if (await fs.exists(path.join(projectPath, indicator))) {
        return {
          detected: true,
          type: 'typescript',
          language: 'typescript',
          framework: null,
          features: ['types', 'interfaces', 'classes']
        };
      }
    }

    return { detected: false };
  }

  async detectJavaScript(projectPath) {
    if (await fs.exists(path.join(projectPath, 'package.json'))) {
      return {
        detected: true,
        type: 'javascript',
        language: 'javascript',
        framework: null,
        features: ['functions', 'modules']
      };
    }

    return { detected: false };
  }

  async detectSourceDirectory(projectPath) {
    const candidates = [
      'src',
      'lib',
      'app',
      'source',
      '.'
    ];

    for (const candidate of candidates) {
      const dirPath = path.join(projectPath, candidate);
      if (await fs.exists(dirPath)) {
        const stat = await fs.stat(dirPath);
        if (stat.isDirectory()) {
          return `./${candidate}`;
        }
      }
    }

    return './src';
  }
}

module.exports = { ProjectDetector };
