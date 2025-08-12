/**
 * Documentation Generator - Gerador de documentação
 * Sistema completo de geração de documentação para features
 */

const fs = require("fs");
const path = require("path");

class DocumentationGenerator {
  constructor(config = {}) {
    this.config = {
      format: "markdown",
      template: "standard",
      audience: "developer",
      language: "pt-BR",
      includeIndex: true,
      ...config,
    };

    this.templates = this.loadTemplates();
  }

  /**
   * Carrega templates de documentação
   */
  loadTemplates() {
    const templatesPath = path.join(
      __dirname,
      "..",
      "config",
      "templates-config.json"
    );

    try {
      if (fs.existsSync(templatesPath)) {
        return JSON.parse(fs.readFileSync(templatesPath, "utf8"));
      }
    } catch (error) {
      console.warn("⚠️ Erro ao carregar templates, usando padrão");
    }

    // Template padrão se não conseguir carregar
    return {
      templates: {
        standard: {
          audiences: {
            developer: {
              sections: [
                "overview",
                "components",
                "apis",
                "examples",
                "testing",
              ],
              format: "technical",
            },
          },
        },
      },
      sections: {
        overview: { title: "Visão Geral", required: true },
        components: { title: "Componentes", required: true },
        apis: { title: "APIs", required: false },
        examples: { title: "Exemplos", required: false },
        testing: { title: "Testes", required: false },
      },
    };
  }

  /**
   * Gera documentação completa para uma feature
   */
  async generateFeatureDoc(feature, options = {}) {
    const config = { ...this.config, ...options };

    console.log(`📝 Gerando documentação para feature: ${feature.name}`);

    try {
      const documentation = {
        metadata: this.generateMetadata(feature),
        content: await this.generateContent(feature, config),
        files: [],
      };

      // Gerar arquivo principal
      const mainContent = await this.renderTemplate(documentation, config);
      const fileName = this.getFileName(feature.name, config.format);
      const filePath = path.join(
        config.outputPath || "./docs/features",
        fileName
      );

      documentation.files.push({
        path: filePath,
        content: mainContent,
        type: "main",
      });

      // Gerar arquivos adicionais se necessário
      if (config.generateComponentDocs) {
        const componentDocs = await this.generateComponentDocs(
          feature.components,
          config
        );
        documentation.files.push(...componentDocs);
      }

      return documentation;
    } catch (error) {
      console.error(
        `❌ Erro ao gerar documentação para ${feature.name}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Gera documentação usando template específico e IA
   */
  async generateWithTemplate(feature, templateKey, options = {}) {
    const templatesPath = path.join(
      __dirname,
      "..",
      "config",
      "documentation-templates.json"
    );
    let templates = {};

    try {
      if (fs.existsSync(templatesPath)) {
        templates = JSON.parse(
          fs.readFileSync(templatesPath, "utf8")
        ).templates;
      }
    } catch (error) {
      console.warn("⚠️ Erro ao carregar templates, usando fallback básico");
      return await this.generateBasicDoc(feature, options);
    }

    const template = templates[templateKey];
    if (!template) {
      console.warn(
        `⚠️ Template '${templateKey}' não encontrado, usando básico`
      );
      return await this.generateBasicDoc(feature, options);
    }

    try {
      // Tentar gerar com IA primeiro
      if (options.useAI) {
        if (!process.env.OPENAI_API_KEY) {
          console.log(
            "⚠️ OpenAI_API_KEY não configurada, usando método básico"
          );
          console.log(
            "   💡 Configure sua API key no arquivo .env para usar IA"
          );
        } else {
          console.log("🤖 Gerando com OpenAI...");
          const aiResult = await this.generateWithAI(
            feature,
            template,
            options
          );
          if (aiResult.success) {
            return aiResult;
          }
          console.log("⚠️ IA falhou, usando método básico");
        }
      } else {
        console.log("📝 Usando método básico (IA desabilitada)");
      }

      // Fallback para método básico
      return await this.generateBasicDoc(feature, options, template);
    } catch (error) {
      console.error(`❌ Erro na geração: ${error.message}`);
      return {
        success: false,
        error: error.message,
        filePath: null,
      };
    }
  }

  /**
   * Gera documentação com IA usando template
   */
  async generateWithAI(feature, template, options) {
    try {
      const openai = await this.getOpenAIClient({});
      if (!openai) {
        return { success: false, error: "OpenAI não disponível" };
      }

      // Preparar dados para o template
      const templateData = this.prepareTemplateData(feature);
      const prompt = this.fillTemplate(template.prompt_template, templateData);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: template.system_prompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: "Resposta vazia da IA" };
      }

      // Salvar arquivo
      const outputPath = path.join(
        options.outputPath || "./docs/features",
        feature.name
      );
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const filePath = path.join(outputPath, template.filename);
      fs.writeFileSync(filePath, content, "utf8");

      return {
        success: true,
        filePath,
        content,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Prepara dados para substituição no template - VERSÃO MELHORADA
   * Agora faz análise real do código em vez de usar dados genéricos
   */
  prepareTemplateData(feature) {
    const components = feature.components || [];
    const hooks = feature.hooks || [];

    // Análise do código real
    const codeAnalysis = this.performRealCodeAnalysis(feature);
    const currentDate = new Date().toLocaleDateString("pt-BR");

    return {
      // Dados básicos
      feature_name: feature.name,
      current_date: currentDate,
      components_count: components.length,
      hooks_count: hooks.length,

      // Dados básicos legados (manter compatibilidade)
      complexity_level: this.calculateOverallComplexity(components),
      components_summary: components
        .map(
          (c) =>
            `- ${c.name} (${c.type}): ${c.description || "Componente " + c.type}`
        )
        .join("\n"),
      ui_components: components.filter(
        (c) => c.type === "react" || c.type === "vue"
      ).length,
      ui_elements: this.extractUIElements(components).join(", "),
      feature_capabilities: this.inferCapabilities(feature),

      // NOVOS DADOS BASEADOS EM ANÁLISE REAL
      code_analysis: codeAnalysis.summary,
      real_components: codeAnalysis.componentsDetail,
      real_schemas: codeAnalysis.schemas,
      real_hooks: codeAnalysis.hooksDetail,
      real_dependencies: codeAnalysis.dependencies,
      business_rules: codeAnalysis.businessRules,
      ui_analysis: codeAnalysis.uiAnalysis,
      real_features: codeAnalysis.realFeatures,
      real_ui_flows: codeAnalysis.uiFlows,
      real_validations: codeAnalysis.validations,
      real_filters: codeAnalysis.filters,
      implementation_analysis: codeAnalysis.implementationSummary,
      real_complexity: codeAnalysis.complexityAnalysis,
      implemented_features: codeAnalysis.implementedFeaturesList,
      real_tech_stack: codeAnalysis.techStack,
      quality_metrics: codeAnalysis.qualityMetrics,
      dev_time_analysis: codeAnalysis.developmentTime,
      real_implementation: codeAnalysis.implementationOverview,
      real_functionality: codeAnalysis.functionalityDetail,
      real_interface: codeAnalysis.interfaceDetail,
      real_technologies: codeAnalysis.technologiesUsed,
      real_benefits: codeAnalysis.identifiedBenefits,
      real_use_cases: codeAnalysis.realUseCases,
    };
  }

  /**
   * Realiza análise profunda do código real - NOVO MÉTODO
   */
  performRealCodeAnalysis(feature) {
    const components = feature.components || [];
    const analysis = {
      summary: "",
      componentsDetail: "",
      schemas: "",
      hooksDetail: "",
      dependencies: "",
      businessRules: "",
      uiAnalysis: "",
      realFeatures: "",
      uiFlows: "",
      validations: "",
      filters: "",
      implementationSummary: "",
      complexityAnalysis: "",
      implementedFeaturesList: "",
      techStack: "",
      qualityMetrics: "",
      developmentTime: "",
      implementationOverview: "",
      functionalityDetail: "",
      interfaceDetail: "",
      technologiesUsed: "",
      identifiedBenefits: "",
      realUseCases: "",
    };

    // 1. ANÁLISE DE COMPONENTES REAIS
    if (components.length > 0) {
      analysis.componentsDetail = components
        .map((comp) => {
          let detail = `**${comp.name}** (${comp.type}):\n`;

          // Props reais
          if (comp.props && comp.props.length > 0) {
            detail += `- Props: ${comp.props.map((p) => `${p.name}: ${p.type || "any"}`).join(", ")}\n`;
          }

          // Hooks reais
          if (comp.hooks && comp.hooks.length > 0) {
            detail += `- Hooks utilizados: ${comp.hooks.map((h) => h.name || h).join(", ")}\n`;
          }

          // Imports reais (dependências)
          if (comp.imports && comp.imports.length > 0) {
            const external = comp.imports.filter((imp) => {
              const importStr =
                typeof imp === "string" ? imp : imp.source || imp.from || "";
              return (
                importStr &&
                !importStr.startsWith(".") &&
                !importStr.startsWith("/")
              );
            });
            if (external.length > 0) {
              detail += `- Dependências: ${external.map((imp) => (typeof imp === "string" ? imp : imp.source || imp.from || "")).join(", ")}\n`;
            }
          }

          return detail;
        })
        .join("\n");

      // Summary
      analysis.summary = `Feature implementa ${components.length} componente(s) React/TypeScript com arquitetura baseada em hooks e componentes funcionais.`;
    }

    // 2. ANÁLISE DE SCHEMAS/VALIDAÇÕES
    const schemasFound = components.flatMap((c) => c.schemas || []);
    if (schemasFound.length > 0) {
      analysis.schemas = schemasFound
        .map(
          (schema) =>
            `**${schema.name}**: ${JSON.stringify(schema.fields || schema, null, 2)}`
        )
        .join("\n\n");
    }

    // 3. ANÁLISE DE HOOKS
    const allHooks = [...new Set(components.flatMap((c) => c.hooks || []))];
    if (allHooks.length > 0) {
      analysis.hooksDetail = allHooks
        .map((hook) => {
          const hookName = hook.name || hook;
          return `- ${hookName}: ${this.describeHookPurpose(hookName)}`;
        })
        .join("\n");
    }

    // 4. ANÁLISE DE DEPENDÊNCIAS
    const allDeps = [
      ...new Set(
        components.flatMap((c) =>
          (c.imports || [])
            .filter((imp) => {
              const importStr =
                typeof imp === "string" ? imp : imp.source || imp.from || "";
              return (
                importStr &&
                !importStr.startsWith(".") &&
                !importStr.startsWith("/")
              );
            })
            .map((imp) =>
              typeof imp === "string" ? imp : imp.source || imp.from || ""
            )
        )
      ),
    ];
    if (allDeps.length > 0) {
      analysis.dependencies = allDeps.map((dep) => `- ${dep}`).join("\n");
      analysis.technologiesUsed = allDeps.join(", ");
    }

    // 5. ANÁLISE DE REGRAS DE NEGÓCIO
    analysis.businessRules = this.extractBusinessRules(components);

    // 6. ANÁLISE DE INTERFACE/UX
    analysis.uiAnalysis = this.analyzeUserInterface(components);

    // 7. FUNCIONALIDADES IMPLEMENTADAS
    analysis.realFeatures = this.identifyImplementedFeatures(components);
    analysis.implementedFeaturesList = analysis.realFeatures;

    // 8. FLUXOS DE UI
    analysis.uiFlows = this.extractUIFlows(components);

    // 9. VALIDAÇÕES
    analysis.validations = this.extractValidations(components);

    // 10. FILTROS
    analysis.filters = this.extractFilters(components);

    // 11. ANÁLISE DE IMPLEMENTAÇÃO
    analysis.implementationSummary = this.createImplementationSummary(
      feature,
      components
    );
    analysis.implementationOverview = analysis.implementationSummary;

    // 12. COMPLEXIDADE
    analysis.complexityAnalysis = this.analyzeRealComplexity(components);

    // 13. TECH STACK
    analysis.techStack = this.buildTechStack(components);

    // 14. MÉTRICAS DE QUALIDADE
    analysis.qualityMetrics = this.calculateQualityMetrics(components);

    // 15. TEMPO DE DESENVOLVIMENTO
    analysis.developmentTime = this.estimateDevelopmentTime(components);

    // 16. DETALHES FUNCIONAIS
    analysis.functionalityDetail = this.analyzeFunctionality(components);

    // 17. DETALHES DA INTERFACE
    analysis.interfaceDetail = this.analyzeInterfaceDetails(components);

    // 18. BENEFÍCIOS IDENTIFICADOS
    analysis.identifiedBenefits = this.identifyBenefits(components);

    // 19. CASOS DE USO REAIS
    analysis.realUseCases = this.identifyRealUseCases(components);

    return analysis;
  }

  /**
   * Substitui placeholders no template
   */
  fillTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, value || "");
    }
    return result;
  }

  // ============= MÉTODOS AUXILIARES DE ANÁLISE DE CÓDIGO REAL =============

  describeHookPurpose(hookName) {
    const hookDescriptions = {
      useForm: "Gerenciamento de formulários com React Hook Form",
      useTranslation: "Internacionalização de texto",
      useEffect: "Efeitos colaterais e ciclo de vida",
      useState: "Estado local do componente",
      useMemo: "Memoização de valores computados",
      useCallback: "Memoização de funções",
      useContext: "Acesso a Context API",
      useQuery: "Consultas de dados com React Query",
      useMutation: "Mutações de dados",
      useRouter: "Navegação e roteamento",
      useReactTable: "Funcionalidades de tabela avançadas",
    };
    return hookDescriptions[hookName] || "Hook customizado da aplicação";
  }

  extractBusinessRules(components) {
    const rules = [];

    components.forEach((comp) => {
      // Análise de validações
      if (comp.schemas) {
        comp.schemas.forEach((schema) => {
          if (schema.validations) {
            rules.push(
              `Validação em ${comp.name}: ${JSON.stringify(schema.validations)}`
            );
          }
        });
      }

      // Análise de props que indicam regras
      if (comp.props) {
        const ruleProps = comp.props.filter(
          (p) =>
            p.name.includes("required") ||
            p.name.includes("min") ||
            p.name.includes("max") ||
            p.name.includes("validation")
        );
        if (ruleProps.length > 0) {
          rules.push(
            `${comp.name} tem regras: ${ruleProps.map((p) => p.name).join(", ")}`
          );
        }
      }
    });

    return rules.length > 0
      ? rules.join("\n")
      : "Regras de negócio identificadas na validação de formulários e props de componentes.";
  }

  analyzeUserInterface(components) {
    const uiElements = [];

    components.forEach((comp) => {
      if (comp.name.toLowerCase().includes("modal")) {
        uiElements.push(
          `${comp.name}: Modal/Dialog para interação com usuário`
        );
      }
      if (comp.name.toLowerCase().includes("toolbar")) {
        uiElements.push(
          `${comp.name}: Barra de ferramentas com filtros e ações`
        );
      }
      if (comp.name.toLowerCase().includes("table")) {
        uiElements.push(`${comp.name}: Tabela de dados com paginação`);
      }
      if (comp.name.toLowerCase().includes("form")) {
        uiElements.push(`${comp.name}: Formulário de entrada de dados`);
      }
      if (comp.name.toLowerCase().includes("button")) {
        uiElements.push(`${comp.name}: Botão para ação do usuário`);
      }
    });

    return uiElements.length > 0
      ? uiElements.join("\n")
      : "Interface com componentes React padrão.";
  }

  identifyImplementedFeatures(components) {
    const features = [];

    if (components.some((c) => c.name.toLowerCase().includes("modal"))) {
      features.push("Sistema de modais/dialogs");
    }
    if (components.some((c) => c.name.toLowerCase().includes("table"))) {
      features.push("Tabela de dados com paginação");
    }
    if (components.some((c) => c.name.toLowerCase().includes("toolbar"))) {
      features.push("Filtros e busca");
    }
    if (components.some((c) => c.name.toLowerCase().includes("form"))) {
      features.push("Formulários de entrada");
    }
    if (components.some((c) => c.hooks?.includes("useForm"))) {
      features.push("Validação de formulários");
    }

    return features.length > 0
      ? features.join(", ")
      : "Funcionalidades de interface de usuário padrão";
  }

  extractUIFlows(components) {
    const flows = [];

    const hasModal = components.some((c) =>
      c.name.toLowerCase().includes("modal")
    );
    const hasTable = components.some((c) =>
      c.name.toLowerCase().includes("table")
    );
    const hasToolbar = components.some((c) =>
      c.name.toLowerCase().includes("toolbar")
    );

    if (hasToolbar && hasTable) {
      flows.push("1. Usuário usa toolbar para filtrar/buscar");
      flows.push("2. Tabela exibe resultados filtrados");
    }

    if (hasTable && hasModal) {
      flows.push("3. Usuário clica em ação na tabela");
      flows.push("4. Modal abre para edição/criação");
    }

    return flows.length > 0
      ? flows.join("\n")
      : "Fluxos padrão de interface React";
  }

  extractValidations(components) {
    const validations = [];

    components.forEach((comp) => {
      if (comp.hooks?.includes("useForm")) {
        validations.push(`${comp.name}: Validação via React Hook Form`);
      }

      if (comp.schemas) {
        comp.schemas.forEach((schema) => {
          validations.push(
            `Schema ${schema.name}: Validação de dados estruturada`
          );
        });
      }

      const validationProps = (comp.props || []).filter(
        (p) =>
          p.name.includes("validation") ||
          p.name.includes("error") ||
          p.name === "required"
      );

      if (validationProps.length > 0) {
        validations.push(
          `${comp.name}: Props de validação - ${validationProps.map((p) => p.name).join(", ")}`
        );
      }
    });

    return validations.length > 0
      ? validations.join("\n")
      : "Validações implementadas nos formulários";
  }

  extractFilters(components) {
    const filters = [];

    components.forEach((comp) => {
      if (
        comp.name.toLowerCase().includes("filter") ||
        comp.name.toLowerCase().includes("toolbar")
      ) {
        const filterProps = (comp.props || []).filter(
          (p) =>
            p.name.includes("filter") ||
            p.name.includes("search") ||
            p.name.includes("sort")
        );

        if (filterProps.length > 0) {
          filters.push(
            `${comp.name}: ${filterProps.map((p) => p.name).join(", ")}`
          );
        } else {
          filters.push(`${comp.name}: Sistema de filtros implementado`);
        }
      }
    });

    return filters.length > 0
      ? filters.join("\n")
      : "Filtros disponíveis conforme implementação";
  }

  createImplementationSummary(feature, components) {
    const summary = [];
    summary.push(
      `Feature ${feature.name} implementada com ${components.length} componente(s) React/TypeScript`
    );

    const techFeatures = [];
    if (components.some((c) => c.hooks?.includes("useForm"))) {
      techFeatures.push("formulários controlados");
    }
    if (components.some((c) => c.name.toLowerCase().includes("table"))) {
      techFeatures.push("tabelas de dados");
    }
    if (components.some((c) => c.name.toLowerCase().includes("modal"))) {
      techFeatures.push("modais interativos");
    }

    if (techFeatures.length > 0) {
      summary.push(`Inclui: ${techFeatures.join(", ")}`);
    }

    return summary.join(". ");
  }

  analyzeRealComplexity(components) {
    const factors = [];

    // Análise de complexidade baseada em evidências reais
    const totalComponents = components.length;
    if (totalComponents > 5) factors.push("múltiplos componentes");

    const hasHooks = components.some((c) => c.hooks && c.hooks.length > 3);
    if (hasHooks) factors.push("uso intensivo de hooks");

    const hasComplexProps = components.some(
      (c) => c.props && c.props.length > 5
    );
    if (hasComplexProps) factors.push("interfaces complexas");

    const hasSchemas = components.some(
      (c) => c.schemas && c.schemas.length > 0
    );
    if (hasSchemas) factors.push("validação estruturada");

    let level = "baixa";
    if (factors.length > 2) level = "média";
    if (factors.length > 4) level = "alta";

    return `Complexidade ${level}. Fatores: ${factors.join(", ")}`;
  }

  buildTechStack(components) {
    const technologies = new Set();

    technologies.add("React 18");
    technologies.add("TypeScript");

    components.forEach((comp) => {
      if (comp.hooks?.includes("useForm")) technologies.add("React Hook Form");
      if (comp.hooks?.includes("useTranslation"))
        technologies.add("React i18next");
      if (comp.hooks?.includes("useReactTable"))
        technologies.add("TanStack Table");
      if (comp.hooks?.includes("useQuery")) technologies.add("React Query");

      (comp.imports || []).forEach((imp) => {
        const importStr =
          typeof imp === "string" ? imp : imp.source || imp.from || "";
        if (importStr.includes("zod")) technologies.add("Zod");
        if (importStr.includes("framer-motion"))
          technologies.add("Framer Motion");
        if (importStr.includes("lucide")) technologies.add("Lucide React");
      });
    });

    return Array.from(technologies).join(", ");
  }

  calculateQualityMetrics(components) {
    const metrics = [];

    // TypeScript usage
    if (components.every((c) => c.type === "react" || c.hasTypes)) {
      metrics.push("100% TypeScript");
    }

    // Hooks usage (indica código moderno)
    const hookUsage = components.filter(
      (c) => c.hooks && c.hooks.length > 0
    ).length;
    const hookPercentage = Math.round((hookUsage / components.length) * 100);
    metrics.push(`${hookPercentage}% usa hooks modernos`);

    // Component modularity
    if (components.length > 1) {
      metrics.push("Arquitetura modular");
    }

    return metrics.join(", ");
  }

  estimateDevelopmentTime(components) {
    // Estimativa baseada na complexidade real dos componentes
    let totalHours = 0;

    components.forEach((comp) => {
      let compHours = 4; // Base para componente simples

      if (comp.props && comp.props.length > 5) compHours += 2;
      if (comp.hooks && comp.hooks.length > 3) compHours += 3;
      if (comp.schemas) compHours += 2;
      if (comp.name.toLowerCase().includes("modal")) compHours += 2;
      if (comp.name.toLowerCase().includes("table")) compHours += 4;

      totalHours += compHours;
    });

    const days = Math.ceil(totalHours / 8);
    return `Estimativa: ${totalHours}h (${days} dias) baseado na complexidade implementada`;
  }

  analyzeFunctionality(components) {
    const functionalities = [];

    components.forEach((comp) => {
      if (comp.name.toLowerCase().includes("modal")) {
        functionalities.push(`${comp.name}: Criação/edição via modal`);
      }
      if (comp.name.toLowerCase().includes("table")) {
        functionalities.push(`${comp.name}: Listagem e visualização de dados`);
      }
      if (comp.name.toLowerCase().includes("toolbar")) {
        functionalities.push(`${comp.name}: Filtros e busca de dados`);
      }
      if (comp.name.toLowerCase().includes("form")) {
        functionalities.push(`${comp.name}: Entrada e validação de dados`);
      }
    });

    return functionalities.join("\n");
  }

  analyzeInterfaceDetails(components) {
    const details = [];

    const modals = components.filter((c) =>
      c.name.toLowerCase().includes("modal")
    );
    const tables = components.filter((c) =>
      c.name.toLowerCase().includes("table")
    );
    const toolbars = components.filter((c) =>
      c.name.toLowerCase().includes("toolbar")
    );

    if (modals.length > 0) {
      details.push(`${modals.length} modal(s) para interação`);
    }
    if (tables.length > 0) {
      details.push(`${tables.length} tabela(s) de dados`);
    }
    if (toolbars.length > 0) {
      details.push(`${toolbars.length} toolbar(s) de filtros`);
    }

    return details.length > 0
      ? details.join(", ")
      : "Interface implementada com componentes React padrão";
  }

  identifyBenefits(components) {
    const benefits = [];

    if (components.some((c) => c.hooks?.includes("useForm"))) {
      benefits.push("Validação robusta de formulários");
    }
    if (components.some((c) => c.name.toLowerCase().includes("table"))) {
      benefits.push("Organização eficiente de dados");
    }
    if (components.some((c) => c.name.toLowerCase().includes("filter"))) {
      benefits.push("Busca rápida e precisa");
    }
    if (components.some((c) => c.name.toLowerCase().includes("modal"))) {
      benefits.push("Interface intuitiva para edição");
    }

    return benefits.length > 0
      ? benefits.join(", ")
      : "Interface moderna e eficiente";
  }

  identifyRealUseCases(components) {
    const useCases = [];

    const hasModal = components.some((c) =>
      c.name.toLowerCase().includes("modal")
    );
    const hasTable = components.some((c) =>
      c.name.toLowerCase().includes("table")
    );
    const hasFilters = components.some(
      (c) =>
        c.name.toLowerCase().includes("toolbar") ||
        c.name.toLowerCase().includes("filter")
    );

    if (hasModal && hasTable) {
      useCases.push("Criar/editar registros via modal");
    }
    if (hasFilters && hasTable) {
      useCases.push("Buscar e filtrar dados na tabela");
    }
    if (hasTable) {
      useCases.push("Visualizar listagem paginada");
    }
    if (hasModal) {
      useCases.push("Confirmar ações importantes");
    }

    return useCases.length > 0
      ? useCases.join(", ")
      : "Casos de uso padrão de CRUD";
  }

  calculateOverallComplexity(components) {
    if (!components.length) return "baixa";

    const complexities = components.map((c) => c.complexity || "low");
    const highCount = complexities.filter((c) => c === "high").length;
    const mediumCount = complexities.filter((c) => c === "medium").length;

    if (highCount > 0) return "alta";
    if (mediumCount > components.length / 2) return "média";
    return "baixa";
  }

  extractUIElements(components) {
    const elements = new Set();
    components.forEach((component) => {
      if (component.uiElements) {
        component.uiElements.forEach((el) => elements.add(el.type));
      }
    });
    return Array.from(elements);
  }

  inferCapabilities(feature) {
    const components = feature.components || [];
    const capabilities = [];

    if (components.some((c) => c.name.toLowerCase().includes("modal"))) {
      capabilities.push("Modais e diálogos");
    }
    if (
      components.some(
        (c) =>
          c.name.toLowerCase().includes("table") ||
          c.name.toLowerCase().includes("list")
      )
    ) {
      capabilities.push("Listagem de dados");
    }
    if (components.some((c) => c.name.toLowerCase().includes("form"))) {
      capabilities.push("Formulários");
    }
    if (
      components.some(
        (c) =>
          c.name.toLowerCase().includes("toolbar") ||
          c.name.toLowerCase().includes("filter")
      )
    ) {
      capabilities.push("Filtros e busca");
    }

    return capabilities.join(", ") || "Funcionalidades gerais do sistema";
  }

  /**
   * Gera documentação básica sem IA
   */
  async generateBasicDoc(feature, options, template = null) {
    const content = this.generateBasicContent(feature, template);

    const outputPath = path.join(
      options.outputPath || "./docs/features",
      feature.name
    );
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const filename = template?.filename || `${feature.name}.md`;
    const filePath = path.join(outputPath, filename);
    fs.writeFileSync(filePath, content, "utf8");

    return {
      success: true,
      filePath,
      content,
    };
  }

  generateBasicContent(feature, template) {
    const templateName = template?.name || "Documentação";

    let content = `# ${feature.name} - ${templateName}\n\n`;
    content += `> Documentação da feature ${feature.name}\n\n`;
    content += `**Última atualização:** ${new Date().toLocaleDateString("pt-BR")}\n\n`;

    // Resumo da feature
    content += `## 📋 Resumo\n\n`;
    content += `Esta feature contém ${feature.components?.length || 0} componentes `;
    content += `e está localizada no diretório \`${feature.path}\`.\n\n`;

    if (feature.components && feature.components.length > 0) {
      content += `## 🧩 Componentes (${feature.components.length})\n\n`;

      feature.components.forEach((comp) => {
        content += `### ${comp.name}\n`;
        content += `- **Tipo:** ${comp.type}\n`;
        content += `- **Arquivo:** \`${comp.path}\`\n`;

        if (comp.props && comp.props.length > 0) {
          content += `- **Props:** ${comp.props.length} propriedades\n`;
          content += `  - ${comp.props
            .slice(0, 3)
            .map((p) => `\`${p.name}\``)
            .join(", ")}`;
          if (comp.props.length > 3)
            content += ` e mais ${comp.props.length - 3}`;
          content += `\n`;
        }

        if (comp.hooks && comp.hooks.length > 0) {
          content += `- **Hooks:** ${comp.hooks.map((h) => `\`${h.name || h}\``).join(", ")}\n`;
        }

        if (comp.imports && comp.imports.length > 0) {
          const externalImports = comp.imports.filter(
            (i) => i.type === "external"
          ).length;
          const internalImports = comp.imports.filter(
            (i) => i.type === "internal"
          ).length;
          if (externalImports > 0 || internalImports > 0) {
            content += `- **Dependências:** ${externalImports} externas, ${internalImports} internas\n`;
          }
        }

        content += "\n";
      });

      // Seção de análise técnica
      content += `## 🔍 Análise Técnica\n\n`;

      // Estatísticas gerais
      const totalProps = feature.components.reduce(
        (acc, comp) => acc + (comp.props?.length || 0),
        0
      );
      const totalHooks = feature.components.reduce(
        (acc, comp) => acc + (comp.hooks?.length || 0),
        0
      );

      content += `### Métricas\n`;
      content += `- **Total de propriedades:** ${totalProps}\n`;
      content += `- **Total de hooks:** ${totalHooks}\n`;
      content += `- **Componentes com testes:** ${feature.components.filter((c) => c.name.includes(".test")).length}\n\n`;

      // Padrões detectados
      const hooksUsed = [
        ...new Set(
          feature.components
            .filter((c) => c.hooks)
            .flatMap((c) => c.hooks.map((h) => h.name || h))
        ),
      ];

      if (hooksUsed.length > 0) {
        content += `### Hooks Utilizados\n`;
        hooksUsed.forEach((hook) => {
          const count = feature.components.filter((c) =>
            c.hooks?.some((h) => (h.name || h) === hook)
          ).length;
          content += `- \`${hook}\` (${count} componente${count > 1 ? "s" : ""})\n`;
        });
        content += `\n`;
      }
    }

    // Nota sobre IA
    content += `---\n\n`;
    content += `💡 **Dica:** Para documentação mais detalhada e contextualizada, `;
    content += `configure a integração OpenAI seguindo o guia em \`SETUP_OPENAI.md\`.\n`;

    return content;
  }
  async generateForFeature(feature, options = {}) {
    try {
      const documentation = await this.generateFeatureDoc(feature, options);

      // Salvar arquivos no sistema
      const outputPath = options.outputPath || "./docs/features";
      const featureOutputPath = path.join(outputPath, feature.name);

      // Criar diretório da feature
      if (!fs.existsSync(featureOutputPath)) {
        fs.mkdirSync(featureOutputPath, { recursive: true });
      }

      const savedFiles = [];
      let documentsGenerated = 0;

      // Salvar cada arquivo
      for (const file of documentation.files) {
        const fullPath = path.join(featureOutputPath, path.basename(file.path));
        fs.writeFileSync(fullPath, file.content, "utf8");
        savedFiles.push(fullPath);
        documentsGenerated++;
        console.log(`✅ Arquivo gerado: ${fullPath}`);
      }

      return {
        name: feature.name,
        documentsGenerated,
        savedFiles,
        outputPath: featureOutputPath,
        success: true,
      };
    } catch (error) {
      console.error(
        `❌ Erro ao gerar documentação para ${feature.name}:`,
        error.message
      );
      return {
        name: feature.name,
        documentsGenerated: 0,
        savedFiles: [],
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Gera metadados da documentação
   */
  generateMetadata(feature) {
    return {
      name: feature.name,
      title: this.formatTitle(feature.name),
      description:
        feature.description || `Documentação da feature ${feature.name}`,
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      components: feature.components ? feature.components.length : 0,
      pages: feature.pages ? feature.pages.length : 0,
      hooks: feature.hooks ? feature.hooks.length : 0,
    };
  }

  /**
   * Gera conteúdo da documentação
   */
  async generateContent(feature, config) {
    // Garantir que templates existem
    if (!this.templates || !this.templates.templates) {
      console.warn(
        "⚠️ Templates não carregados, usando template padrão simples"
      );
      return await this.generateSimpleContent(feature, config);
    }

    const template =
      this.templates.templates[config.template] ||
      this.templates.templates.standard;

    if (!template || !template.audiences) {
      console.warn("⚠️ Template inválido, usando template padrão simples");
      return await this.generateSimpleContent(feature, config);
    }

    const audienceConfig =
      template.audiences[config.audience] || template.audiences.developer;

    const content = {};

    for (const sectionName of audienceConfig.sections) {
      const section = this.templates.sections[sectionName];
      if (section) {
        content[sectionName] = await this.generateSection(
          sectionName,
          feature,
          config
        );
      }
    }

    return content;
  }

  /**
   * Gera conteúdo simples quando templates não estão disponíveis
   */
  async generateSimpleContent(feature, config) {
    const content = {
      overview: this.generateOverviewSection(feature),
      components: this.generateComponentsSection(feature.components || []),
      hooks: this.generateHooksSection(feature.hooks || []),
      services: this.generateServicesSection(feature.services || []),
      types: this.generateTypesSection(feature.types || []),
      architecture: this.generateArchitectureSection(feature),
      examples: this.generateExamplesSection(feature),
      testing: this.generateTestingSection(feature),
    };

    // Tentar melhorar com IA se disponível
    if (config.ai && config.ai.enabled) {
      console.log("🤖 Melhorando documentação com IA...");
      try {
        const enhancedContent = await this.enhanceWithAI(
          content,
          feature,
          config
        );
        return enhancedContent || content;
      } catch (error) {
        console.warn("⚠️ Erro na IA, usando conteúdo padrão:", error.message);
      }
    }

    return content;
  }

  /**
   * Melhora conteúdo usando OpenAI
   */
  async enhanceWithAI(content, feature, config) {
    const openai = await this.getOpenAIClient(config);
    if (!openai) return null;

    const prompt = this.buildPromptForFeature(feature, content);

    try {
      const response = await openai.chat.completions.create({
        model: config.ai.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em documentação técnica. Analise a feature e seus componentes para gerar documentação clara e útil em português brasileiro.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: config.ai.maxTokens || 2000,
        temperature: config.ai.temperature || 0.3,
      });

      const aiContent = response.choices[0]?.message?.content;
      if (aiContent) {
        return this.parseAIResponse(aiContent, content);
      }
    } catch (error) {
      console.warn("⚠️ Erro na chamada da OpenAI:", error.message);
    }

    return null;
  }

  /**
   * Obtém cliente OpenAI
   */
  async getOpenAIClient(config = {}) {
    try {
      // Tentar importar OpenAI de forma compatível com Node.js mais antigo
      let OpenAI;
      try {
        OpenAI =
          require("openai").default ||
          require("openai").OpenAI ||
          require("openai");
      } catch (e) {
        // Fallback para versões mais antigas
        const openaiModule = require("openai");
        OpenAI = openaiModule.default || openaiModule.OpenAI || openaiModule;
      }

      const apiKey = config.ai?.apiKey || process.env.OPENAI_API_KEY;

      if (!apiKey) {
        console.warn("⚠️ API Key da OpenAI não encontrada");
        return null;
      }

      // Tentar criar cliente com diferentes configurações
      try {
        return new OpenAI({
          apiKey,
          // Configurações para compatibilidade
          organization: undefined,
          project: undefined,
        });
      } catch (e) {
        console.warn(
          "⚠️ Erro ao criar cliente OpenAI (tentativa 1):",
          e.message
        );

        // Fallback para versões mais antigas
        try {
          return new OpenAI(apiKey);
        } catch (e2) {
          console.warn(
            "⚠️ Erro ao criar cliente OpenAI (tentativa 2):",
            e2.message
          );
          return null;
        }
      }
    } catch (error) {
      console.warn("⚠️ OpenAI não disponível:", error.message);
      return null;
    }
  }

  /**
   * Constrói prompt para a feature
   */
  buildPromptForFeature(feature, content) {
    let prompt = `# Análise da Feature: ${feature.name}\n\n`;

    prompt += `## Informações da Feature:\n`;
    prompt += `- Nome: ${feature.name}\n`;
    prompt += `- Componentes: ${feature.components?.length || 0}\n`;
    prompt += `- Localização: ${feature.path}\n\n`;

    if (feature.components && feature.components.length > 0) {
      prompt += `## Componentes Encontrados:\n`;
      feature.components.slice(0, 5).forEach((comp) => {
        prompt += `### ${comp.name} (${comp.type})\n`;
        prompt += `- Props: ${comp.props?.length || 0}\n`;
        prompt += `- Hooks: ${comp.hooks?.length || 0}\n`;
        prompt += `- Complexidade: ${comp.complexity || "baixa"}\n`;
        if (comp.uiElements && comp.uiElements.length > 0) {
          prompt += `- UI Elements: ${comp.uiElements.map((el) => el.type).join(", ")}\n`;
        }
        prompt += `\n`;
      });
    }

    prompt += `## Tarefa:\n`;
    prompt += `Gere uma documentação clara e útil para esta feature, incluindo:\n`;
    prompt += `1. Descrição da funcionalidade principal\n`;
    prompt += `2. Como usar os componentes\n`;
    prompt += `3. Exemplos práticos\n`;
    prompt += `4. Dicas de implementação\n\n`;
    prompt += `Responda em formato markdown estruturado em português brasileiro.`;

    return prompt;
  }

  /**
   * Analisa resposta da IA e integra com conteúdo existente
   */
  parseAIResponse(aiResponse, originalContent) {
    try {
      // Por enquanto, vamos usar a resposta da IA para melhorar a descrição
      const enhanced = { ...originalContent };

      if (enhanced.overview && enhanced.overview.content) {
        enhanced.overview.content.description =
          aiResponse.substring(0, 500) + "...";
        enhanced.overview.content.aiGenerated = true;
      }

      return enhanced;
    } catch (error) {
      console.warn("⚠️ Erro ao processar resposta da IA:", error.message);
      return originalContent;
    }
  }

  /**
   * Gera uma seção específica da documentação
   */
  async generateSection(sectionName, feature, config) {
    switch (sectionName) {
      case "overview":
        return this.generateOverviewSection(feature);

      case "components":
        return this.generateComponentsSection(feature.components || []);

      case "apis":
        return this.generateApiSection(feature.apis || []);

      case "examples":
        return this.generateExamplesSection(feature);

      case "testing":
        return this.generateTestingSection(feature);

      default:
        return { title: section.title, content: "Seção em desenvolvimento" };
    }
  }

  /**
   * Gera seção de visão geral
   */
  generateOverviewSection(feature) {
    return {
      title: "Visão Geral",
      content: {
        description:
          feature.description ||
          `A feature ${feature.name} fornece funcionalidades essenciais para o sistema.`,
        purpose:
          feature.purpose ||
          "Gerenciar e organizar funcionalidades específicas do sistema.",
        architecture: this.describeArchitecture(feature),
        dependencies: feature.dependencies || [],
        structure: this.describeStructure(feature),
      },
    };
  }

  /**
   * Gera seção de componentes
   */
  generateComponentsSection(components) {
    const componentDocs = components.map((component) => ({
      name: component.name,
      type: component.type,
      description:
        component.description || this.generateComponentDescription(component),
      props: component.props || [],
      hooks: component.hooks || [],
      methods: component.methods || [],
      examples: this.generateComponentExamples(component),
      complexity: component.complexity,
      uiElements: component.uiElements || [],
    }));

    return {
      title: "Componentes",
      content: {
        overview: `Esta feature contém ${components.length} componente(s).`,
        components: componentDocs,
        diagram: this.generateComponentDiagram(components),
      },
    };
  }

  /**
   * Gera seção de APIs
   */
  generateApiSection(apis) {
    return {
      title: "APIs",
      content: {
        endpoints: apis,
        authentication: "Token JWT necessário para endpoints protegidos",
        rateLimit: "Limite de 1000 requisições por hora",
        examples: this.generateApiExamples(apis),
      },
    };
  }

  /**
   * Gera seção de exemplos
   */
  generateExamplesSection(feature) {
    return {
      title: "Exemplos de Uso",
      content: {
        basic: this.generateBasicExamples(feature),
        advanced: this.generateAdvancedExamples(feature),
        integration: this.generateIntegrationExamples(feature),
      },
    };
  }

  /**
   * Gera seção de testes
   */
  generateTestingSection(feature) {
    return {
      title: "Testes",
      content: {
        overview: "Estratégias e exemplos de teste para esta feature",
        unitTests: this.generateUnitTestExamples(feature),
        integrationTests: this.generateIntegrationTestExamples(feature),
        e2eTests: this.generateE2ETestExamples(feature),
      },
    };
  }

  /**
   * Renderiza template final
   */
  async renderTemplate(documentation, config) {
    switch (config.format) {
      case "markdown":
        return this.renderMarkdown(documentation);
      case "html":
        return this.renderHtml(documentation);
      case "json":
        return JSON.stringify(documentation, null, 2);
      default:
        return this.renderMarkdown(documentation);
    }
  }

  /**
   * Renderiza documentação em Markdown
   */
  renderMarkdown(documentation) {
    const { metadata, content } = documentation;

    let markdown = `# ${metadata.title}\n\n`;
    markdown += `> ${metadata.description}\n\n`;
    markdown += `**Última atualização:** ${new Date(metadata.lastUpdated).toLocaleDateString("pt-BR")}\n\n`;

    if (metadata.components > 0) {
      markdown += `📊 **Estatísticas:**\n`;
      markdown += `- Componentes: ${metadata.components}\n`;
      markdown += `- Páginas: ${metadata.pages}\n`;
      markdown += `- Hooks: ${metadata.hooks}\n\n`;
    }

    markdown += `---\n\n`;

    // Renderizar cada seção
    for (const [sectionName, section] of Object.entries(content)) {
      markdown += this.renderMarkdownSection(sectionName, section);
    }

    return markdown;
  }

  /**
   * Renderiza seção em Markdown
   */
  renderMarkdownSection(sectionName, section) {
    let markdown = `## ${section.title}\n\n`;

    switch (sectionName) {
      case "overview":
        markdown += `${section.content.description}\n\n`;
        if (section.content.purpose) {
          markdown += `### Objetivo\n${section.content.purpose}\n\n`;
        }
        break;

      case "components":
        markdown += `${section.content.overview}\n\n`;
        for (const component of section.content.components) {
          markdown += `### ${component.name}\n\n`;
          markdown += `**Tipo:** ${component.type}\n\n`;
          markdown += `${component.description}\n\n`;

          if (component.props.length > 0) {
            markdown += `**Props:**\n\n`;
            markdown += `| Nome | Tipo | Obrigatório | Descrição |\n`;
            markdown += `|------|------|-------------|------------|\n`;
            for (const prop of component.props) {
              markdown += `| ${prop.name} | ${prop.type} | ${prop.optional ? "Não" : "Sim"} | ${prop.description || "-"} |\n`;
            }
            markdown += `\n`;
          }

          if (component.hooks && component.hooks.length > 0) {
            markdown += `**Hooks utilizados:**\n`;
            for (const hook of component.hooks) {
              const hookName = typeof hook === "string" ? hook : hook.name;
              const hookType =
                typeof hook === "object" && hook.type ? ` (${hook.type})` : "";
              markdown += `- \`${hookName}\`${hookType}\n`;
            }
            markdown += `\n`;
          }

          if (component.uiElements && component.uiElements.length > 0) {
            markdown += `**Elementos UI detectados:**\n`;
            for (const element of component.uiElements) {
              markdown += `- ${element.type}: ${element.confidence}% de confiança\n`;
            }
            markdown += `\n`;
          }
        }
        break;

      case "hooks":
        if (typeof section.content === "string") {
          markdown += `${section.content}\n\n`;
        } else {
          markdown += `${section.content.overview}\n\n`;
          if (section.content.hooks) {
            for (const hook of section.content.hooks) {
              markdown += `### ${hook.name}\n\n`;
              markdown += `${hook.description}\n\n`;
              if (hook.example) {
                markdown += `**Exemplo de uso:**\n\`\`\`tsx\n${hook.example}\n\`\`\`\n\n`;
              }
            }
          }
        }
        break;

      case "services":
        if (typeof section.content === "string") {
          markdown += `${section.content}\n\n`;
        } else {
          markdown += `${section.content.overview}\n\n`;
          if (section.content.services) {
            for (const service of section.content.services) {
              markdown += `### ${service.name}\n\n`;
              markdown += `${service.description}\n\n`;
            }
          }
        }
        break;

      case "types":
        if (typeof section.content === "string") {
          markdown += `${section.content}\n\n`;
        } else {
          markdown += `${section.content.overview}\n\n`;
          if (section.content.types) {
            for (const type of section.content.types) {
              markdown += `### ${type.name}\n\n`;
              markdown += `${type.description}\n\n`;
            }
          }
        }
        break;

      case "architecture":
        if (typeof section.content === "string") {
          markdown += `${section.content}\n\n`;
        } else {
          markdown += `${section.content}\n\n`;
        }
        break;

      case "examples":
        markdown += `### Exemplos Básicos\n${section.content.basic}\n\n`;
        markdown += `### Exemplos Avançados\n${section.content.advanced}\n\n`;
        markdown += `### Integração\n${section.content.integration}\n\n`;
        break;

      case "testing":
        markdown += `### Testes Unitários\n${section.content.unitTests}\n\n`;
        markdown += `### Testes de Integração\n${section.content.integrationTests}\n\n`;
        markdown += `### Testes E2E\n${section.content.e2eTests}\n\n`;
        break;

      default:
        if (typeof section.content === "string") {
          markdown += `${section.content}\n\n`;
        } else {
          markdown += `_Seção em desenvolvimento_\n\n`;
        }
    }

    return markdown;
  }

  /**
   * Utilitários
   */
  formatTitle(name) {
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  getFileName(featureName, format) {
    const extension = format === "markdown" ? "md" : format;
    return `${featureName}.${extension}`;
  }

  describeArchitecture(feature) {
    if (feature.components && feature.components.length > 0) {
      const types = [...new Set(feature.components.map((c) => c.type))];
      return `Arquitetura baseada em componentes ${types.join(", ")}`;
    }
    return "Arquitetura modular";
  }

  describeStructure(feature) {
    const structure = [];
    if (feature.components)
      structure.push(`${feature.components.length} componentes`);
    if (feature.pages) structure.push(`${feature.pages.length} páginas`);
    if (feature.hooks) structure.push(`${feature.hooks.length} hooks`);
    return structure.join(", ");
  }

  generateComponentDescription(component) {
    let desc = `Componente ${component.type}`;
    if (component.props && component.props.length > 0) {
      desc += ` com ${component.props.length} propriedade(s)`;
    }
    if (component.hooks && component.hooks.length > 0) {
      desc += ` e ${component.hooks.length} hook(s)`;
    }
    return desc + ".";
  }

  generateComponentExamples(component) {
    // Gera exemplos básicos baseados nas props
    return [`// Exemplo de uso do ${component.name}`, `<${component.name} />`];
  }

  generateComponentDiagram(components) {
    // Gera diagrama simples de componentes
    return components.map((c) => `[${c.name}]`).join(" -> ");
  }

  generateApiExamples(apis) {
    return apis.map((api) => ({
      endpoint: api.endpoint,
      method: api.method,
      example: `curl -X ${api.method} ${api.endpoint}`,
    }));
  }

  generateBasicExamples(feature) {
    return `Exemplo básico de uso da feature ${feature.name}`;
  }

  generateAdvancedExamples(feature) {
    return `Exemplos avançados para casos complexos`;
  }

  generateIntegrationExamples(feature) {
    return `Como integrar ${feature.name} com outras features`;
  }

  generateUnitTestExamples(feature) {
    return `Exemplos de testes unitários para ${feature.name}`;
  }

  generateIntegrationTestExamples(feature) {
    return `Testes de integração recomendados`;
  }

  generateE2ETestExamples(feature) {
    return `Cenários end-to-end para validação`;
  }

  /**
   * Gera seção de hooks
   */
  generateHooksSection(hooks) {
    if (!hooks || hooks.length === 0) {
      return {
        title: "Hooks",
        content: "Nenhum hook customizado encontrado nesta feature.",
      };
    }

    return {
      title: "Hooks Customizados",
      content: {
        overview: `Esta feature implementa ${hooks.length} hook(s) customizado(s).`,
        hooks: hooks.map((hook) => ({
          name: hook.name,
          description: hook.description || `Hook customizado ${hook.name}`,
          parameters: hook.parameters || [],
          returns: hook.returns || "unknown",
          example: hook.example || `const result = ${hook.name}();`,
        })),
      },
    };
  }

  /**
   * Gera seção de serviços
   */
  generateServicesSection(services) {
    if (!services || services.length === 0) {
      return {
        title: "Serviços",
        content: "Nenhum serviço específico encontrado nesta feature.",
      };
    }

    return {
      title: "Serviços",
      content: {
        overview: `Esta feature utiliza ${services.length} serviço(s).`,
        services: services.map((service) => ({
          name: service.name,
          description:
            service.description ||
            `Serviço responsável por ${service.name.toLowerCase()}`,
          methods: service.methods || [],
          dependencies: service.dependencies || [],
        })),
      },
    };
  }

  /**
   * Gera seção de tipos
   */
  generateTypesSection(types) {
    if (!types || types.length === 0) {
      return {
        title: "Tipos e Interfaces",
        content: "Esta feature utiliza tipos TypeScript padrão.",
      };
    }

    return {
      title: "Tipos e Interfaces",
      content: {
        overview: `Esta feature define ${types.length} tipo(s)/interface(s) customizada(s).`,
        types: types.map((type) => ({
          name: type.name,
          description: type.description || `Tipo ${type.name}`,
          properties: type.properties || [],
          usage: type.usage || `Como usar o tipo ${type.name}`,
        })),
      },
    };
  }

  /**
   * Gera seção de arquitetura
   */
  generateArchitectureSection(feature) {
    const components = feature.components || [];
    const hooks = feature.hooks || [];
    const services = feature.services || [];

    let architecture = `## Estrutura da Feature\n\n`;

    if (components.length > 0) {
      architecture += `### Componentes (${components.length})\n`;
      architecture += `- **UI Components:** ${components.filter((c) => c.type === "react" || c.type === "vue").length}\n`;
      architecture += `- **Layout Components:** ${components.filter((c) => c.name.toLowerCase().includes("layout")).length}\n`;
      architecture += `- **Form Components:** ${components.filter((c) => c.name.toLowerCase().includes("form") || c.name.toLowerCase().includes("modal")).length}\n\n`;
    }

    if (hooks.length > 0) {
      architecture += `### Hooks (${hooks.length})\n`;
      architecture += `- **Estado:** ${hooks.filter((h) => h.name.includes("State") || h.name.includes("use")).length}\n`;
      architecture += `- **Efeitos:** ${hooks.filter((h) => h.name.includes("Effect")).length}\n\n`;
    }

    architecture += `### Padrões Utilizados\n`;
    architecture += `- **Componentização:** Separação clara de responsabilidades\n`;
    architecture += `- **Hooks Pattern:** Estado e lógica encapsulados\n`;
    architecture += `- **TypeScript:** Tipagem forte para maior confiabilidade\n\n`;

    return {
      title: "Arquitetura",
      content: architecture,
    };
  }

  /**
   * Salva documentação no sistema de arquivos
   */
  async saveDocumentation(documentation, outputPath) {
    const results = {
      generatedFiles: [],
      errors: [],
    };

    // Criar diretório se não existir
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      for (const file of documentation.files) {
        const filePath = file.path;
        const fileDir = path.dirname(filePath);

        // Criar diretório do arquivo
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }

        // Salvar arquivo
        fs.writeFileSync(filePath, file.content);
        results.generatedFiles.push(filePath);

        console.log(`✅ Arquivo gerado: ${filePath}`);
      }
    } catch (error) {
      results.errors.push(`Erro ao salvar arquivo: ${error.message}`);
    }

    return results;
  }
}

module.exports = DocumentationGenerator;
