#!/usr/bin/env node

/**
 * AutoDoc CLI - Teste Simples
 */

console.log('🤖 AutoDoc CLI - Teste de inicialização');

try {
  const { Command } = require('commander');
  console.log('✅ Commander carregado');
} catch (error) {
  console.log('❌ Erro ao carregar Commander:', error.message);
}

try {
  const inquirer = require('inquirer');
  console.log('✅ Inquirer carregado');
} catch (error) {
  console.log('❌ Erro ao carregar Inquirer:', error.message);
}

try {
  const chalk = require('chalk');
  console.log(chalk.green('✅ Chalk carregado'));
} catch (error) {
  console.log('❌ Erro ao carregar Chalk:', error.message);
}

try {
  const ora = require('ora');
  console.log('✅ Ora carregado');
} catch (error) {
  console.log('❌ Erro ao carregar Ora:', error.message);
}

try {
  const fs = require('fs-extra');
  console.log('✅ FS-Extra carregado');
} catch (error) {
  console.log('❌ Erro ao carregar FS-Extra:', error.message);
}

console.log('\n🎯 Todos os módulos principais testados!');

// Teste básico do Commander
try {
  const { Command } = require('commander');
  const program = new Command();
  
  program
    .name('autodoc')
    .description('Sistema inteligente de documentação automática')
    .version('1.0.0')
    .option('-v, --verbose', 'Saída detalhada')
    .action((options) => {
      console.log('\n🚀 AutoDoc CLI funcionando!');
      console.log('Opções:', options);
    });

  program.parse(process.argv);
  
} catch (error) {
  console.log('❌ Erro no teste do Commander:', error.message);
}
