const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ApiDocsGenerator {
  constructor(project, config, openaiEnhancer = null) {
    this.project = project;
    this.config = config;
    this.openaiEnhancer = openaiEnhancer;
    this.apiEndpoints = [];
    this.models = [];
    this.controllers = [];
  }

  async generate() {
    console.log(`🔍 Analisando APIs em: ${this.project.name}`);

    try {
      await this.scanControllers();
      await this.scanModels();
      await this.generateApiDocumentation();
    } catch (error) {
      console.error(
        `Erro ao gerar documentação de API para ${this.project.name}:`,
        error.message
      );
    }
  }

  async scanControllers() {
    const controllerFiles = this.findFiles([
      "**/*controller*.ts",
      "**/*controller*.js",
    ]);

    for (const file of controllerFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const controller = this.parseController(content, file);
        if (controller) {
          this.controllers.push(controller);
          this.apiEndpoints.push(...controller.endpoints);
        }
      } catch (error) {
        console.warn(
          `Aviso: Não foi possível processar ${file}:`,
          error.message
        );
      }
    }
  }

  async scanModels() {
    const modelFiles = this.findFiles([
      "**/*model*.ts",
      "**/*entity*.ts",
      "**/*dto*.ts",
    ]);

    for (const file of modelFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const model = this.parseModel(content, file);
        if (model) {
          this.models.push(model);
        }
      } catch (error) {
        console.warn(
          `Aviso: Não foi possível processar modelo ${file}:`,
          error.message
        );
      }
    }
  }

  parseController(content, filePath) {
    const fileName = path.basename(filePath);

    // Buscar classe do controller
    const classMatch = content.match(/class\s+(\w+Controller?)\s*{/);
    if (!classMatch) return null;

    const controllerName = classMatch[1];
    const controller = {
      name: controllerName,
      file: fileName,
      path: filePath,
      baseRoute: this.extractBaseRoute(content),
      endpoints: [],
    };

    // Buscar endpoints
    const methodRegex =
      /@(Get|Post|Put|Delete|Patch)\s*\(['"`]?([^'"`\)]*)?['"`]?\)\s*\n\s*(\w+)\s*\(/g;
    let match;

    while ((match = methodRegex.exec(content)) !== null) {
      const [fullMatch, method, route, functionName] = match;

      // Buscar parâmetros da função
      const funcStart = content.indexOf(fullMatch) + fullMatch.length;
      const funcContent = this.extractFunction(content, funcStart);

      controller.endpoints.push({
        method: method.toUpperCase(),
        route: this.buildFullRoute(controller.baseRoute, route || ""),
        function: functionName,
        parameters: this.extractParameters(funcContent),
        description: this.extractDescription(content, fullMatch),
        responses: this.extractResponses(funcContent),
      });
    }

    return controller.endpoints.length > 0 ? controller : null;
  }

  parseModel(content, filePath) {
    const fileName = path.basename(filePath);

    // Buscar classe/interface
    const classMatch = content.match(/(class|interface)\s+(\w+)\s*{/);
    if (!classMatch) return null;

    const modelName = classMatch[2];
    const model = {
      name: modelName,
      type: classMatch[1],
      file: fileName,
      path: filePath,
      properties: [],
    };

    // Buscar propriedades
    const propertyRegex = /(\w+):\s*([^;]+);/g;
    let match;

    while ((match = propertyRegex.exec(content)) !== null) {
      const [, propName, propType] = match;
      model.properties.push({
        name: propName,
        type: propType.trim(),
        required: !propType.includes("?"),
        description: this.extractPropertyDescription(content, propName),
      });
    }

    return model.properties.length > 0 ? model : null;
  }

  extractBaseRoute(content) {
    const controllerMatch = content.match(
      /@Controller\s*\(['"`]([^'"`]*?)['"`]\)/
    );
    return controllerMatch ? controllerMatch[1] : "";
  }

  buildFullRoute(baseRoute, route) {
    const base = baseRoute.startsWith("/") ? baseRoute : `/${baseRoute}`;
    const endpoint = route.startsWith("/") ? route : `/${route}`;
    return `${base}${endpoint}`.replace(/\/+/g, "/");
  }

  extractFunction(content, startPos) {
    let braceCount = 0;
    let i = startPos;

    // Encontrar início da função
    while (i < content.length && content[i] !== "{") i++;
    if (i >= content.length) return "";

    const start = i;
    braceCount = 1;
    i++;

    // Encontrar fim da função
    while (i < content.length && braceCount > 0) {
      if (content[i] === "{") braceCount++;
      if (content[i] === "}") braceCount--;
      i++;
    }

    return content.substring(start, i);
  }

  extractParameters(funcContent) {
    const paramMatch = funcContent.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];

    const params = paramMatch[1]
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    return params.map((param) => {
      const parts = param.split(":");
      return {
        name: parts[0]
          .trim()
          .replace("@Body() ", "")
          .replace("@Param() ", "")
          .replace("@Query() ", ""),
        type: parts[1] ? parts[1].trim() : "any",
        source: param.includes("@Body")
          ? "body"
          : param.includes("@Param")
            ? "param"
            : param.includes("@Query")
              ? "query"
              : "unknown",
      };
    });
  }

  extractDescription(content, matchText) {
    const matchIndex = content.indexOf(matchText);
    const beforeMatch = content.substring(0, matchIndex);
    const lines = beforeMatch.split("\n").reverse();

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) {
        return trimmed.replace(/^\/\/\s*/, "").replace(/^\*\s*/, "");
      }
      if (trimmed && !trimmed.startsWith("@")) break;
    }

    return "";
  }

  extractPropertyDescription(content, propName) {
    const propIndex = content.indexOf(`${propName}:`);
    const beforeProp = content.substring(0, propIndex);
    const lines = beforeProp.split("\n").reverse();

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) {
        return trimmed.replace(/^\/\/\s*/, "").replace(/^\*\s*/, "");
      }
      if (trimmed && !trimmed.includes(propName)) break;
    }

    return "";
  }

  extractResponses(funcContent) {
    // Buscar por tipos de retorno
    const returnMatch = funcContent.match(/return\s+([^;]+);/g);
    return returnMatch
      ? returnMatch.map((r) => r.replace("return ", "").replace(";", "").trim())
      : [];
  }

  findFiles(patterns) {
    const files = [];

    patterns.forEach((pattern) => {
      try {
        // Implementação simples de busca de arquivos
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
    const skipDirs = ["node_modules", "dist", "build", "coverage", ".git"];
    return skipDirs.includes(dirName);
  }

  matchesPattern(file, pattern) {
    // Implementação simples de matching de padrão
    const regex = pattern
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\./g, "\\.");

    return new RegExp(regex).test(file.replace(/\\/g, "/"));
  }

  async generateApiDocumentation() {
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

    let content = `# API Documentation - ${this.project.name}\n\n`;
    content += `**Generated:** ${timestamp}\n`;
    content += `**Project:** ${this.project.name}\n\n`;

    if (this.controllers.length > 0) {
      content += `## Controllers (${this.controllers.length})\n\n`;

      for (const controller of this.controllers) {
        content += `### ${controller.name}\n`;
        content += `**File:** \`${controller.file}\`\n`;
        content += `**Base Route:** \`${controller.baseRoute}\`\n\n`;

        if (controller.endpoints.length > 0) {
          content += `#### Endpoints\n\n`;

          for (const endpoint of controller.endpoints) {
            content += `##### ${endpoint.method} ${endpoint.route}\n`;
            if (endpoint.description) {
              content += `${endpoint.description}\n\n`;
            }

            if (endpoint.parameters.length > 0) {
              content += `**Parameters:**\n`;
              for (const param of endpoint.parameters) {
                content += `- \`${param.name}\` (${param.type}) - ${param.source}\n`;
              }
              content += "\n";
            }

            content += `**Function:** \`${endpoint.function}\`\n\n`;
          }
        }
      }
    }

    if (this.models.length > 0) {
      content += `## Models (${this.models.length})\n\n`;

      for (const model of this.models) {
        content += `### ${model.name}\n`;
        content += `**Type:** ${model.type}\n`;
        content += `**File:** \`${model.file}\`\n\n`;

        if (model.properties.length > 0) {
          content += `**Properties:**\n`;
          for (const prop of model.properties) {
            const required = prop.required ? " (required)" : " (optional)";
            content += `- \`${prop.name}\`: ${prop.type}${required}`;
            if (prop.description) {
              content += ` - ${prop.description}`;
            }
            content += "\n";
          }
          content += "\n";
        }
      }
    }

    content += `\n---\n*Generated automatically by Documentation Generator*\n`;

    // Melhorar com OpenAI se disponível
    if (this.openaiEnhancer && this.config.openai?.enhance?.apiDocumentation) {
      console.log("🤖 Melhorando documentação de API com OpenAI...");
      const apiData = {
        controllers: this.controllers,
        models: this.models,
        endpoints: this.apiEndpoints,
      };

      const enhanced = await this.openaiEnhancer.enhanceAPIDocumentation(
        content,
        apiData
      );
      content = enhanced || content;
    }

    fs.writeFileSync(
      path.join(devDir, `API_${this.project.name.toUpperCase()}.md`),
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
      type: "api-documentation",
      controllers: this.controllers,
      models: this.models,
      endpoints: this.apiEndpoints,
      summary: {
        totalControllers: this.controllers.length,
        totalEndpoints: this.apiEndpoints.length,
        totalModels: this.models.length,
        httpMethods: [...new Set(this.apiEndpoints.map((e) => e.method))],
        routes: this.apiEndpoints.map((e) => e.route),
      },
    };

    fs.writeFileSync(
      path.join(aiDir, `api-${this.project.name}.json`),
      JSON.stringify(aiData, null, 2)
    );
  }

  async generateExportDocs(timestamp) {
    const exportDir = path.join(
      this.project.path.replace(this.project.name, ""),
      this.config.output.export
    );

    let content = `# ${this.project.name} - API Reference\n\n`;

    if (this.apiEndpoints.length > 0) {
      // Agrupar por método HTTP
      const methodGroups = this.apiEndpoints.reduce((acc, endpoint) => {
        if (!acc[endpoint.method]) acc[endpoint.method] = [];
        acc[endpoint.method].push(endpoint);
        return acc;
      }, {});

      for (const [method, endpoints] of Object.entries(methodGroups)) {
        content += `## ${method} Endpoints\n\n`;

        for (const endpoint of endpoints) {
          content += `### ${endpoint.route}\n`;
          if (endpoint.description) {
            content += `${endpoint.description}\n\n`;
          }

          if (endpoint.parameters.length > 0) {
            content += `**Parameters:**\n`;
            endpoint.parameters.forEach((param) => {
              content += `- ${param.name} (${param.type})\n`;
            });
            content += "\n";
          }
        }
      }
    }

    content += `\n*Last updated: ${new Date(timestamp).toLocaleString()}*\n`;

    fs.writeFileSync(
      path.join(exportDir, `${this.project.name}-api.md`),
      content
    );
  }
}

module.exports = ApiDocsGenerator;
