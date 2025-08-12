#!/usr/bin/env node

/**
 * Feature Documentation Generator v3.0
 * Sistema inteligente para documentação de features
 */

// Carregar variáveis de ambiente
require("dotenv").config();

const FeatureDocsEngine = require("./feature-docs/core/feature-docs-engine");

async function main() {
  const engine = new FeatureDocsEngine();

  // Parse command line arguments
  const options = parseArguments();

  // Executar engine
  const success = await engine.run(options);

  process.exit(success ? 0 : 1);
}

function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    detectChanges: false,
    since: null,
    features: [],
    all: false,
    config: false,
    showConfig: false,
    verbose: false,
    debug: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--help":
      case "-h":
        showHelp();
        process.exit(0);
        break;

      case "--detect-changes":
      case "-c":
        options.detectChanges = true;
        break;

      case "--since":
        if (i + 1 < args.length) {
          options.since = args[++i];
          options.detectChanges = true;
        }
        break;

      case "--features":
      case "-f":
        if (i + 1 < args.length) {
          options.features = args[++i].split(",");
        }
        break;

      case "--all":
      case "-a":
        options.all = true;
        break;

      case "--config":
        options.config = true;
        break;

      case "--show-config":
        options.showConfig = true;
        break;

      case "--verbose":
      case "-v":
        options.verbose = true;
        break;

      case "--debug":
        options.debug = true;
        break;

      default:
        if (arg.startsWith("--")) {
          console.log(`⚠️ Opção desconhecida: ${arg}`);
        }
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🚀 Feature Documentation Generator v3.0

DESCRIÇÃO:
  Sistema inteligente para documentação automática de features do frontend.
  Analisa componentes, detecta elementos UI e gera documentação para diferentes públicos.

USO:
  node generate-feature-docs.js [opções]

OPÇÕES:
  -h, --help              Exibir esta ajuda
  -c, --detect-changes    Detectar alterações desde último commit
  --since <ref>           Detectar alterações desde referência específica
  -f, --features <list>   Selecionar features específicas (separadas por vírgula)
  -a, --all              Documentar todas as features
  --config               Configuração interativa
  --show-config          Exibir configurações atuais
  -v, --verbose          Modo verboso
  --debug                Modo debug

EXEMPLOS:
  # Execução interativa (padrão)
  node generate-feature-docs.js

  # Detectar alterações e documentar apenas features modificadas
  node generate-feature-docs.js --detect-changes

  # Documentar features específicas
  node generate-feature-docs.js --features "comunicacoes,records"

  # Documentar todas as features
  node generate-feature-docs.js --all

  # Configurar o sistema
  node generate-feature-docs.js --config

  # Detectar alterações desde uma branch específica
  node generate-feature-docs.js --since main

ESTRUTURA:
  O sistema busca por features em src/features/ e gera documentação em docs/features/
  
  Cada feature documentada gera:
  • technical.md    - Para desenvolvedores
  • design.md       - Para designers
  • business.md     - Para POs/Analistas
  • overview.md     - Visão geral

REQUISITOS:
  • Node.js 16+
  • Projeto com estrutura src/features/
  • OpenAI API Key (opcional, mas recomendado)

Para mais informações, consulte README-SISTEMA.md
`);
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Erro fatal:", error);
    if (process.argv.includes("--debug")) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}

module.exports = { main, parseArguments };
