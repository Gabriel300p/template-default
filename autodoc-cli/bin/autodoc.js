#!/usr/bin/env node

/**
 * AutoDoc CLI - Sistema Inteligente de Documentação Automática
 * Executável principal para instalação global
 */

const path = require('path');
const { AutoDocCLI } = require('../src/cli');

// Inicializar CLI
const cli = new AutoDocCLI();

// Executar com argumentos do processo
cli.run(process.argv)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  });
