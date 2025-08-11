const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

class OpenAIDocumentationEnhancer {
  constructor(config) {
    this.config = config;
    this.openai = null;
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY || this.config.openai?.apiKey;

    if (!apiKey) {
      console.warn(
        "⚠️ OpenAI API Key não encontrada. Documentação básica será gerada."
      );
      console.warn("   Configure OPENAI_API_KEY para documentação avançada.");
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      console.log("✅ OpenAI conectado para documentação avançada");
    } catch (error) {
      console.error("❌ Erro ao inicializar OpenAI:", error.message);
    }
  }

  isAvailable() {
    return this.openai !== null;
  }

  async enhanceProjectOverview(basicOverview, projectData) {
    if (!this.isAvailable()) return basicOverview;

    try {
      const prompt = this.buildProjectOverviewPrompt(
        basicOverview,
        projectData
      );
      const enhanced = await this.callOpenAI(prompt, "project-overview");

      return enhanced || basicOverview;
    } catch (error) {
      console.warn("⚠️ Erro ao melhorar visão geral:", error.message);
      return basicOverview;
    }
  }

  async enhanceAPIDocumentation(basicApiDocs, apiData) {
    if (!this.isAvailable()) return basicApiDocs;

    try {
      const prompt = this.buildAPIDocumentationPrompt(basicApiDocs, apiData);
      const enhanced = await this.callOpenAI(prompt, "api-documentation");

      return enhanced || basicApiDocs;
    } catch (error) {
      console.warn("⚠️ Erro ao melhorar documentação de API:", error.message);
      return basicApiDocs;
    }
  }

  async enhanceComponentDocumentation(basicComponentDocs, componentData) {
    if (!this.isAvailable()) return basicComponentDocs;

    try {
      const prompt = this.buildComponentDocumentationPrompt(
        basicComponentDocs,
        componentData
      );
      const enhanced = await this.callOpenAI(prompt, "component-documentation");

      return enhanced || basicComponentDocs;
    } catch (error) {
      console.warn(
        "⚠️ Erro ao melhorar documentação de componentes:",
        error.message
      );
      return basicComponentDocs;
    }
  }

  async enhanceArchitectureDocumentation(basicArchDocs, archData) {
    if (!this.isAvailable()) return basicArchDocs;

    try {
      const prompt = this.buildArchitectureDocumentationPrompt(
        basicArchDocs,
        archData
      );
      const enhanced = await this.callOpenAI(
        prompt,
        "architecture-documentation"
      );

      return enhanced || basicArchDocs;
    } catch (error) {
      console.warn(
        "⚠️ Erro ao melhorar documentação de arquitetura:",
        error.message
      );
      return basicArchDocs;
    }
  }

  buildProjectOverviewPrompt(basicOverview, projectData) {
    return `
Você é um especialista em documentação técnica. Melhore a seguinte documentação de projeto:

## Documentação Básica:
${basicOverview}

## Dados do Projeto:
${JSON.stringify(projectData, null, 2)}

## Instruções:
1. **Mantenha a estrutura original** mas enriqueça o conteúdo
2. **Adicione seções relevantes** como:
   - Descrição do propósito do projeto
   - Principais funcionalidades 
   - Casos de uso
   - Arquitetura geral
   - Como começar (Getting Started)
3. **Use linguagem clara** e profissional
4. **Seja específico** sobre as tecnologias encontradas
5. **Adicione emojis** apropriados para melhor legibilidade
6. **Mantenha o formato Markdown**
7. **Não invente informações** - use apenas o que está nos dados

Retorne apenas o markdown melhorado:
`;
  }

  buildAPIDocumentationPrompt(basicApiDocs, apiData) {
    return `
Você é um especialista em documentação de APIs. Melhore a seguinte documentação:

## Documentação Básica:
${basicApiDocs}

## Dados da API:
${JSON.stringify(apiData, null, 2)}

## Instruções:
1. **Melhore as descrições** dos endpoints
2. **Adicione exemplos** de requests/responses quando possível
3. **Documente parâmetros** de forma mais clara
4. **Adicione seção de autenticação** se relevante
5. **Inclua códigos de erro** comuns
6. **Organize por domínios/recursos**
7. **Adicione seção "Como usar"**
8. **Use formato OpenAPI quando apropriado**

Retorne apenas o markdown melhorado:
`;
  }

  buildComponentDocumentationPrompt(basicComponentDocs, componentData) {
    return `
Você é um especialista em documentação de componentes frontend. Melhore a seguinte documentação:

## Documentação Básica:
${basicComponentDocs}

## Dados dos Componentes:
${JSON.stringify(componentData, null, 2)}

## Instruções:
1. **Melhore as descrições** dos componentes
2. **Adicione exemplos de uso** para cada componente
3. **Documente props** com tipos e valores padrão
4. **Inclua eventos** e seus payloads
5. **Adicione seção de acessibilidade** se relevante
6. **Organize por categoria** (Layout, Forms, etc.)
7. **Inclua melhores práticas**
8. **Adicione stories/playground** quando apropriado

Retorne apenas o markdown melhorado:
`;
  }

  buildArchitectureDocumentationPrompt(basicArchDocs, archData) {
    return `
Você é um arquiteto de software experiente. Melhore a seguinte documentação de arquitetura:

## Documentação Básica:
${basicArchDocs}

## Dados da Arquitetura:
${JSON.stringify(archData, null, 2)}

## Instruções:
1. **Explique os padrões** arquiteturais encontrados
2. **Descreva o fluxo de dados** entre componentes
3. **Documente decisões** de design
4. **Adicione diagramas** em formato Mermaid
5. **Explique estrutura** de pastas e convenções
6. **Inclua dependências críticas**
7. **Adicione seção de performance**
8. **Documente pontos de extensão**

Retorne apenas o markdown melhorado:
`;
  }

  async callOpenAI(prompt, type) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.openai?.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em documentação técnica. Sua tarefa é melhorar documentações existentes, tornando-as mais claras, úteis e profissionais. Sempre mantenha a estrutura original e adicione valor real.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: this.config.openai?.maxTokens || 2000,
        temperature: this.config.openai?.temperature || 0.3,
      });

      const enhanced = response.choices[0]?.message?.content;

      if (enhanced) {
        console.log(`✨ Documentação ${type} melhorada com OpenAI`);
        return enhanced.trim();
      }

      return null;
    } catch (error) {
      if (error.code === "insufficient_quota") {
        console.warn(
          "⚠️ Quota da OpenAI esgotada. Usando documentação básica."
        );
      } else if (error.code === "invalid_api_key") {
        console.warn(
          "⚠️ Chave da OpenAI inválida. Usando documentação básica."
        );
      } else {
        console.warn("⚠️ Erro na OpenAI:", error.message);
      }
      return null;
    }
  }

  async generateCustomDocumentation(prompt, context) {
    if (!this.isAvailable()) {
      console.warn("OpenAI não disponível para documentação customizada");
      return null;
    }

    try {
      const fullPrompt = `
${prompt}

## Contexto do Projeto:
${JSON.stringify(context, null, 2)}

Gere documentação em markdown, sendo específico e útil:
`;

      const response = await this.callOpenAI(fullPrompt, "custom");
      return response;
    } catch (error) {
      console.error("Erro ao gerar documentação customizada:", error.message);
      return null;
    }
  }

  async generateMermaidDiagrams(architectureData) {
    if (!this.isAvailable()) return null;

    try {
      const prompt = `
Baseado nos seguintes dados de arquitetura, gere diagramas Mermaid apropriados:

${JSON.stringify(architectureData, null, 2)}

Gere os seguintes diagramas em formato Mermaid:
1. **Arquitetura Geral** (graph ou flowchart)
2. **Fluxo de Dados** (flowchart)
3. **Estrutura de Pastas** (mindmap se apropriado)

Retorne apenas os códigos Mermaid, cada um em um bloco de código separado com título:
`;

      const diagrams = await this.callOpenAI(prompt, "diagrams");
      return diagrams;
    } catch (error) {
      console.warn("⚠️ Erro ao gerar diagramas:", error.message);
      return null;
    }
  }

  async generateReadmeForProject(projectData, projectName) {
    if (!this.isAvailable()) return null;

    try {
      const prompt = `
Gere um README.md profissional para o projeto "${projectName}" baseado nos seguintes dados:

${JSON.stringify(projectData, null, 2)}

O README deve incluir:
1. **Título e descrição** do projeto
2. **Instalação** e setup
3. **Como usar** (exemplos práticos)
4. **Estrutura** do projeto
5. **Scripts disponíveis**
6. **Tecnologias** utilizadas
7. **Contribuição** (se aplicável)
8. **Licença** (se aplicável)

Use markdown profissional com emojis apropriados:
`;

      const readme = await this.callOpenAI(prompt, "readme");
      return readme;
    } catch (error) {
      console.warn("⚠️ Erro ao gerar README:", error.message);
      return null;
    }
  }

  getUsageStats() {
    return {
      available: this.isAvailable(),
      model: this.config.openai?.model || "gpt-4o-mini",
      maxTokens: this.config.openai?.maxTokens || 2000,
      temperature: this.config.openai?.temperature || 0.3,
    };
  }
}

module.exports = OpenAIDocumentationEnhancer;
