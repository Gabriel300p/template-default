/**
 * Interactive Selector - Seleção interativa melhorada
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs');

class InteractiveSelector {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async selectFeatures(features) {
    if (features.length === 0) {
      return [];
    }

    if (features.length === 1) {
      console.log(`🎯 Apenas 1 feature encontrada: ${features[0].name}`);
      return features;
    }

    console.log('\n📋 Features Disponíveis:');
    features.forEach((feature, index) => {
      console.log(`   ${index + 1}. ${feature.name} (${feature.components.length} componentes)`);
    });

    console.log(`   ${features.length + 1}. Todas as features`);

    const answer = await this.askQuestion('\n🎯 Selecione as features (números separados por vírgula): ');
    
    if (answer.trim() === String(features.length + 1)) {
      return features;
    }

    const selectedIndexes = answer.split(',')
      .map(s => parseInt(s.trim()) - 1)
      .filter(i => i >= 0 && i < features.length);

    return selectedIndexes.map(i => features[i]);
  }

  async selectDocumentationTypes() {
    const templatesPath = path.join(__dirname, '..', 'config', 'documentation-templates.json');
    let templates = {};

    try {
      if (fs.existsSync(templatesPath)) {
        templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8')).templates;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar templates, usando padrões');
      templates = {
        technical: { name: 'Documentação Técnica', description: 'Para desenvolvedores' },
        user: { name: 'Guia do Usuário', description: 'Para usuários finais' },
        executive: { name: 'Resumo Executivo', description: 'Para gestores' },
        overview: { name: 'Visão Geral', description: 'Para todos os públicos' }
      };
    }

    console.log('\n📋 Tipos de Documentação Disponíveis:');
    const templateKeys = Object.keys(templates);
    templateKeys.forEach((key, index) => {
      const template = templates[key];
      console.log(`   ${index + 1}. ${template.name} - ${template.description}`);
    });

    console.log(`   ${templateKeys.length + 1}. Todos os tipos`);

    const answer = await this.askQuestion('\n📝 Selecione os tipos de documentação (números separados por vírgula): ');
    
    if (answer.trim() === String(templateKeys.length + 1)) {
      return templateKeys;
    }

    const selectedIndexes = answer.split(',')
      .map(s => parseInt(s.trim()) - 1)
      .filter(i => i >= 0 && i < templateKeys.length);

    return selectedIndexes.map(i => templateKeys[i]);
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  close() {
    this.rl.close();
  }
}

module.exports = InteractiveSelector;
