const fs = require('fs').promises;
const path = require('path');

class DocumentationTemplates {
  constructor() {
    this.loadConfig();
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, '../../config/project.json');
      const configContent = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configContent);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      throw error;
    }
  }

  /**
   * Template para página inicial do wiki
   */
  generateWikiHomePage(projectInfo, stats) {
    const { name, description } = projectInfo;
    const date = new Date().toLocaleDateString('pt-BR');
    
    return `# 📚 ${name} - Documentação

${description}

*Última atualização: ${date}*

## 🚀 Início Rápido

- [📚 Documentação Técnica](${this.config.output.wiki.structure.technical})
- [👥 Guia do Usuário](${this.config.output.wiki.structure.user})
- [📈 Resumo Executivo](${this.config.output.wiki.structure.executive})

## 📊 Estatísticas do Projeto

- **Arquivos documentados**: ${stats.totalFiles || 0}
- **Última análise**: ${date}
- **Stack principal**: ${this.config.stack.frontend.join(', ')}
- **Linguagem principal**: TypeScript/JavaScript

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura moderna baseada em:

### Frontend
${this.config.stack.frontend.map(tech => `- **${tech}**`).join('\n')}

### Backend
${this.config.stack.backend.map(tech => `- **${tech}**`).join('\n')}

${this.config.stack.mobile ? `
### Mobile
${this.config.stack.mobile.map(tech => `- **${tech}**`).join('\n')}
` : ''}

## 🔄 Processo de Documentação

Esta documentação é gerada automaticamente através de:

1. **Análise de Código**: IA analisa mudanças no código
2. **Geração Inteligente**: Documentação contextual é criada
3. **Organização**: Conteúdo é organizado por tipo e complexidade
4. **Atualização**: Wiki é atualizado automaticamente

## 📋 Convenções

### Labels de Issues
${Object.entries(this.config.documentation.issue_labels).map(([key, label]) => `- \`${label}\``).join('\n')}

### Estrutura de Documentação
- **Técnica**: Focada em desenvolvedores e arquitetos
- **Usuário**: Guias práticos para usuários finais
- **Executiva**: Insights de alto nível para tomadores de decisão

---

*Documentação gerada automaticamente pelo Sistema de Documentação Inteligente*`;
  }

  /**
   * Template para índice de documentação técnica
   */
  generateTechnicalIndex(documents) {
    const date = new Date().toLocaleDateString('pt-BR');
    
    const sections = this.groupDocumentsByCategory(documents, 'technical');
    
    return `# 📚 Documentação Técnica

*Atualizado em: ${date}*

Esta seção contém documentação técnica detalhada para desenvolvedores e arquitetos.

## 📋 Índice

${Object.entries(sections).map(([category, docs]) => {
  return `### ${this.getCategoryIcon(category)} ${this.formatCategoryName(category)}

${docs.map(doc => `- [${doc.title}](${doc.link})`).join('\n')}`;
}).join('\n\n')}

## 🏗️ Visão Arquitetural

### Estrutura do Projeto
\`\`\`
src/
├── app/                    # Configuração da aplicação
├── shared/                 # Recursos compartilhados
├── features/              # Features por domínio
└── routes/                # Roteamento
\`\`\`

### Padrões Utilizados
- **Feature-based Architecture**: Organização por domínio
- **Component Composition**: Reutilização de componentes
- **Hook Pattern**: Lógica reutilizável
- **Type Safety**: TypeScript em toda aplicação

### Stack Técnico
${this.config.stack.frontend.map(tech => `- **${this.formatTechName(tech)}**`).join('\n')}

---

*Documentação gerada automaticamente*`;
  }

  /**
   * Template para índice de guia do usuário
   */
  generateUserIndex(documents) {
    const date = new Date().toLocaleDateString('pt-BR');
    
    const sections = this.groupDocumentsByCategory(documents, 'user');
    
    return `# 👥 Guia do Usuário

*Atualizado em: ${date}*

Guias práticos e tutoriais para usuários finais do sistema.

## 🎯 Como Usar Este Guia

1. **Novo no sistema?** Comece pelos [Tutoriais Básicos](#tutoriais-básicos)
2. **Procurando algo específico?** Use o [Índice](#índice) abaixo
3. **Problema específico?** Consulte [Resolução de Problemas](#resolução-de-problemas)

## 📋 Índice

${Object.entries(sections).map(([category, docs]) => {
  return `### ${this.getCategoryIcon(category)} ${this.formatCategoryName(category)}

${docs.map(doc => `- [${doc.title}](${doc.link})`).join('\n')}`;
}).join('\n\n')}

## 🚀 Primeiros Passos

### 1. Acesso ao Sistema
- Como fazer login
- Configuração inicial
- Navegação básica

### 2. Principais Funcionalidades
- Gestão de comunicações
- Relatórios
- Configurações

### 3. Dicas e Truques
- Atalhos úteis
- Recursos avançados
- Otimização do workflow

## 🆘 Suporte

- **Issues**: [Reportar problemas](../issues)
- **Documentação Técnica**: [Para desenvolvedores](${this.config.output.wiki.structure.technical})
- **Contato**: Entre em contato com a equipe de desenvolvimento

---

*Guias atualizados automaticamente*`;
  }

  /**
   * Template para resumo executivo
   */
  generateExecutiveIndex(reports) {
    const date = new Date().toLocaleDateString('pt-BR');
    
    return `# 📈 Resumo Executivo

*Relatório de: ${date}*

Insights de alto nível e análises de impacto para tomadores de decisão.

## 📊 Dashboard Executivo

### Métricas de Desenvolvimento
- **Produtividade**: Análise de velocity da equipe
- **Qualidade**: Indicadores de qualidade do código
- **Evolução**: Tendências de desenvolvimento

### Impacto no Negócio
- **Funcionalidades Entregues**: Valor agregado ao produto
- **Performance**: Melhorias de experiência do usuário
- **Eficiência**: Otimizações de processo

## 📋 Relatórios Disponíveis

${reports.map(report => `- [${report.title}](${report.link}) - *${report.date}*`).join('\n')}

## 🎯 Indicadores Chave (KPIs)

### Desenvolvimento
- **Commits por semana**: Atividade de desenvolvimento
- **Pull Requests**: Colaboração da equipe
- **Issues fechadas**: Resolução de problemas

### Qualidade
- **Cobertura de testes**: Confiabilidade do código
- **Complexidade**: Manutenibilidade
- **Documentação**: Completude da documentação

### Negócio
- **Features entregues**: Valor para usuários
- **Performance**: Experiência do usuário
- **Escalabilidade**: Capacidade de crescimento

## 💡 Insights e Recomendações

### Pontos Fortes
- Arquitetura sólida e escalável
- Boa cobertura de testes
- Documentação atualizada automaticamente

### Oportunidades
- Implementação de PWA
- Otimizações de performance
- Expansão de funcionalidades

### Próximos Passos
- Análise de feedback dos usuários
- Planejamento de novas features
- Otimizações baseadas em métricas

---

*Relatórios gerados automaticamente pelo sistema de análise inteligente*`;
  }

  /**
   * Template para notification issue
   */
  generateNotificationIssue(changes, documentation) {
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');
    
    return `# 🤖 Documentação Atualizada - ${date}

*Atualização automática realizada às ${time}*

## 📊 Resumo das Mudanças

### Arquivos Processados
${changes.files.map(file => `- \`${file.path}\` (${file.status})`).join('\n')}

### Documentação Gerada
${documentation.map(doc => `- **${doc.type}**: [${doc.title}](${doc.url})`).join('\n')}

## 📈 Estatísticas

- **Total de arquivos**: ${changes.files.length}
- **Linhas adicionadas**: ${changes.stats.additions}
- **Linhas removidas**: ${changes.stats.deletions}
- **Documentos atualizados**: ${documentation.length}

## 🔍 Análise de Impacto

### Mudanças Técnicas
${this.generateTechnicalSummary(changes.files)}

### Impacto no Usuário
${this.generateUserImpactSummary(changes.files)}

### Considerações de Negócio
${this.generateBusinessImpactSummary(changes.files)}

## 📚 Links da Documentação

- [📚 Documentação Técnica](../../wiki/${this.config.output.wiki.structure.technical})
- [👥 Guia do Usuário](../../wiki/${this.config.output.wiki.structure.user})
- [📈 Resumo Executivo](../../wiki/${this.config.output.wiki.structure.executive})

## ⚙️ Próximas Ações

- [ ] Revisar documentação gerada
- [ ] Validar precisão das informações
- [ ] Considerar feedback da equipe
- [ ] Atualizar conforme necessário

---

*Esta issue foi criada automaticamente pelo Sistema de Documentação Inteligente*

/label ${this.config.documentation.issue_labels.documentation}
/label ${this.config.documentation.issue_labels['auto-generated']}`;
  }

  // Helper methods
  groupDocumentsByCategory(documents, type) {
    const groups = {};
    
    documents.filter(doc => doc.type === type).forEach(doc => {
      const category = doc.category || 'Geral';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(doc);
    });
    
    return groups;
  }

  getCategoryIcon(category) {
    const icons = {
      'components': '🧩',
      'hooks': '🪝',
      'utils': '🛠️',
      'api': '🌐',
      'database': '🗄️',
      'authentication': '🔒',
      'routing': '🗺️',
      'state': '📊',
      'ui': '🎨',
      'forms': '📝',
      'tests': '🧪',
      'config': '⚙️'
    };
    
    return icons[category.toLowerCase()] || '📄';
  }

  formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  formatTechName(tech) {
    const names = {
      'react': 'React',
      'typescript': 'TypeScript',
      'vite': 'Vite',
      'tailwindcss': 'Tailwind CSS',
      'nodejs': 'Node.js',
      'supabase': 'Supabase',
      'prisma': 'Prisma'
    };
    
    return names[tech] || tech;
  }

  generateTechnicalSummary(files) {
    // Análise básica dos tipos de arquivo
    const fileTypes = files.reduce((acc, file) => {
      const ext = path.extname(file.path);
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(fileTypes)
      .map(([ext, count]) => `- **${ext || 'Sem extensão'}**: ${count} arquivo(s)`)
      .join('\n') || 'Nenhuma mudança técnica significativa detectada.';
  }

  generateUserImpactSummary(files) {
    const hasUI = files.some(f => 
      f.path.includes('components') || 
      f.path.includes('pages') || 
      f.path.includes('.tsx')
    );

    const hasAPI = files.some(f => 
      f.path.includes('api') || 
      f.path.includes('services')
    );

    const impacts = [];
    
    if (hasUI) {
      impacts.push('- **Interface**: Possíveis mudanças na experiência do usuário');
    }
    
    if (hasAPI) {
      impacts.push('- **Funcionalidades**: Novas funcionalidades ou modificações em recursos existentes');
    }

    return impacts.join('\n') || 'Mudanças internas sem impacto direto na experiência do usuário.';
  }

  generateBusinessImpactSummary(files) {
    const hasFeatures = files.some(f => f.path.includes('features'));
    const hasDatabase = files.some(f => 
      f.path.includes('.prisma') || 
      f.path.includes('database') ||
      f.path.includes('schema')
    );

    const impacts = [];
    
    if (hasFeatures) {
      impacts.push('- **Produto**: Evolução das funcionalidades do produto');
    }
    
    if (hasDatabase) {
      impacts.push('- **Dados**: Modificações na estrutura de dados');
    }

    return impacts.join('\n') || 'Mudanças de infraestrutura e manutenção sem impacto direto no negócio.';
  }
}

module.exports = DocumentationTemplates;
