/**
 * Component Analyzer
 * Analisa componentes React/Vue em profundidade
 */

const fs = require('fs');
const path = require('path');

class ComponentAnalyzer {
  constructor() {
    this.supportedExtensions = ['.tsx', '.jsx', '.vue', '.ts', '.js'];
  }

  async analyzeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      const extension = path.extname(filePath);

      if (extension === '.vue') {
        return this.analyzeVueComponent(content, filename, filePath);
      } else {
        return this.analyzeReactComponent(content, filename, filePath);
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao analisar componente ${filePath}: ${error.message}`);
      return null;
    }
  }

  analyzeReactComponent(content, filename, filePath) {
    const component = {
      name: this.extractComponentName(filename, content),
      filename,
      filePath,
      type: 'react',
      props: this.extractProps(content),
      hooks: this.extractHooks(content),
      methods: this.extractMethods(content),
      exports: this.extractExports(content),
      imports: this.extractImports(content),
      jsx: this.extractJSXStructure(content),
      comments: this.extractComments(content),
      complexity: this.calculateComplexity(content),
      metadata: {
        isDefaultExport: content.includes('export default'),
        isNamedExport: /export\s+(?:const|function|class)\s+\w+/.test(content),
        hasTests: this.hasTests(filePath),
        size: content.length,
        lines: content.split('\n').length
      }
    };

    // Análise específica para componentes funcionais vs classe
    if (content.includes('React.Component') || content.includes('Component')) {
      component.componentType = 'class';
      // Só chama extractLifecycleMethods se método existir
      if (typeof this.extractLifecycleMethods === 'function') {
        component.lifecycle = this.extractLifecycleMethods(content);
      } else {
        component.lifecycle = [];
      }
    } else if (content.includes('function') || content.includes('=>')) {
      component.componentType = 'functional';
      // Só chama extractCustomHooks se método existir
      if (typeof this.extractCustomHooks === 'function') {
        component.customHooks = this.extractCustomHooks(content);
      } else {
        component.customHooks = [];
      }
    }

    return component;
  }

  analyzeVueComponent(content, filename, filePath) {
    const component = {
      name: this.extractComponentName(filename, content),
      filename,
      filePath,
      type: 'vue',
      props: this.extractVueProps(content),
      data: this.extractVueData(content),
      methods: this.extractVueMethods(content),
      computed: this.extractVueComputed(content),
      watchers: this.extractVueWatchers(content),
      lifecycle: this.extractVueLifecycle(content),
      template: this.extractVueTemplate(content),
      style: this.extractVueStyle(content),
      script: this.extractVueScript(content),
      comments: this.extractComments(content),
      complexity: this.calculateComplexity(content),
      metadata: {
        version: this.detectVueVersion(content),
        composition: content.includes('setup()') || content.includes('<script setup>'),
        hasTests: this.hasTests(filePath),
        size: content.length,
        lines: content.split('\n').length
      }
    };

    return component;
  }

  extractComponentName(filename, content) {
    // Tentar extrair do nome do arquivo primeiro
    const baseName = path.basename(filename, path.extname(filename));
    if (baseName !== 'index') {
      return baseName;
    }

    // Tentar extrair do código
    const patterns = [
      /(?:export\s+default\s+(?:function\s+)?|const\s+)(\w+)/,
      /function\s+(\w+)\s*\(/,
      /class\s+(\w+)\s+extends/,
      /name:\s*['"`](\w+)['"`]/
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1] !== 'Component') {
        return match[1];
      }
    }

    return baseName;
  }

  extractProps(content) {
    const props = [];

    // Props via interface/type
    const interfaceMatch = content.match(/interface\s+\w*Props\s*{([^}]+)}/s);
    if (interfaceMatch) {
      const propsContent = interfaceMatch[1];
      const propLines = propsContent.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('*'));

      propLines.forEach(line => {
        const match = line.match(/(\w+)(\??):\s*([^;]+)/);
        if (match) {
          props.push({
            name: match[1],
            type: match[3].trim(),
            optional: match[2] === '?',
            description: this.extractPropDescription(content, match[1])
          });
        }
      });
    }

    // Props via destructuring
    const destructuringMatch = content.match(/\{\s*([^}]+)\s*\}[\s:]*=[\s:]*props/);
    if (destructuringMatch) {
      const destructuredProps = destructuringMatch[1].split(',');
      destructuredProps.forEach(prop => {
        const cleanProp = prop.trim();
        if (cleanProp && !props.find(p => p.name === cleanProp)) {
          props.push({
            name: cleanProp,
            type: 'unknown',
            optional: false,
            description: ''
          });
        }
      });
    }

    return props;
  }

  extractPropDescription(content, propName) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(propName + ':') || lines[i].includes(propName + '?:')) {
        // Procurar comentário na linha anterior
        if (i > 0 && lines[i - 1].trim().startsWith('//')) {
          return lines[i - 1].replace(/\/\/\s*/, '').trim();
        }
        // Ou comentário JSDoc acima
        for (let j = i - 1; j >= 0; j--) {
          const line = lines[j].trim();
          if (line.startsWith('*') && !line.startsWith('*/')) {
            return line.replace(/\*\s*/, '').trim();
          }
          if (line.includes('/**')) break;
          if (line && !line.startsWith('*') && !line.startsWith('//')) break;
        }
      }
    }
    return '';
  }

  extractHooks(content) {
    const hooks = [];
    const hookPatterns = [
      /use\w+\(/g,
      /React\.use\w+\(/g
    ];

    hookPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const hookName = match.replace(/[()]/g, '');
          if (!hooks.includes(hookName)) {
            hooks.push(hookName);
          }
        });
      }
    });

    return hooks;
  }

  extractMethods(content) {
    const methods = [];
    
    // Funções arrow
    const arrowFunctions = content.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g);
    if (arrowFunctions) {
      arrowFunctions.forEach(func => {
        const match = func.match(/const\s+(\w+)/);
        if (match) {
          methods.push({
            name: match[1],
            type: 'arrow',
            async: func.includes('async')
          });
        }
      });
    }

    // Funções declaradas
    const declaredFunctions = content.match(/function\s+(\w+)\s*\([^)]*\)/g);
    if (declaredFunctions) {
      declaredFunctions.forEach(func => {
        const match = func.match(/function\s+(\w+)/);
        if (match) {
          methods.push({
            name: match[1],
            type: 'function',
            async: func.includes('async')
          });
        }
      });
    }

    return methods;
  }

  extractJSXStructure(content) {
    // Extrair estrutura JSX principal
    const returnMatch = content.match(/return\s*\(?\s*<([^>]+)>/);
    if (returnMatch) {
      return {
        rootElement: returnMatch[1].split(' ')[0],
        hasConditionalRendering: content.includes('&&') || content.includes('?'),
        hasMapping: content.includes('.map('),
        hasFragments: content.includes('<>') || content.includes('Fragment')
      };
    }

    return null;
  }

  extractComments(content) {
    const comments = [];
    
    // JSDoc comments
    const jsdocPattern = /\/\*\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g;
    let match;
    while ((match = jsdocPattern.exec(content)) !== null) {
      comments.push({
        type: 'jsdoc',
        content: match[0].replace(/\/\*\*|\*\//g, '').replace(/\n\s*\*/g, '\n').trim()
      });
    }

    // Line comments
    const lineComments = content.match(/\/\/.*$/gm);
    if (lineComments) {
      lineComments.forEach(comment => {
        comments.push({
          type: 'line',
          content: comment.replace(/\/\/\s*/, '').trim()
        });
      });
    }

    return comments;
  }

  calculateComplexity(content) {
    let complexity = 0;
    
    // Estruturas condicionais
    complexity += (content.match(/if\s*\(/g) || []).length;
    complexity += (content.match(/\?\s*[^:]*:/g) || []).length;
    complexity += (content.match(/switch\s*\(/g) || []).length;
    
    // Loops
    complexity += (content.match(/for\s*\(/g) || []).length;
    complexity += (content.match(/while\s*\(/g) || []).length;
    complexity += (content.match(/\.map\(/g) || []).length;
    complexity += (content.match(/\.filter\(/g) || []).length;
    
    // Hooks e effects
    complexity += (content.match(/useEffect\(/g) || []).length;
    complexity += (content.match(/useState\(/g) || []).length;
    
    if (complexity < 5) return 'low';
    if (complexity < 15) return 'medium';
    return 'high';
  }

  extractImports(content) {
    const imports = [];
    const importPattern = /import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))*\s+from\s+)?['"](.*?)['"];?/g;
    
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({
        source: match[1],
        isRelative: match[1].startsWith('./') || match[1].startsWith('../'),
        isNodeModule: !match[1].startsWith('./')
      });
    }

    return imports;
  }

  extractExports(content) {
    const exports = [];
    
    // Default export
    if (content.includes('export default')) {
      exports.push({ type: 'default', name: 'default' });
    }

    // Named exports
    const namedExports = content.match(/export\s+(?:const|function|class)\s+(\w+)/g);
    if (namedExports) {
      namedExports.forEach(exp => {
        const match = exp.match(/export\s+(?:const|function|class)\s+(\w+)/);
        if (match) {
          exports.push({ type: 'named', name: match[1] });
        }
      });
    }

    return exports;
  }

  hasTests(componentPath) {
    const testPaths = [
      componentPath.replace(/\.(tsx|jsx|ts|js)$/, '.test.$1'),
      componentPath.replace(/\.(tsx|jsx|ts|js)$/, '.spec.$1'),
      path.join(path.dirname(componentPath), '__tests__', path.basename(componentPath))
    ];

    return testPaths.some(testPath => fs.existsSync(testPath));
  }

  // Métodos específicos para Vue (implementação básica)
  extractVueProps(content) {
    // Implementação básica para Vue props
    const propsMatch = content.match(/props:\s*\{([^}]+)\}/s);
    if (propsMatch) {
      // Parse Vue props...
      return [];
    }
    return [];
  }

  extractVueData(content) {
    const dataMatch = content.match(/data\(\)\s*\{([^}]+)\}/s);
    return dataMatch ? [] : [];
  }

  extractVueMethods(content) {
    const methodsMatch = content.match(/methods:\s*\{([^}]+)\}/s);
    return methodsMatch ? [] : [];
  }

  extractVueComputed(content) {
    const computedMatch = content.match(/computed:\s*\{([^}]+)\}/s);
    return computedMatch ? [] : [];
  }

  extractVueWatchers(content) {
    const watchMatch = content.match(/watch:\s*\{([^}]+)\}/s);
    return watchMatch ? [] : [];
  }

  extractVueLifecycle(content) {
    const lifecycle = [];
    const lifecycleHooks = ['created', 'mounted', 'updated', 'destroyed', 'beforeCreate', 'beforeMount', 'beforeUpdate', 'beforeDestroy'];
    
    lifecycleHooks.forEach(hook => {
      if (content.includes(`${hook}(`)) {
        lifecycle.push(hook);
      }
    });

    return lifecycle;
  }

  extractVueTemplate(content) {
    const templateMatch = content.match(/<template[^>]*>(.*?)<\/template>/s);
    return templateMatch ? templateMatch[1].trim() : null;
  }

  extractVueStyle(content) {
    const styleMatch = content.match(/<style[^>]*>(.*?)<\/style>/s);
    return styleMatch ? { content: styleMatch[1].trim() } : null;
  }

  extractVueScript(content) {
    const scriptMatch = content.match(/<script[^>]*>(.*?)<\/script>/s);
    return scriptMatch ? scriptMatch[1].trim() : null;
  }

  detectVueVersion(content) {
    if (content.includes('defineComponent') || content.includes('<script setup>')) {
      return 3;
    }
    return 2;
  }

  async analyzeHook(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const hookName = this.extractHookName(content, path.basename(filePath));
      
      return {
        name: hookName,
        filePath,
        parameters: this.extractHookParameters(content),
        returns: this.extractHookReturns(content),
        dependencies: this.extractHookDependencies(content),
        description: this.extractHookDescription(content)
      };
    } catch (error) {
      return null;
    }
  }

  extractHookName(content, filename) {
    const match = content.match(/export\s+(?:default\s+)?function\s+(use\w+)/);
    if (match) return match[1];
    
    const constMatch = content.match(/const\s+(use\w+)\s*=/);
    if (constMatch) return constMatch[1];
    
    return filename.replace(/\.(ts|js)$/, '');
  }

  extractHookParameters(content) {
    const match = content.match(/function\s+use\w+\s*\(([^)]*)\)/);
    if (match && match[1]) {
      return match[1].split(',').map(param => param.trim());
    }
    return [];
  }

  extractHookReturns(content) {
    // Análise básica do que o hook retorna
    if (content.includes('return {')) {
      const returnMatch = content.match(/return\s*\{([^}]+)\}/s);
      if (returnMatch) {
        return returnMatch[1].split(',').map(item => item.trim().split(':')[0]);
      }
    }
    return [];
  }

  extractHookDependencies(content) {
    const deps = [];
    const imports = this.extractImports(content);
    
    imports.forEach(imp => {
      if (imp.source === 'react' || imp.source.startsWith('@')) {
        deps.push(imp.source);
      }
    });

    return deps;
  }

  extractHookDescription(content) {
    const lines = content.split('\n');
    const comments = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('/**')) break;
      if (trimmed.startsWith('*') && !trimmed.startsWith('*/')) {
        comments.push(trimmed.replace(/^\*\s*/, ''));
      }
      if (trimmed.startsWith('//')) {
        comments.push(trimmed.replace(/^\/\/\s*/, ''));
      }
    }

    return comments.join(' ').trim();
  }

  async analyzeService(filePath) {
    // Implementação para análise de services
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      return {
        name: path.basename(filePath, path.extname(filePath)),
        filePath,
        methods: this.extractMethods(content),
        exports: this.extractExports(content),
        imports: this.extractImports(content)
      };
    } catch (error) {
      return null;
    }
  }

  async analyzeTypes(filePath) {
    // Implementação para análise de types
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      return {
        name: path.basename(filePath, path.extname(filePath)),
        filePath,
        interfaces: this.extractInterfaces(content),
        types: this.extractTypeAliases(content),
        enums: this.extractEnums(content)
      };
    } catch (error) {
      return null;
    }
  }

  extractInterfaces(content) {
    const interfaces = [];
    const interfacePattern = /interface\s+(\w+)\s*{([^}]+)}/gs;
    let match;

    while ((match = interfacePattern.exec(content)) !== null) {
      interfaces.push({
        name: match[1],
        properties: match[2].trim()
      });
    }

    return interfaces;
  }

  extractTypeAliases(content) {
    const types = [];
    const typePattern = /type\s+(\w+)\s*=\s*([^;]+);/g;
    let match;

    while ((match = typePattern.exec(content)) !== null) {
      types.push({
        name: match[1],
        definition: match[2].trim()
      });
    }

    return types;
  }

  extractEnums(content) {
    const enums = [];
    const enumPattern = /enum\s+(\w+)\s*{([^}]+)}/gs;
    let match;

    while ((match = enumPattern.exec(content)) !== null) {
      enums.push({
        name: match[1],
        values: match[2].trim()
      });
    }

    return enums;
  }

  async analyzeConfig(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      return {
        name: path.basename(filePath, path.extname(filePath)),
        filePath,
        exports: this.extractExports(content),
        constants: this.extractConstants(content)
      };
    } catch (error) {
      return null;
    }
  }

  extractConstants(content) {
    const constants = [];
    const constPattern = /export\s+const\s+(\w+)\s*=\s*([^;]+);/g;
    let match;

    while ((match = constPattern.exec(content)) !== null) {
      constants.push({
        name: match[1],
        value: match[2].trim()
      });
    }

    return constants;
  }

  /**
   * Extrai métodos de ciclo de vida de componentes React de classe
   */
  extractLifecycleMethods(content) {
    const lifecycleMethods = [];
    const lifecyclePatterns = [
      'componentDidMount',
      'componentDidUpdate',
      'componentWillUnmount',
      'shouldComponentUpdate',
      'getSnapshotBeforeUpdate',
      'componentDidCatch',
      'getDerivedStateFromProps',
      'getDerivedStateFromError'
    ];

    for (const method of lifecyclePatterns) {
      const pattern = new RegExp(`(${method})\\s*\\([^)]*\\)\\s*{`, 'g');
      if (pattern.test(content)) {
        lifecycleMethods.push({
          name: method,
          type: 'lifecycle'
        });
      }
    }

    return lifecycleMethods;
  }

  /**
   * Extrai hooks customizados de componentes funcionais
   */
  extractCustomHooks(content) {
    const customHooks = [];
    
    // Padrão para hooks customizados (começam com 'use')
    const hookPattern = /const\s+(\w*use\w*)\s*=\s*\(/g;
    let match;

    while ((match = hookPattern.exec(content)) !== null) {
      const hookName = match[1];
      if (hookName.startsWith('use') && hookName !== 'useState' && hookName !== 'useEffect') {
        customHooks.push({
          name: hookName,
          type: 'custom-hook'
        });
      }
    }

    // Também procurar por chamadas de hooks customizados
    const callPattern = /(use[A-Z]\w*)\s*\(/g;
    while ((match = callPattern.exec(content)) !== null) {
      const hookName = match[1];
      
      // Verificar se não é um hook nativo
      const nativeHooks = ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue'];
      
      if (!nativeHooks.includes(hookName) && !customHooks.find(h => h.name === hookName)) {
        customHooks.push({
          name: hookName,
          type: 'custom-hook-call'
        });
      }
    }

    return customHooks;
  }
}

module.exports = ComponentAnalyzer;
