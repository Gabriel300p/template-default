const fs = require("fs");
const path = require("path");

class ArchitectureGenerator {
  constructor(project, config, openaiEnhancer = null) {
    this.project = project;
    this.config = config;
    this.openaiEnhancer = openaiEnhancer;
    this.architecture = {
      folders: {},
      dependencies: [],
      patterns: [],
      technologies: [],
    };
  }

  async generate() {
    console.log(`🏗️ Analisando arquitetura de: ${this.project.name}`);

    try {
      await this.analyzeStructure();
      await this.analyzeDependencies();
      await this.detectPatterns();
      await this.generateArchitectureDocumentation();
    } catch (error) {
      console.error(
        `Erro ao gerar documentação de arquitetura para ${this.project.name}:`,
        error.message
      );
    }
  }

  async analyzeStructure() {
    this.architecture.folders = this.buildFolderTree(this.project.path);
    this.architecture.technologies = this.detectTechnologies();
  }

  buildFolderTree(dirPath, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth || !fs.existsSync(dirPath)) {
      return {};
    }

    const tree = {};

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        if (this.shouldSkipItem(item.name)) continue;

        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          const subTree = this.buildFolderTree(
            fullPath,
            maxDepth,
            currentDepth + 1
          );
          tree[item.name] = {
            type: "directory",
            children: subTree,
            fileCount: this.countFiles(fullPath),
            purpose: this.inferFolderPurpose(item.name, fullPath),
          };
        } else if (item.isFile() && this.isRelevantFile(item.name)) {
          tree[item.name] = {
            type: "file",
            extension: path.extname(item.name),
            size: fs.statSync(fullPath).size,
            purpose: this.inferFilePurpose(item.name),
          };
        }
      }
    } catch (error) {
      console.warn(`Erro ao ler diretório ${dirPath}:`, error.message);
    }

    return tree;
  }

  shouldSkipItem(name) {
    const skipItems = [
      "node_modules",
      ".git",
      "dist",
      "build",
      "coverage",
      ".nuxt",
      ".next",
      ".DS_Store",
      "Thumbs.db",
      "*.log",
    ];

    return skipItems.some((skip) => {
      if (skip.includes("*")) {
        const pattern = skip.replace("*", ".*");
        return new RegExp(pattern).test(name);
      }
      return name === skip;
    });
  }

  isRelevantFile(filename) {
    const relevantExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".vue",
      ".json",
      ".md",
      ".yml",
      ".yaml",
      ".env",
      ".config.js",
      ".config.ts",
    ];

    const extension = path.extname(filename);
    return (
      relevantExtensions.includes(extension) ||
      filename.startsWith("package") ||
      filename.startsWith("tsconfig") ||
      filename.startsWith("README")
    );
  }

  countFiles(dirPath) {
    let count = 0;

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        if (this.shouldSkipItem(item.name)) continue;

        if (item.isFile()) {
          count++;
        } else if (item.isDirectory()) {
          count += this.countFiles(path.join(dirPath, item.name));
        }
      }
    } catch (error) {
      // Ignorar erros de acesso
    }

    return count;
  }

  inferFolderPurpose(folderName, folderPath) {
    const purposes = {
      src: "Source code",
      components: "UI Components",
      pages: "Application pages/routes",
      views: "Application views",
      layouts: "Layout components",
      composables: "Vue composables",
      hooks: "React hooks",
      utils: "Utility functions",
      helpers: "Helper functions",
      services: "API services",
      api: "API endpoints",
      models: "Data models",
      types: "TypeScript type definitions",
      interfaces: "TypeScript interfaces",
      styles: "Stylesheets",
      assets: "Static assets",
      public: "Public static files",
      tests: "Test files",
      test: "Test files",
      docs: "Documentation",
      config: "Configuration files",
      scripts: "Build/utility scripts",
      middleware: "Middleware functions",
      plugins: "Framework plugins",
      store: "State management",
      database: "Database related files",
    };

    const lowerName = folderName.toLowerCase();

    // Busca exata
    if (purposes[lowerName]) {
      return purposes[lowerName];
    }

    // Busca por substring
    for (const [key, purpose] of Object.entries(purposes)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return purpose;
      }
    }

    // Análise baseada no conteúdo
    return this.inferPurposeFromContent(folderPath);
  }

  inferFilePurpose(filename) {
    const purposes = {
      "package.json": "Project dependencies and configuration",
      "tsconfig.json": "TypeScript configuration",
      "vite.config": "Vite build configuration",
      "tailwind.config": "Tailwind CSS configuration",
      "jest.config": "Jest testing configuration",
      "docker-compose": "Docker services configuration",
      Dockerfile: "Docker container configuration",
      "README.md": "Project documentation",
      ".env": "Environment variables",
      index: "Entry point file",
    };

    const lowerName = filename.toLowerCase();

    for (const [key, purpose] of Object.entries(purposes)) {
      if (lowerName.includes(key)) {
        return purpose;
      }
    }

    const extension = path.extname(filename);
    const extensionPurposes = {
      ".js": "JavaScript file",
      ".ts": "TypeScript file",
      ".jsx": "React component",
      ".tsx": "React TypeScript component",
      ".vue": "Vue component",
      ".json": "Configuration/data file",
      ".md": "Documentation file",
      ".yml": "YAML configuration",
      ".yaml": "YAML configuration",
    };

    return extensionPurposes[extension] || "File";
  }

  inferPurposeFromContent(folderPath) {
    try {
      const items = fs.readdirSync(folderPath);

      // Análise baseada nos tipos de arquivo
      const extensions = items
        .map((item) => path.extname(item))
        .filter((ext) => ext);

      const extCounts = extensions.reduce((acc, ext) => {
        acc[ext] = (acc[ext] || 0) + 1;
        return acc;
      }, {});

      const mostCommon = Object.entries(extCounts).sort(
        ([, a], [, b]) => b - a
      )[0];

      if (mostCommon) {
        const [ext] = mostCommon;
        if (ext === ".vue") return "Vue components";
        if (ext === ".tsx" || ext === ".jsx") return "React components";
        if (ext === ".ts" || ext === ".js")
          return "JavaScript/TypeScript files";
        if (ext === ".md") return "Documentation";
        if (ext === ".json") return "Configuration files";
      }
    } catch (error) {
      // Ignorar erros
    }

    return "Mixed files";
  }

  async analyzeDependencies() {
    const packageJsonPath = path.join(this.project.path, "package.json");

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );

        const deps = {
          dependencies: packageJson.dependencies || {},
          devDependencies: packageJson.devDependencies || {},
          peerDependencies: packageJson.peerDependencies || {},
        };

        this.architecture.dependencies = this.categorizeDependencies(deps);
      } catch (error) {
        console.warn(`Erro ao analisar package.json:`, error.message);
      }
    }
  }

  categorizeDependencies(deps) {
    const categories = {
      framework: [],
      ui: [],
      state: [],
      routing: [],
      testing: [],
      build: [],
      utility: [],
      database: [],
      other: [],
    };

    const categoryPatterns = {
      framework: [
        "react",
        "vue",
        "angular",
        "nestjs",
        "express",
        "fastify",
        "next",
        "nuxt",
      ],
      ui: [
        "antd",
        "material",
        "chakra",
        "tailwind",
        "bootstrap",
        "styled-components",
      ],
      state: ["redux", "mobx", "zustand", "pinia", "vuex"],
      routing: ["router", "reach-router"],
      testing: ["jest", "vitest", "cypress", "playwright", "testing-library"],
      build: ["vite", "webpack", "rollup", "babel", "typescript", "esbuild"],
      utility: ["lodash", "ramda", "date-fns", "moment", "axios"],
      database: ["prisma", "mongoose", "sequelize", "typeorm"],
    };

    const allDeps = {
      ...deps.dependencies,
      ...deps.devDependencies,
      ...deps.peerDependencies,
    };

    for (const [depName, version] of Object.entries(allDeps)) {
      let categorized = false;

      for (const [category, patterns] of Object.entries(categoryPatterns)) {
        if (
          patterns.some((pattern) => depName.toLowerCase().includes(pattern))
        ) {
          categories[category].push({ name: depName, version });
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        categories.other.push({ name: depName, version });
      }
    }

    return categories;
  }

  detectTechnologies() {
    const technologies = [];
    const packageJsonPath = path.join(this.project.path, "package.json");

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        // Detectar tecnologias principais
        const techMap = {
          React: ["react"],
          "Vue.js": ["vue"],
          Angular: ["@angular/core"],
          NestJS: ["@nestjs/core"],
          Express: ["express"],
          TypeScript: ["typescript"],
          "Tailwind CSS": ["tailwindcss"],
          Vite: ["vite"],
          Jest: ["jest"],
          Prisma: ["prisma", "@prisma/client"],
          Docker: [], // Será detectado por arquivos
        };

        for (const [tech, patterns] of Object.entries(techMap)) {
          if (patterns.length === 0) continue; // Pular tecnologias detectadas por arquivos

          if (patterns.some((pattern) => allDeps[pattern])) {
            technologies.push(tech);
          }
        }

        // Detectar por arquivos
        if (fs.existsSync(path.join(this.project.path, "Dockerfile"))) {
          technologies.push("Docker");
        }

        if (fs.existsSync(path.join(this.project.path, "docker-compose.yml"))) {
          technologies.push("Docker Compose");
        }
      } catch (error) {
        console.warn(`Erro ao detectar tecnologias:`, error.message);
      }
    }

    return technologies;
  }

  async detectPatterns() {
    const patterns = [];

    // Detectar padrões de arquitetura
    if (this.hasPattern("src/components")) {
      patterns.push({
        name: "Component-Based Architecture",
        description: "Application structured around reusable components",
      });
    }

    if (this.hasPattern("src/pages") || this.hasPattern("src/views")) {
      patterns.push({
        name: "Page/View-Based Routing",
        description: "File-based or explicit routing structure",
      });
    }

    if (this.hasPattern("src/services") || this.hasPattern("src/api")) {
      patterns.push({
        name: "Service Layer Pattern",
        description: "Separation of business logic into service classes",
      });
    }

    if (this.hasPattern("src/store") || this.hasPattern("src/state")) {
      patterns.push({
        name: "Centralized State Management",
        description: "Global state management pattern",
      });
    }

    if (this.hasPattern("src/types") || this.hasPattern("src/interfaces")) {
      patterns.push({
        name: "Type-First Development",
        description: "Strong typing with TypeScript interfaces",
      });
    }

    // Detectar padrões específicos de framework
    if (this.project.type === "backend") {
      if (
        this.hasPattern("src/modules") ||
        this.hasPattern("src/controllers")
      ) {
        patterns.push({
          name: "Modular Architecture",
          description: "Application organized in feature modules",
        });
      }

      if (this.hasPattern("src/middleware")) {
        patterns.push({
          name: "Middleware Pattern",
          description: "Request processing pipeline with middleware",
        });
      }
    }

    this.architecture.patterns = patterns;
  }

  hasPattern(relativePath) {
    return fs.existsSync(path.join(this.project.path, relativePath));
  }

  async generateArchitectureDocumentation() {
    const timestamp = new Date().toISOString();

    // Documentação para desenvolvedores
    await this.generateDevDocs(timestamp);

    // Documentação para IA
    await this.generateAIDocs(timestamp);

    // Documentação para export
    await this.generateExportDocs(timestamp);

    // Gerar diagramas se habilitado
    if (this.config.architecture?.generateDiagrams) {
      await this.generateDiagrams();
    }
  }

  async generateDevDocs(timestamp) {
    const devDir = path.join(
      this.project.path.replace(this.project.name, ""),
      this.config.output.dev
    );

    let content = `# Architecture Documentation - ${this.project.name}\n\n`;
    content += `**Generated:** ${timestamp}\n`;
    content += `**Project:** ${this.project.name}\n`;
    content += `**Type:** ${this.project.type}\n\n`;

    // Technologies
    if (this.architecture.technologies.length > 0) {
      content += `## Technologies\n\n`;
      content += this.architecture.technologies
        .map((tech) => `- ${tech}`)
        .join("\n");
      content += "\n\n";
    }

    // Architecture Patterns
    if (this.architecture.patterns.length > 0) {
      content += `## Architecture Patterns\n\n`;

      for (const pattern of this.architecture.patterns) {
        content += `### ${pattern.name}\n`;
        content += `${pattern.description}\n\n`;
      }
    }

    // Project Structure
    content += `## Project Structure\n\n`;
    content += "```\n";
    content += this.renderFolderTree(this.architecture.folders);
    content += "```\n\n";

    // Dependencies
    if (this.architecture.dependencies) {
      content += `## Dependencies\n\n`;

      for (const [category, deps] of Object.entries(
        this.architecture.dependencies
      )) {
        if (deps.length > 0) {
          content += `### ${this.capitalizeFirst(category)}\n`;
          for (const dep of deps) {
            content += `- \`${dep.name}\` (${dep.version})\n`;
          }
          content += "\n";
        }
      }
    }

    // Folder Purposes
    content += `## Folder Structure Analysis\n\n`;
    content += this.generateFolderAnalysis(this.architecture.folders);

    content += `\n---\n*Generated automatically by Documentation Generator*\n`;

    // Melhorar com OpenAI se disponível
    if (
      this.openaiEnhancer &&
      this.config.openai?.enhance?.architectureDocumentation
    ) {
      console.log("🤖 Melhorando documentação de arquitetura com OpenAI...");
      const enhanced =
        await this.openaiEnhancer.enhanceArchitectureDocumentation(
          content,
          this.architecture
        );
      content = enhanced || content;
    }

    // Gerar diagramas Mermaid se habilitado
    if (this.openaiEnhancer && this.config.openai?.enhance?.generateDiagrams) {
      console.log("📊 Gerando diagramas Mermaid...");
      const diagrams = await this.openaiEnhancer.generateMermaidDiagrams(
        this.architecture
      );
      if (diagrams) {
        content += `\n## Diagrams\n\n${diagrams}\n`;
      }
    }

    fs.writeFileSync(
      path.join(devDir, `ARCHITECTURE_${this.project.name.toUpperCase()}.md`),
      content
    );
  }

  renderFolderTree(tree, prefix = "", isLast = true) {
    let result = "";
    const entries = Object.entries(tree);

    entries.forEach(([name, info], index) => {
      const isLastEntry = index === entries.length - 1;
      const currentPrefix = isLastEntry ? "└── " : "├── ";
      const nextPrefix = isLastEntry ? "    " : "│   ";

      result += `${prefix}${currentPrefix}${name}`;

      if (info.type === "directory" && info.fileCount !== undefined) {
        result += ` (${info.fileCount} files)`;
      }

      result += "\n";

      if (info.children && Object.keys(info.children).length > 0) {
        result += this.renderFolderTree(info.children, prefix + nextPrefix);
      }
    });

    return result;
  }

  generateFolderAnalysis(tree, path = "") {
    let analysis = "";

    for (const [name, info] of Object.entries(tree)) {
      if (info.type === "directory" && info.purpose) {
        const currentPath = path ? `${path}/${name}` : name;
        analysis += `### \`${currentPath}\`\n`;
        analysis += `**Purpose:** ${info.purpose}\n`;
        analysis += `**Files:** ${info.fileCount}\n\n`;

        if (info.children) {
          analysis += this.generateFolderAnalysis(info.children, currentPath);
        }
      }
    }

    return analysis;
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async generateAIDocs(timestamp) {
    const aiDir = path.join(
      this.project.path.replace(this.project.name, ""),
      this.config.output.ai
    );

    const aiData = {
      timestamp,
      project: this.project.name,
      type: "architecture-documentation",
      architecture: this.architecture,
      summary: {
        technologies: this.architecture.technologies,
        patterns: this.architecture.patterns.map((p) => p.name),
        totalFolders: this.countFolders(this.architecture.folders),
        totalFiles: this.countTotalFiles(this.architecture.folders),
        mainDependencies: this.getMainDependencies(),
      },
    };

    fs.writeFileSync(
      path.join(aiDir, `architecture-${this.project.name}.json`),
      JSON.stringify(aiData, null, 2)
    );
  }

  countFolders(tree) {
    let count = 0;

    for (const [, info] of Object.entries(tree)) {
      if (info.type === "directory") {
        count++;
        if (info.children) {
          count += this.countFolders(info.children);
        }
      }
    }

    return count;
  }

  countTotalFiles(tree) {
    let count = 0;

    for (const [, info] of Object.entries(tree)) {
      if (info.type === "file") {
        count++;
      } else if (info.type === "directory" && info.children) {
        count += this.countTotalFiles(info.children);
      }
    }

    return count;
  }

  getMainDependencies() {
    const main = [];

    if (this.architecture.dependencies) {
      ["framework", "ui", "state"].forEach((category) => {
        if (this.architecture.dependencies[category]) {
          main.push(...this.architecture.dependencies[category].slice(0, 3));
        }
      });
    }

    return main;
  }

  async generateExportDocs(timestamp) {
    const exportDir = path.join(
      this.project.path.replace(this.project.name, ""),
      this.config.output.export
    );

    let content = `# ${this.project.name} - Architecture Overview\n\n`;

    // Quick overview
    content += `## Quick Overview\n\n`;
    content += `- **Type:** ${this.project.type}\n`;
    content += `- **Technologies:** ${this.architecture.technologies.join(", ")}\n`;
    content += `- **Patterns:** ${this.architecture.patterns.map((p) => p.name).join(", ")}\n\n`;

    // Key folders
    content += `## Key Folders\n\n`;

    const keyFolders = this.getKeyFolders(this.architecture.folders);
    keyFolders.forEach((folder) => {
      content += `### ${folder.name}\n`;
      content += `${folder.purpose}\n\n`;
    });

    content += `\n*Last updated: ${new Date(timestamp).toLocaleString()}*\n`;

    fs.writeFileSync(
      path.join(exportDir, `${this.project.name}-architecture.md`),
      content
    );
  }

  getKeyFolders(tree, path = "") {
    const keyFolders = [];

    for (const [name, info] of Object.entries(tree)) {
      if (info.type === "directory" && info.purpose && info.fileCount > 0) {
        const currentPath = path ? `${path}/${name}` : name;
        keyFolders.push({
          name: currentPath,
          purpose: info.purpose,
          fileCount: info.fileCount,
        });

        if (info.children) {
          keyFolders.push(...this.getKeyFolders(info.children, currentPath));
        }
      }
    }

    return keyFolders.slice(0, 10); // Limitar aos principais
  }

  async generateDiagrams() {
    // Placeholder para geração de diagramas
    // Futuramente pode integrar com Mermaid ou PlantUML
    console.log(
      "📊 Diagrams generation will be implemented in future versions"
    );
  }
}

module.exports = ArchitectureGenerator;
