const fs = require("fs").promises;
const path = require("path");

class FeatureAnalyzer {
  constructor() {
    this.supportedExtensions = [".tsx", ".ts", ".js", ".jsx"];
  }

  /**
   * Analisa a estrutura de uma feature
   */
  async analyzeFeatureStructure(featurePath) {
    const structure = {
      name: path.basename(featurePath),
      components: [],
      hooks: [],
      pages: [],
      services: [],
      schemas: [],
      tests: [],
      hasBarrelExport: false,
    };

    try {
      const entries = await fs.readdir(featurePath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(featurePath, entry.name);

        if (entry.isDirectory()) {
          await this.analyzeDirectory(entryPath, entry.name, structure);
        } else if (entry.name === "index.ts" || entry.name === "index.js") {
          structure.hasBarrelExport = true;
        }
      }

      return structure;
    } catch (error) {
      console.error(
        `Erro ao analisar estrutura da feature ${featurePath}:`,
        error
      );
      return structure;
    }
  }

  /**
   * Analisa um diretório específico da feature
   */
  async analyzeDirectory(dirPath, dirName, structure) {
    try {
      const files = await fs.readdir(dirPath);
      const jsFiles = files.filter((file) =>
        this.supportedExtensions.some((ext) => file.endsWith(ext))
      );

      switch (dirName) {
        case "components":
          structure.components = jsFiles.map((file) => ({
            name: file,
            path: path.join(dirPath, file),
          }));
          break;
        case "hooks":
          structure.hooks = jsFiles.map((file) => ({
            name: file,
            path: path.join(dirPath, file),
          }));
          break;
        case "pages":
          structure.pages = jsFiles.map((file) => ({
            name: file,
            path: path.join(dirPath, file),
          }));
          break;
        case "services":
          structure.services = jsFiles.map((file) => ({
            name: file,
            path: path.join(dirPath, file),
          }));
          break;
        case "schemas":
          structure.schemas = jsFiles.map((file) => ({
            name: file,
            path: path.join(dirPath, file),
          }));
          break;
        case "__tests__":
        case "tests":
          structure.tests = jsFiles.map((file) => ({
            name: file,
            path: path.join(dirPath, file),
          }));
          break;
      }
    } catch (error) {
      console.error(`Erro ao analisar diretório ${dirPath}:`, error);
    }
  }

  /**
   * Obtém conteúdo dos arquivos de uma feature
   */
  async getFeatureFiles(featurePath) {
    const files = [];
    const structure = await this.analyzeFeatureStructure(featurePath);

    // Coleta arquivos de todas as categorias
    const allFiles = [
      ...(structure.components || []),
      ...(structure.hooks || []),
      ...(structure.pages || []),
      ...(structure.services || []),
      ...(structure.schemas || []),
    ];

    for (const file of allFiles) {
      try {
        const content = await fs.readFile(file.path, "utf-8");
        files.push({
          name: file.name,
          path: file.path,
          content,
          type: this.getFileType(file.path),
        });
      } catch (error) {
        console.error(`Erro ao ler arquivo ${file.path}:`, error);
      }
    }

    // Adiciona index.ts se existir
    const indexPath = path.join(featurePath, "index.ts");
    try {
      const indexContent = await fs.readFile(indexPath, "utf-8");
      files.push({
        name: "index.ts",
        path: indexPath,
        content: indexContent,
        type: "barrel",
      });
    } catch {
      // Index não existe, tudo bem
    }

    return files;
  }

  /**
   * Determina o tipo de arquivo baseado no path
   */
  getFileType(filePath) {
    if (filePath.includes("/components/")) return "component";
    if (filePath.includes("/hooks/")) return "hook";
    if (filePath.includes("/pages/")) return "page";
    if (filePath.includes("/services/")) return "service";
    if (filePath.includes("/schemas/")) return "schema";
    if (filePath.includes("/tests/") || filePath.includes("__tests__"))
      return "test";
    return "other";
  }

  /**
   * Extrai informações específicas de um arquivo React/TS
   */
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const analysis = {
        exports: this.extractExports(content),
        imports: this.extractImports(content),
        components: this.extractComponents(content),
        hooks: this.extractHooks(content),
        types: this.extractTypes(content),
      };

      return analysis;
    } catch (error) {
      console.error(`Erro ao analisar arquivo ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extrai exports do arquivo
   */
  extractExports(content) {
    const exports = [];
    const exportRegex =
      /export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }

  /**
   * Extrai imports do arquivo
   */
  extractImports(content) {
    const imports = [];
    const importRegex =
      /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)?\s*from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Extrai componentes React
   */
  extractComponents(content) {
    const components = [];
    const componentRegex =
      /(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)\s*(?:\([^)]*\))?\s*(?::\s*React\.FC)?/g;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
      components.push(match[1]);
    }

    return components;
  }

  /**
   * Extrai hooks customizados
   */
  extractHooks(content) {
    const hooks = [];
    const hookRegex = /(?:function|const)\s+(use[A-Z][a-zA-Z0-9_]*)/g;
    let match;

    while ((match = hookRegex.exec(content)) !== null) {
      hooks.push(match[1]);
    }

    return hooks;
  }

  /**
   * Extrai types/interfaces
   */
  extractTypes(content) {
    const types = [];
    const typeRegex = /(?:type|interface)\s+([A-Z][a-zA-Z0-9_]*)/g;
    let match;

    while ((match = typeRegex.exec(content)) !== null) {
      types.push(match[1]);
    }

    return types;
  }
}

module.exports = FeatureAnalyzer;
