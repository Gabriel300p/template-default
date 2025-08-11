const fs = require("fs");
const path = require("path");

class ComponentDocsGenerator {
  constructor(project, config, openaiEnhancer = null) {
    this.project = project;
    this.config = config;
    this.openaiEnhancer = openaiEnhancer;
    this.components = [];
    this.hooks = [];
    this.utils = [];
  }

  async generate() {
    console.log(`🎨 Analisando componentes em: ${this.project.name}`);

    try {
      await this.scanComponents();
      await this.scanHooks();
      await this.scanUtils();
      await this.generateComponentDocumentation();
    } catch (error) {
      console.error(
        `Erro ao gerar documentação de componentes para ${this.project.name}:`,
        error.message
      );
    }
  }

  async scanComponents() {
    const componentFiles = this.findFiles(["**/*.vue", "**/*.tsx", "**/*.jsx"]);

    for (const file of componentFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const component = this.parseComponent(content, file);
        if (component) {
          this.components.push(component);
        }
      } catch (error) {
        console.warn(
          `Aviso: Não foi possível processar componente ${file}:`,
          error.message
        );
      }
    }
  }

  async scanHooks() {
    const hookFiles = this.findFiles([
      "**/use*.ts",
      "**/use*.js",
      "**/hooks/*.ts",
      "**/hooks/*.js",
    ]);

    for (const file of hookFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const hook = this.parseHook(content, file);
        if (hook) {
          this.hooks.push(hook);
        }
      } catch (error) {
        console.warn(
          `Aviso: Não foi possível processar hook ${file}:`,
          error.message
        );
      }
    }
  }

  async scanUtils() {
    const utilFiles = this.findFiles([
      "**/utils/*.ts",
      "**/utils/*.js",
      "**/helpers/*.ts",
      "**/helpers/*.js",
    ]);

    for (const file of utilFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const util = this.parseUtil(content, file);
        if (util) {
          this.utils.push(util);
        }
      } catch (error) {
        console.warn(
          `Aviso: Não foi possível processar utilitário ${file}:`,
          error.message
        );
      }
    }
  }

  parseComponent(content, filePath) {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);

    const component = {
      name: this.extractComponentName(content, fileName),
      file: fileName,
      path: filePath,
      type: this.detectComponentType(fileExt, content),
      props: [],
      events: [],
      slots: [],
      methods: [],
      computed: [],
      imports: [],
      exports: [],
    };

    // Parse baseado na extensão
    if (fileExt === ".vue") {
      this.parseVueComponent(content, component);
    } else if (fileExt === ".tsx" || fileExt === ".jsx") {
      this.parseReactComponent(content, component);
    }

    return component;
  }

  parseVueComponent(content, component) {
    // Extrair script section
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const scriptContent = scriptMatch[1];

      // Props
      const propsMatch = scriptContent.match(/props:\s*{([^}]+)}/s);
      if (propsMatch) {
        component.props = this.extractVueProps(propsMatch[1]);
      }

      // Methods
      const methodsMatch = scriptContent.match(/methods:\s*{([^}]+)}/s);
      if (methodsMatch) {
        component.methods = this.extractVueMethods(methodsMatch[1]);
      }

      // Computed
      const computedMatch = scriptContent.match(/computed:\s*{([^}]+)}/s);
      if (computedMatch) {
        component.computed = this.extractVueComputed(computedMatch[1]);
      }
    }

    // Extrair template section
    const templateMatch = content.match(
      /<template[^>]*>([\s\S]*?)<\/template>/
    );
    if (templateMatch) {
      const templateContent = templateMatch[1];

      // Events (buscar por @event ou v-on:event)
      const eventRegex = /@(\w+)|v-on:(\w+)/g;
      let match;
      while ((match = eventRegex.exec(templateContent)) !== null) {
        const eventName = match[1] || match[2];
        if (!component.events.find((e) => e.name === eventName)) {
          component.events.push({ name: eventName, description: "" });
        }
      }

      // Slots
      const slotRegex = /<slot\s+name="([^"]+)"/g;
      while ((match = slotRegex.exec(templateContent)) !== null) {
        component.slots.push({ name: match[1], description: "" });
      }
    }

    // Imports
    component.imports = this.extractImports(content);
  }

  parseReactComponent(content, component) {
    // Buscar interface de props
    const propsInterfaceMatch = content.match(
      /interface\s+(\w+Props?)\s*{([^}]+)}/s
    );
    if (propsInterfaceMatch) {
      component.props = this.extractReactProps(propsInterfaceMatch[2]);
    }

    // Buscar function component ou class component
    const functionMatch = content.match(
      /(?:export\s+(?:default\s+)?)?(?:const|function)\s+(\w+)\s*[=:]?\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*{)/
    );
    if (functionMatch && !component.name) {
      component.name = functionMatch[1];
    }

    // Buscar hooks usados
    const hooksRegex = /use(\w+)\s*\(/g;
    let match;
    while ((match = hooksRegex.exec(content)) !== null) {
      component.methods.push({
        name: `use${match[1]}`,
        type: "hook",
        description: "",
      });
    }

    // Imports
    component.imports = this.extractImports(content);
  }

  parseHook(content, filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));

    const hook = {
      name: fileName,
      file: path.basename(filePath),
      path: filePath,
      parameters: [],
      returns: "",
      description: this.extractDescription(content),
      exports: [],
    };

    // Buscar function export
    const exportMatch = content.match(
      /export\s+(?:default\s+)?(?:const|function)\s+(\w+)\s*[=:]?\s*(?:\(([^)]*)\)|.*?)/
    );
    if (exportMatch) {
      hook.name = exportMatch[1];
      if (exportMatch[2]) {
        hook.parameters = this.extractFunctionParameters(exportMatch[2]);
      }
    }

    return hook;
  }

  parseUtil(content, filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));

    const util = {
      name: fileName,
      file: path.basename(filePath),
      path: filePath,
      functions: [],
      exports: [],
      description: this.extractDescription(content),
    };

    // Buscar todas as funções exportadas
    const exportRegex =
      /export\s+(?:const|function)\s+(\w+)\s*[=:]?\s*(?:\(([^)]*)\)|.*?)/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      util.functions.push({
        name: match[1],
        parameters: match[2] ? this.extractFunctionParameters(match[2]) : [],
        description: this.extractFunctionDescription(content, match[1]),
      });
    }

    return util.functions.length > 0 ? util : null;
  }

  extractComponentName(content, fileName) {
    // Tentar extrair do export default
    const exportMatch = content.match(/export\s+default\s+(?:class\s+)?(\w+)/);
    if (exportMatch) return exportMatch[1];

    // Usar nome do arquivo como fallback
    return path.basename(fileName, path.extname(fileName));
  }

  detectComponentType(fileExt, content) {
    if (fileExt === ".vue") return "Vue";
    if (content.includes("React")) return "React";
    if (content.includes("Component")) return "Class Component";
    return "Function Component";
  }

  extractVueProps(propsContent) {
    const props = [];
    const propRegex = /(\w+):\s*{([^}]+)}/g;
    let match;

    while ((match = propRegex.exec(propsContent)) !== null) {
      const propName = match[1];
      const propConfig = match[2];

      const typeMatch = propConfig.match(/type:\s*(\w+)/);
      const requiredMatch = propConfig.match(/required:\s*(true|false)/);
      const defaultMatch = propConfig.match(/default:\s*([^,]+)/);

      props.push({
        name: propName,
        type: typeMatch ? typeMatch[1] : "any",
        required: requiredMatch ? requiredMatch[1] === "true" : false,
        default: defaultMatch ? defaultMatch[1].trim() : undefined,
        description: "",
      });
    }

    return props;
  }

  extractVueMethods(methodsContent) {
    const methods = [];
    const methodRegex = /(\w+)\s*\([^)]*\)\s*{/g;
    let match;

    while ((match = methodRegex.exec(methodsContent)) !== null) {
      methods.push({
        name: match[1],
        type: "method",
        description: "",
      });
    }

    return methods;
  }

  extractVueComputed(computedContent) {
    const computed = [];
    const computedRegex = /(\w+)\s*\([^)]*\)\s*{/g;
    let match;

    while ((match = computedRegex.exec(computedContent)) !== null) {
      computed.push({
        name: match[1],
        type: "computed",
        description: "",
      });
    }

    return computed;
  }

  extractReactProps(propsContent) {
    const props = [];
    const propRegex = /(\w+)\??\s*:\s*([^;,]+)/g;
    let match;

    while ((match = propRegex.exec(propsContent)) !== null) {
      props.push({
        name: match[1],
        type: match[2].trim(),
        required: !match[0].includes("?"),
        description: "",
      });
    }

    return props;
  }

  extractImports(content) {
    const imports = [];
    const importRegex =
      /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const namedImports = match[1]
        ? match[1].split(",").map((i) => i.trim())
        : [];
      const namespaceImport = match[2];
      const defaultImport = match[3];
      const source = match[4];

      imports.push({
        source,
        namedImports,
        namespaceImport,
        defaultImport,
        isExternal: !source.startsWith(".") && !source.startsWith("/"),
      });
    }

    return imports;
  }

  extractFunctionParameters(paramString) {
    if (!paramString || paramString.trim() === "") return [];

    return paramString.split(",").map((param) => {
      const cleaned = param.trim();
      const colonIndex = cleaned.indexOf(":");

      if (colonIndex > -1) {
        return {
          name: cleaned.substring(0, colonIndex).trim(),
          type: cleaned.substring(colonIndex + 1).trim(),
        };
      }

      return {
        name: cleaned,
        type: "any",
      };
    });
  }

  extractDescription(content) {
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("/**") || trimmed.startsWith("/*")) {
        return trimmed
          .replace(/^\/\*+\s*/, "")
          .replace(/\*+\/$/, "")
          .trim();
      }
      if (trimmed.startsWith("//")) {
        return trimmed.replace(/^\/\/\s*/, "").trim();
      }
    }
    return "";
  }

  extractFunctionDescription(content, functionName) {
    const functionIndex = content.indexOf(functionName);
    const beforeFunction = content.substring(0, functionIndex);
    const lines = beforeFunction.split("\n").reverse();

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) {
        return trimmed.replace(/^\/\/\s*/, "").replace(/^\*\s*/, "");
      }
      if (trimmed && !trimmed.startsWith("export")) break;
    }

    return "";
  }

  findFiles(patterns) {
    const files = [];

    patterns.forEach((pattern) => {
      try {
        this.walkDirectory(this.project.path, (file) => {
          if (this.matchesPattern(file, pattern)) {
            files.push(file);
          }
        });
      } catch (error) {
        console.warn(
          `Erro ao buscar arquivos com padrão ${pattern}:`,
          error.message
        );
      }
    });

    return files;
  }

  walkDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory() && !this.shouldSkipDirectory(item.name)) {
        this.walkDirectory(fullPath, callback);
      } else if (item.isFile()) {
        callback(fullPath);
      }
    }
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = [
      "node_modules",
      "dist",
      "build",
      "coverage",
      ".git",
      ".nuxt",
      ".next",
    ];
    return skipDirs.includes(dirName);
  }

  matchesPattern(file, pattern) {
    const regex = pattern
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\./g, "\\.");

    return new RegExp(regex).test(file.replace(/\\/g, "/"));
  }

  async generateComponentDocumentation() {
    const timestamp = new Date().toISOString();

    // Documentação para desenvolvedores
    await this.generateDevDocs(timestamp);

    // Documentação para IA
    await this.generateAIDocs(timestamp);

    // Documentação para export
    await this.generateExportDocs(timestamp);
  }

  async generateDevDocs(timestamp) {
    const devDir = path.join(
      this.project.path.replace(this.project.name, ""),
      this.config.output.dev
    );

    let content = `# Component Documentation - ${this.project.name}\n\n`;
    content += `**Generated:** ${timestamp}\n`;
    content += `**Project:** ${this.project.name}\n\n`;

    if (this.components.length > 0) {
      content += `## Components (${this.components.length})\n\n`;

      for (const component of this.components) {
        content += `### ${component.name}\n`;
        content += `**File:** \`${component.file}\`\n`;
        content += `**Type:** ${component.type}\n\n`;

        if (component.props.length > 0) {
          content += `#### Props\n`;
          for (const prop of component.props) {
            const required = prop.required ? " (required)" : " (optional)";
            content += `- \`${prop.name}\`: ${prop.type}${required}`;
            if (prop.default !== undefined) {
              content += ` - Default: ${prop.default}`;
            }
            content += "\n";
          }
          content += "\n";
        }

        if (component.events.length > 0) {
          content += `#### Events\n`;
          for (const event of component.events) {
            content += `- \`${event.name}\``;
            if (event.description) {
              content += ` - ${event.description}`;
            }
            content += "\n";
          }
          content += "\n";
        }

        if (component.methods.length > 0) {
          content += `#### Methods\n`;
          for (const method of component.methods) {
            content += `- \`${method.name}\` (${method.type})\n`;
          }
          content += "\n";
        }

        if (component.imports.length > 0) {
          content += `#### Dependencies\n`;
          const externalImports = component.imports.filter(
            (imp) => imp.isExternal
          );
          const internalImports = component.imports.filter(
            (imp) => !imp.isExternal
          );

          if (externalImports.length > 0) {
            content += `**External:**\n`;
            externalImports.forEach((imp) => {
              content += `- ${imp.source}\n`;
            });
          }

          if (internalImports.length > 0) {
            content += `**Internal:**\n`;
            internalImports.forEach((imp) => {
              content += `- ${imp.source}\n`;
            });
          }
          content += "\n";
        }
      }
    }

    if (this.hooks.length > 0) {
      content += `## Hooks (${this.hooks.length})\n\n`;

      for (const hook of this.hooks) {
        content += `### ${hook.name}\n`;
        content += `**File:** \`${hook.file}\`\n`;
        if (hook.description) {
          content += `${hook.description}\n`;
        }

        if (hook.parameters.length > 0) {
          content += `**Parameters:**\n`;
          for (const param of hook.parameters) {
            content += `- \`${param.name}\`: ${param.type}\n`;
          }
        }
        content += "\n";
      }
    }

    if (this.utils.length > 0) {
      content += `## Utilities (${this.utils.length})\n\n`;

      for (const util of this.utils) {
        content += `### ${util.name}\n`;
        content += `**File:** \`${util.file}\`\n`;
        if (util.description) {
          content += `${util.description}\n\n`;
        }

        for (const func of util.functions) {
          content += `#### ${func.name}\n`;
          if (func.description) {
            content += `${func.description}\n`;
          }

          if (func.parameters.length > 0) {
            content += `**Parameters:**\n`;
            for (const param of func.parameters) {
              content += `- \`${param.name}\`: ${param.type}\n`;
            }
          }
          content += "\n";
        }
      }
    }

    content += `\n---\n*Generated automatically by Documentation Generator*\n`;

    // Melhorar com OpenAI se disponível
    if (
      this.openaiEnhancer &&
      this.config.openai?.enhance?.componentDocumentation
    ) {
      console.log("🤖 Melhorando documentação de componentes com OpenAI...");
      const componentData = {
        components: this.components,
        hooks: this.hooks,
        utils: this.utils,
      };

      const enhanced = await this.openaiEnhancer.enhanceComponentDocumentation(
        content,
        componentData
      );
      content = enhanced || content;
    }

    fs.writeFileSync(
      path.join(devDir, `COMPONENTS_${this.project.name.toUpperCase()}.md`),
      content
    );
  }

  async generateAIDocs(timestamp) {
    const aiDir = path.join(
      this.project.path.replace(this.project.name, ""),
      this.config.output.ai
    );

    const aiData = {
      timestamp,
      project: this.project.name,
      type: "component-documentation",
      components: this.components,
      hooks: this.hooks,
      utils: this.utils,
      summary: {
        totalComponents: this.components.length,
        totalHooks: this.hooks.length,
        totalUtils: this.utils.length,
        componentTypes: [...new Set(this.components.map((c) => c.type))],
        mostUsedImports: this.getMostUsedImports(),
      },
    };

    fs.writeFileSync(
      path.join(aiDir, `components-${this.project.name}.json`),
      JSON.stringify(aiData, null, 2)
    );
  }

  getMostUsedImports() {
    const importCount = {};

    this.components.forEach((component) => {
      component.imports.forEach((imp) => {
        importCount[imp.source] = (importCount[imp.source] || 0) + 1;
      });
    });

    return Object.entries(importCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));
  }

  async generateExportDocs(timestamp) {
    const exportDir = path.join(
      this.project.path.replace(this.project.name, ""),
      this.config.output.export
    );

    let content = `# ${this.project.name} - Components\n\n`;

    if (this.components.length > 0) {
      content += `## Components Overview\n\n`;
      content += `Total components: ${this.components.length}\n\n`;

      // Lista de componentes
      content += `### Component List\n\n`;
      for (const component of this.components) {
        content += `#### ${component.name}\n`;
        content += `- **Type:** ${component.type}\n`;
        content += `- **File:** ${component.file}\n`;

        if (component.props.length > 0) {
          content += `- **Props:** ${component.props.map((p) => p.name).join(", ")}\n`;
        }

        content += "\n";
      }
    }

    if (this.hooks.length > 0) {
      content += `## Custom Hooks\n\n`;
      this.hooks.forEach((hook) => {
        content += `### ${hook.name}\n`;
        if (hook.description) {
          content += `${hook.description}\n`;
        }
        content += "\n";
      });
    }

    content += `\n*Last updated: ${new Date(timestamp).toLocaleString()}*\n`;

    fs.writeFileSync(
      path.join(exportDir, `${this.project.name}-components.md`),
      content
    );
  }
}

module.exports = ComponentDocsGenerator;
