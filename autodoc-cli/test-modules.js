#!/usr/bin/env node

/**
 * Teste dos módulos customizados
 */

console.log('🧪 Testando módulos customizados...\n');

try {
  console.log('Testando ProjectDetector...');
  const { ProjectDetector } = require('./src/core/project-detector');
  const detector = new ProjectDetector();
  console.log('✅ ProjectDetector carregado');
} catch (error) {
  console.log('❌ Erro ProjectDetector:', error.message);
}

try {
  console.log('Testando ConfigManager...');
  const { ConfigManager } = require('./src/config/config-manager');
  const configManager = new ConfigManager();
  console.log('✅ ConfigManager carregado');
} catch (error) {
  console.log('❌ Erro ConfigManager:', error.message);
}

try {
  console.log('Testando CodeScanner...');
  const { CodeScanner } = require('./src/core/code-scanner');
  const scanner = new CodeScanner();
  console.log('✅ CodeScanner carregado');
} catch (error) {
  console.log('❌ Erro CodeScanner:', error.message);
}

try {
  console.log('Testando DocumentationGenerator...');
  const { DocumentationGenerator } = require('./src/generators/documentation-generator');
  const generator = new DocumentationGenerator();
  console.log('✅ DocumentationGenerator carregado');
} catch (error) {
  console.log('❌ Erro DocumentationGenerator:', error.message);
}

try {
  console.log('Testando ComponentAnalyzer...');
  const { ComponentAnalyzer } = require('./src/analyzers/component-analyzer');
  console.log('✅ ComponentAnalyzer disponível');
} catch (error) {
  console.log('❌ Erro ComponentAnalyzer:', error.message);
}

try {
  console.log('Testando AutoDocEngine...');
  const { AutoDocEngine } = require('./src/core/autodoc-engine');
  const engine = new AutoDocEngine();
  console.log('✅ AutoDocEngine carregado');
} catch (error) {
  console.log('❌ Erro AutoDocEngine:', error.message);
}

console.log('\n🎯 Teste de módulos concluído!');
