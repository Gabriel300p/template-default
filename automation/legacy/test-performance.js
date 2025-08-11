#!/usr/bin/env node

/**
 * Teste de Performance e Monitoramento
 */

const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

class PerformanceTester {
  constructor() {
    this.metrics = {
      totalTime: 0,
      openaiCalls: 0,
      openaiTime: 0,
      filesProcessed: 0,
      memoryUsage: {
        initial: 0,
        peak: 0,
        final: 0,
      },
    };
  }

  startMonitoring() {
    this.startTime = performance.now();
    this.metrics.memoryUsage.initial =
      process.memoryUsage().heapUsed / 1024 / 1024;
    console.log("📊 Iniciando monitoramento de performance...\n");
  }

  async testDocumentationPerformance() {
    const rootPath = path.join(__dirname, "..");

    console.log("🚀 Executando teste de performance...");

    // Monitor de memória
    const memoryMonitor = setInterval(() => {
      const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      if (currentMemory > this.metrics.memoryUsage.peak) {
        this.metrics.memoryUsage.peak = currentMemory;
      }
    }, 100);

    try {
      // Carregar sistema
      const startLoad = performance.now();
      const DocGenerator = require("./doc-generator/main.js");
      const loadTime = performance.now() - startLoad;
      console.log(`⚡ Sistema carregado em: ${loadTime.toFixed(2)}ms`);

      // Executar análise
      const startAnalysis = performance.now();
      const generator = new DocGenerator({
        projectRoot: rootPath,
        outputPath: path.join(rootPath, "docs", "performance-test"),
      });

      // Mock do OpenAI para medir calls
      const originalEnhancer = generator.enhancer;
      if (originalEnhancer && originalEnhancer.isEnabled) {
        const originalEnhance = originalEnhancer.enhance.bind(originalEnhancer);
        generator.enhancer.enhance = async (...args) => {
          const callStart = performance.now();
          this.metrics.openaiCalls++;
          const result = await originalEnhance(...args);
          this.metrics.openaiTime += performance.now() - callStart;
          return result;
        };
      }

      // Executar geração
      await generator.generateDocumentation();
      const analysisTime = performance.now() - startAnalysis;
      console.log(`📝 Análise completa em: ${analysisTime.toFixed(2)}ms`);

      // Contar arquivos gerados
      const outputPath = path.join(rootPath, "docs", "performance-test");
      this.countGeneratedFiles(outputPath);
    } finally {
      clearInterval(memoryMonitor);
      this.metrics.memoryUsage.final =
        process.memoryUsage().heapUsed / 1024 / 1024;
    }
  }

  countGeneratedFiles(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      if (item.isFile()) {
        this.metrics.filesProcessed++;
      } else if (item.isDirectory()) {
        this.countGeneratedFiles(path.join(dir, item.name));
      }
    }
  }

  async testLargeProjectSimulation() {
    console.log("\n🏗️ Simulando projeto grande...");

    // Criar estrutura de projeto grande temporária
    const tempDir = path.join(__dirname, "..", "temp-large-project");

    try {
      this.createLargeProjectStructure(tempDir);

      const startTime = performance.now();
      const DocGenerator = require("./doc-generator/main.js");
      const generator = new DocGenerator({
        projectRoot: tempDir,
        outputPath: path.join(tempDir, "docs"),
      });

      await generator.generateDocumentation();
      const totalTime = performance.now() - startTime;

      console.log(`📊 Projeto grande processado em: ${totalTime.toFixed(2)}ms`);
    } finally {
      // Limpar
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  createLargeProjectStructure(baseDir) {
    // Criar estrutura complexa para teste
    const structure = {
      src: {
        components: {},
        pages: {},
        services: {},
        utils: {},
        types: {},
      },
      backend: {
        src: {
          controllers: {},
          services: {},
          models: {},
          middleware: {},
        },
      },
      docs: {},
      tests: {},
    };

    // Criar 50 arquivos de exemplo
    for (let i = 1; i <= 50; i++) {
      structure.src.components[`Component${i}.tsx`] =
        this.generateComponentCode(i);
      structure.backend.src.controllers[`Controller${i}.ts`] =
        this.generateControllerCode(i);
    }

    this.createStructureRecursive(baseDir, structure);

    // Criar package.json
    fs.writeFileSync(
      path.join(baseDir, "package.json"),
      JSON.stringify(
        {
          name: "large-test-project",
          version: "1.0.0",
          scripts: { test: "echo test" },
        },
        null,
        2
      )
    );
  }

  createStructureRecursive(basePath, structure) {
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    for (const [name, content] of Object.entries(structure)) {
      const fullPath = path.join(basePath, name);

      if (typeof content === "string") {
        // É um arquivo
        fs.writeFileSync(fullPath, content);
      } else {
        // É um diretório
        this.createStructureRecursive(fullPath, content);
      }
    }
  }

  generateComponentCode(index) {
    return `
import React from 'react';

interface Component${index}Props {
  title: string;
  description?: string;
  onClick?: () => void;
}

/**
 * Component${index} - Componente de exemplo ${index}
 * @param props - Propriedades do componente
 */
export const Component${index}: React.FC<Component${index}Props> = ({ 
  title, 
  description, 
  onClick 
}) => {
  return (
    <div className="component-${index}">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <button onClick={onClick}>Action ${index}</button>
    </div>
  );
};

export default Component${index};
`;
  }

  generateControllerCode(index) {
    return `
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('api/resource${index}')
export class Resource${index}Controller {
  
  /**
   * Get all resource${index} items
   */
  @Get()
  findAll() {
    return { message: 'Get all resource${index}' };
  }

  /**
   * Get resource${index} by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return { id, message: 'Get resource${index} by ID' };
  }

  /**
   * Create new resource${index}
   */
  @Post()
  create(@Body() createDto: any) {
    return { message: 'Create resource${index}', data: createDto };
  }
}
`;
  }

  finishMonitoring() {
    this.metrics.totalTime = performance.now() - this.startTime;
  }

  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 RELATÓRIO DE PERFORMANCE");
    console.log("=".repeat(60));

    console.log(`⏱️  Tempo total: ${this.metrics.totalTime.toFixed(2)}ms`);
    console.log(`📄 Arquivos processados: ${this.metrics.filesProcessed}`);

    if (this.metrics.openaiCalls > 0) {
      console.log(`🤖 Chamadas OpenAI: ${this.metrics.openaiCalls}`);
      console.log(`⚡ Tempo OpenAI: ${this.metrics.openaiTime.toFixed(2)}ms`);
      console.log(
        `📈 Média por chamada: ${(this.metrics.openaiTime / this.metrics.openaiCalls).toFixed(2)}ms`
      );
    }

    console.log(`\n💾 MEMÓRIA:`);
    console.log(`   Inicial: ${this.metrics.memoryUsage.initial.toFixed(2)}MB`);
    console.log(`   Pico: ${this.metrics.memoryUsage.peak.toFixed(2)}MB`);
    console.log(`   Final: ${this.metrics.memoryUsage.final.toFixed(2)}MB`);
    console.log(
      `   Crescimento: ${(this.metrics.memoryUsage.final - this.metrics.memoryUsage.initial).toFixed(2)}MB`
    );

    // Análise de performance
    console.log(`\n📈 ANÁLISE:`);

    if (this.metrics.totalTime < 5000) {
      console.log("   ✅ Performance excelente (< 5s)");
    } else if (this.metrics.totalTime < 15000) {
      console.log("   ⚠️ Performance aceitável (5-15s)");
    } else {
      console.log("   ❌ Performance lenta (> 15s)");
    }

    if (this.metrics.memoryUsage.peak < 100) {
      console.log("   ✅ Uso de memória eficiente (< 100MB)");
    } else if (this.metrics.memoryUsage.peak < 200) {
      console.log("   ⚠️ Uso de memória moderado (100-200MB)");
    } else {
      console.log("   ❌ Uso de memória alto (> 200MB)");
    }

    console.log("=".repeat(60));
  }

  async run() {
    this.startMonitoring();

    try {
      await this.testDocumentationPerformance();
      await this.testLargeProjectSimulation();
    } catch (error) {
      console.error("❌ Erro durante teste de performance:", error.message);
    }

    this.finishMonitoring();
    this.printResults();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.run().catch(console.error);
}

module.exports = PerformanceTester;
