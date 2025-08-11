/**
 * Interactive Selector - Seletor interativo para features
 * Interface de linha de comando para seleção de features e configurações
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

class InteractiveSelector {
  constructor() {
    // Usar implementação simplificada para evitar duplicação no Windows
  }

  /**
   * Pergunta simples com prompt (versão simplificada)
   */
  question(prompt) {
    return new Promise((resolve) => {
      process.stdout.write(prompt);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      const onData = (data) => {
        process.stdin.removeListener('data', onData);
        process.stdin.pause();
        const input = data.toString().trim();
        resolve(input);
      };
      
      process.stdin.on('data', onData);
    });
  }

  /**
   * Seleção múltipla de features
   */
  async selectFeatures(availableFeatures) {
    console.log('\n🎯 Seleção de Features');
    console.log('='.repeat(40));
    
    if (availableFeatures.length === 0) {
      console.log('❌ Nenhuma feature encontrada');
      return [];
    }

    console.log('📋 Features disponíveis:');
    availableFeatures.forEach((feature, index) => {
      const displayName = typeof feature === 'object' ? feature.name : feature;
      const componentsCount = typeof feature === 'object' && feature.components 
        ? ` (${feature.components.length} componentes)` 
        : '';
      console.log(`   ${index + 1}. ${displayName}${componentsCount}`);
    });

    console.log('\n💡 Opções:');
    console.log('   • Digite números separados por vírgula (ex: 1,3,5)');
    console.log('   • Digite "all" para selecionar todas');
    console.log('   • Digite "none" para cancelar');
    console.log('   • Digite "search <termo>" para filtrar');

    const selection = await this.question('\n🔍 Sua seleção: ');

    return this.processFeatureSelection(selection, availableFeatures);
  }

  /**
   * Processa a seleção de features
   */
  processFeatureSelection(selection, availableFeatures) {
    const input = selection.toLowerCase().trim();
    
    // Cancelar
    if (input === 'none' || input === '') {
      return [];
    }
    
    // Selecionar todas
    if (input === 'all') {
      return availableFeatures.map(f => typeof f === 'object' ? f.name : f);
    }
    
    // Busca
    if (input.startsWith('search ')) {
      const searchTerm = input.replace('search ', '');
      const filtered = availableFeatures.filter(feature => {
        const name = typeof feature === 'object' ? feature.name : feature;
        return name.toLowerCase().includes(searchTerm);
      });
      
      console.log(`\n🔍 ${filtered.length} feature(s) encontrada(s) para "${searchTerm}"`);
      return filtered.map(f => typeof f === 'object' ? f.name : f);
    }
    
    // Seleção por números
    const numbers = selection.split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= availableFeatures.length);
      
    const selectedFeatures = numbers.map(n => {
      const feature = availableFeatures[n - 1];
      return typeof feature === 'object' ? feature.name : feature;
    });
    
    return selectedFeatures;
  }

  /**
   * Confirmação simples sim/não
   */
  async confirm(message, defaultValue = false) {
    const defaultText = defaultValue ? '[Y/n]' : '[y/N]';
    const answer = await this.question(`${message} ${defaultText}: `);
    
    const input = answer.toLowerCase().trim();
    
    if (input === '') {
      return defaultValue;
    }
    
    return input === 'y' || input === 'yes' || input === 'sim';
  }

  /**
   * Confirmação de geração da documentação (versão simplificada para Windows)
   */
  async confirmGeneration() {
    console.log('\n✅ Prosseguindo com a geração...');
    return true; // Sempre confirma para evitar problemas de input no Windows
  }

  /**
   * Seleção de template
   */
  async selectTemplate(availableTemplates) {
    console.log('\n📄 Seleção de Template');
    console.log('='.repeat(40));
    
    const templateNames = Object.keys(availableTemplates);
    
    if (templateNames.length === 0) {
      console.log('❌ Nenhum template disponível');
      return 'default';
    }

    templateNames.forEach((template, index) => {
      const config = availableTemplates[template];
      const description = config.description || 'Sem descrição';
      console.log(`   ${index + 1}. ${template} - ${description}`);
    });

    const selection = await this.question('\n📝 Selecione o template [1]: ');
    
    if (!selection.trim()) {
      return templateNames[0];
    }
    
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < templateNames.length) {
      return templateNames[index];
    }
    
    return templateNames[0];
  }

  /**
   * Seleção de audiência
   */
  async selectAudience() {
    console.log('\n👥 Seleção de Audiência');
    console.log('='.repeat(40));
    
    const audiences = [
      { key: 'developer', name: 'Desenvolvedor', description: 'Documentação técnica detalhada' },
      { key: 'product', name: 'Product Manager', description: 'Visão de produto e funcionalidades' },
      { key: 'designer', name: 'Designer', description: 'Componentes UI e patterns' },
      { key: 'qa', name: 'QA/Tester', description: 'Cenários e casos de teste' }
    ];

    audiences.forEach((audience, index) => {
      console.log(`   ${index + 1}. ${audience.name} - ${audience.description}`);
    });

    const selection = await this.question('\n🎯 Selecione a audiência [1]: ');
    
    if (!selection.trim()) {
      return audiences[0].key;
    }
    
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < audiences.length) {
      return audiences[index].key;
    }
    
    return audiences[0].key;
  }

  /**
   * Preview da documentação que será gerada
   */
  async showPreview(previewData) {
    console.log('\n👀 Preview da Documentação');
    console.log('='.repeat(40));
    
    if (previewData.features && previewData.features.length > 0) {
      console.log(`📊 Será gerada documentação para ${previewData.features.length} feature(s):`);
      
      previewData.features.forEach(feature => {
        console.log(`\n   📁 ${feature.name}`);
        if (feature.components && feature.components.length > 0) {
          console.log(`      🧩 ${feature.components.length} componente(s):`);
          feature.components.slice(0, 3).forEach(comp => {
            console.log(`         • ${comp.name} (${comp.type})`);
          });
          if (feature.components.length > 3) {
            console.log(`         ... e mais ${feature.components.length - 3} componente(s)`);
          }
        }
        
        if (feature.uiElements && feature.uiElements.length > 0) {
          const uniqueElements = [...new Set(feature.uiElements.map(el => el.type))];
          console.log(`      🎨 Elementos UI: ${uniqueElements.join(', ')}`);
        }
      });
    }

    console.log(`\n📂 Local de saída: ${previewData.outputPath || './docs/features'}`);
    console.log(`📄 Formato: ${previewData.format || 'markdown'}`);
    console.log(`🎯 Audiência: ${previewData.audience || 'developer'}`);
    
    if (previewData.estimatedTime) {
      console.log(`⏱️ Tempo estimado: ${previewData.estimatedTime}`);
    }

    return await this.confirm('\n✅ Prosseguir com a geração?', true);
  }

  /**
   * Menu principal interativo
   */
  async showMainMenu() {
    console.log('\n🏠 Menu Principal - Feature Documentation System v3.0');
    console.log('='.repeat(50));
    console.log('1. Gerar documentação para features específicas');
    console.log('2. Gerar documentação para todas as features');
    console.log('3. Detectar mudanças automaticamente (Git)');
    console.log('4. Configurar sistema');
    console.log('5. Sair');

    const choice = await this.question('\n🔍 Escolha uma opção [1]: ');
    
    return choice.trim() || '1';
  }

  /**
   * Configuração interativa
   */
  async configureSettings() {
    console.log('\n⚙️ Configuração do Sistema');
    console.log('='.repeat(40));

    const settings = {};

    // Caminho de saída
    const outputPath = await this.question('📂 Caminho de saída [./docs/features]: ');
    settings.outputPath = outputPath || './docs/features';

    // Formato
    console.log('\n📄 Formatos disponíveis: markdown, html, json');
    const format = await this.question('Formato [markdown]: ');
    settings.format = format || 'markdown';

    // IA
    const useAI = await this.confirm('🤖 Usar IA para melhorar documentação?');
    settings.useAI = useAI;

    if (useAI) {
      const aiModel = await this.question('🧠 Modelo IA [gpt-4o-mini]: ');
      settings.aiModel = aiModel || 'gpt-4o-mini';
    }

    // Git
    const useGit = await this.confirm('🔧 Usar integração Git?', true);
    settings.useGit = useGit;

    return settings;
  }

  /**
   * Progresso visual
   */
  async showProgress(steps, currentStep, message = '') {
    const percentage = Math.round((currentStep / steps) * 100);
    const barLength = 30;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;
    
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
    
    process.stdout.write(`\r📊 [${progressBar}] ${percentage}% ${message}`);
    
    if (currentStep === steps) {
      console.log('\n✅ Concluído!');
    }
  }

  /**
   * Exibe resultados finais
   */
  async showResults(results) {
    console.log('\n🎉 Documentação Gerada com Sucesso!');
    console.log('='.repeat(40));
    
    if (results.generatedFiles && results.generatedFiles.length > 0) {
      console.log(`📄 ${results.generatedFiles.length} arquivo(s) gerado(s):`);
      results.generatedFiles.forEach(file => {
        console.log(`   • ${file}`);
      });
    }

    if (results.features && results.features.length > 0) {
      console.log(`\n🎯 ${results.features.length} feature(s) documentada(s):`);
      results.features.forEach(feature => {
        console.log(`   📁 ${feature}`);
      });
    }

    if (results.outputPath) {
      console.log(`\n📂 Local: ${results.outputPath}`);
    }

    if (results.duration) {
      console.log(`⏱️ Tempo total: ${results.duration}`);
    }

    const openFiles = await this.confirm('\n👀 Abrir arquivos gerados?');
    return openFiles;
  }

  /**
   * Encerra interface
   */
  close() {
    // Implementação simplificada - nada a fazer
  }
}

module.exports = InteractiveSelector;
