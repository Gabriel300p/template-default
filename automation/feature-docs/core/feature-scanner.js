/**
 * Feature Scanner
 * Escaneia e analisa features do frontend
 */

const fs = require('fs');
const path = require('path');
const ComponentAnalyzer = require('../analyzers/component-analyzer');
const UIElementDetector = require('../analyzers/ui-element-detector');

class FeatureScanner {
  constructor(config) {
    this.config = config;
    this.componentAnalyzer = new ComponentAnalyzer();
    this.uiDetector = new UIElementDetector();
  }

  async scanFeatures(featuresPath, changedFiles = null) {
    if (!fs.existsSync(featuresPath)) {
      console.log(`📂 Diretório não encontrado: ${featuresPath}`);
      return [];
    }

    const featureDirs = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const features = [];

    for (const featureDir of featureDirs) {
      const featurePath = path.join(featuresPath, featureDir);
      
      // Verificar se feature foi alterada (se análise incremental ativa)
      if (changedFiles && !this.featureHasChanges(featurePath, changedFiles)) {
        continue;
      }

      const feature = await this.analyzeFeature(featureDir, featurePath);
      if (feature && feature.components.length > 0) {
        features.push(feature);
      }
    }

    return features.sort((a, b) => a.name.localeCompare(b.name));
  }

  featureHasChanges(featurePath, changedFiles) {
    // Normalizar caminhos para comparação
    const normalizedFeaturePath = featurePath.replace(/\\/g, '/').toLowerCase();
    
    return changedFiles.some(file => {
      const normalizedFile = file.replace(/\\/g, '/').toLowerCase();
      // Verificar se o arquivo está dentro da feature (caminhos absolutos ou relativos)
      return normalizedFile.includes(normalizedFeaturePath.split('/').pop()) ||
             normalizedFile.includes(normalizedFeaturePath) ||
             normalizedFeaturePath.includes(normalizedFile);
    });
  }

  async analyzeFeature(featureName, featurePath) {
    console.log(`   🔍 Analisando: ${featureName}`);

    const feature = {
      name: featureName,
      path: featurePath,
      components: [],
      hooks: [],
      services: [],
      types: [],
      assets: [],
      tests: [],
      metadata: {
        totalFiles: 0,
        lastModified: null,
        complexity: 'low'
      }
    };

    // Escanear recursivamente
    await this.scanFeatureDirectory(featurePath, feature);

    // Análise adicional
    await this.analyzeFeatureStructure(feature);
    await this.detectUIPatterns(feature);

    return feature;
  }

  async scanFeatureDirectory(dirPath, feature, relativePath = '') {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const itemRelativePath = path.join(relativePath, item.name);

      feature.metadata.totalFiles++;

      if (item.isDirectory()) {
        // Diretorios especiais
        if (item.name === 'components') {
          await this.scanComponents(fullPath, feature);
        } else if (item.name === 'hooks') {
          await this.scanHooks(fullPath, feature);
        } else if (item.name === 'services') {
          await this.scanServices(fullPath, feature);
        } else if (item.name === 'types') {
          await this.scanTypes(fullPath, feature);
        } else if (item.name === '__tests__' || item.name === 'tests') {
          await this.scanTests(fullPath, feature);
        } else {
          // Continuar recursão para outros diretórios
          await this.scanFeatureDirectory(fullPath, feature, itemRelativePath);
        }
      } else if (item.isFile()) {
        await this.analyzeFile(fullPath, itemRelativePath, feature);
      }
    }
  }

  async scanComponents(componentsPath, feature) {
    const componentFiles = this.findFiles(componentsPath, ['.tsx', '.jsx', '.vue']);
    
    for (const file of componentFiles) {
      const component = await this.componentAnalyzer.analyzeComponent(file.fullPath);
      if (component) {
        feature.components.push({
          ...component,
          relativePath: file.relativePath,
          uiElements: await this.uiDetector.detectElements(file.fullPath, component)
        });
      }
    }
  }

  async scanHooks(hooksPath, feature) {
    const hookFiles = this.findFiles(hooksPath, ['.ts', '.tsx', '.js']);
    
    for (const file of hookFiles) {
      if (file.name.startsWith('use') || file.name.includes('hook')) {
        const hookAnalysis = await this.componentAnalyzer.analyzeHook(file.fullPath);
        if (hookAnalysis) {
          feature.hooks.push({
            ...hookAnalysis,
            relativePath: file.relativePath
          });
        }
      }
    }
  }

  async scanServices(servicesPath, feature) {
    const serviceFiles = this.findFiles(servicesPath, ['.ts', '.js']);
    
    for (const file of serviceFiles) {
      const serviceAnalysis = await this.componentAnalyzer.analyzeService(file.fullPath);
      if (serviceAnalysis) {
        feature.services.push({
          ...serviceAnalysis,
          relativePath: file.relativePath
        });
      }
    }
  }

  async scanTypes(typesPath, feature) {
    const typeFiles = this.findFiles(typesPath, ['.ts', '.d.ts']);
    
    for (const file of typeFiles) {
      const typeAnalysis = await this.componentAnalyzer.analyzeTypes(file.fullPath);
      if (typeAnalysis) {
        feature.types.push({
          ...typeAnalysis,
          relativePath: file.relativePath
        });
      }
    }
  }

  async scanTests(testsPath, feature) {
    const testFiles = this.findFiles(testsPath, ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']);
    
    for (const file of testFiles) {
      feature.tests.push({
        name: file.name,
        path: file.fullPath,
        relativePath: file.relativePath,
        type: this.getTestType(file.name)
      });
    }
  }

  async analyzeFile(filePath, relativePath, feature) {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);

    // Arquivos principais da feature
    if (basename === 'index' && ['.ts', '.tsx', '.js'].includes(ext)) {
      feature.entryPoint = { path: filePath, relativePath };
    }

    // Assets (imagens, estilos, etc.)
    if (['.png', '.jpg', '.svg', '.css', '.scss', '.module.css'].includes(ext)) {
      feature.assets.push({
        name: basename + ext,
        path: filePath,
        relativePath,
        type: this.getAssetType(ext)
      });
    }

    // Arquivos de configuração específicos da feature
    if (basename.includes('config') || basename.includes('constant')) {
      const configAnalysis = await this.componentAnalyzer.analyzeConfig(filePath);
      if (configAnalysis) {
        feature.config = {
          ...configAnalysis,
          relativePath
        };
      }
    }
  }

  findFiles(dirPath, extensions) {
    const files = [];
    
    const scanDir = (currentPath, relativePath = '') => {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        const itemRelativePath = path.join(relativePath, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.')) {
          scanDir(fullPath, itemRelativePath);
        } else if (item.isFile()) {
          const ext = path.extname(item.name);
          if (extensions.some(e => ext.endsWith(e) || item.name.endsWith(e))) {
            files.push({
              name: path.basename(item.name, ext),
              fullPath,
              relativePath: itemRelativePath,
              extension: ext
            });
          }
        }
      }
    };

    if (fs.existsSync(dirPath)) {
      scanDir(dirPath);
    }

    return files;
  }

  async analyzeFeatureStructure(feature) {
    // Determinar complexidade baseada em quantidade de componentes
    if (feature.components.length > 10) {
      feature.metadata.complexity = 'high';
    } else if (feature.components.length > 5) {
      feature.metadata.complexity = 'medium';
    }

    // Detectar padrões arquiteturais
    feature.metadata.patterns = [];

    if (feature.hooks.length > 0) {
      feature.metadata.patterns.push('Custom Hooks');
    }

    if (feature.services.length > 0) {
      feature.metadata.patterns.push('Service Layer');
    }

    if (feature.types.length > 0) {
      feature.metadata.patterns.push('TypeScript');
    }

    if (feature.tests.length > 0) {
      feature.metadata.patterns.push('Testing');
    }

    // Detectar se é uma feature CRUD
    const crudIndicators = ['create', 'edit', 'list', 'view', 'delete'];
    const hasMultipleCrud = feature.components.filter(c => 
      crudIndicators.some(indicator => 
        c.name.toLowerCase().includes(indicator)
      )
    ).length >= 2;

    if (hasMultipleCrud) {
      feature.metadata.patterns.push('CRUD Operations');
    }
  }

  async detectUIPatterns(feature) {
    // Detectar elementos UI comuns em todos os componentes
    const allUIElements = feature.components.flatMap(c => c.uiElements || []);
    
    const elementCounts = {};
    allUIElements.forEach(element => {
      elementCounts[element.type] = (elementCounts[element.type] || 0) + 1;
    });

    // Padrões detectados baseados em elementos UI
    feature.metadata.uiPatterns = [];

    if (elementCounts.filter >= 2) {
      feature.metadata.uiPatterns.push('Data Filtering');
    }

    if (elementCounts.table >= 1) {
      feature.metadata.uiPatterns.push('Data Tables');
    }

    if (elementCounts.form >= 2) {
      feature.metadata.uiPatterns.push('Form Management');
    }

    if (elementCounts.modal || elementCounts.dialog) {
      feature.metadata.uiPatterns.push('Modal Dialogs');
    }

    if (elementCounts.button >= 5) {
      feature.metadata.uiPatterns.push('Action-Heavy Interface');
    }
  }

  getTestType(filename) {
    if (filename.includes('.unit.')) return 'unit';
    if (filename.includes('.integration.')) return 'integration';
    if (filename.includes('.e2e.')) return 'e2e';
    return 'unit'; // default
  }

  getAssetType(extension) {
    const types = {
      '.png': 'image',
      '.jpg': 'image', 
      '.jpeg': 'image',
      '.svg': 'icon',
      '.css': 'styles',
      '.scss': 'styles',
      '.module.css': 'styles'
    };
    return types[extension] || 'asset';
  }
}

module.exports = FeatureScanner;
