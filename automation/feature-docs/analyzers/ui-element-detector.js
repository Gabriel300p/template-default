/**
 * UI Element Detector
 * Detecta elementos de interface de forma inteligente
 */

const fs = require('fs');

class UIElementDetector {
  constructor() {
    this.elementPatterns = {
      // Filtros
      filter: {
        patterns: [
          /input.*type=['"](text|search)['"]/gi,
          /input.*placeholder.*filter/gi,
          /select.*filter/gi,
          /<Filter[A-Z]\w*/gi,
          /SearchInput|FilterInput|FilterSelect/gi,
          /\.filter\s*\(/g
        ],
        keywords: ['filter', 'search', 'query', 'term'],
        props: ['onFilter', 'filterValue', 'searchTerm']
      },

      // Botões
      button: {
        patterns: [
          /<button[^>]*>/gi,
          /<Button[^>]*>/gi,
          /type=['"](submit|button)['"]/gi,
          /onClick\s*=/gi
        ],
        keywords: ['submit', 'cancel', 'save', 'delete', 'create', 'edit'],
        props: ['onClick', 'onSubmit', 'disabled', 'loading']
      },

      // Modais/Dialogs
      modal: {
        patterns: [
          /<Modal[^>]*>/gi,
          /<Dialog[^>]*>/gi,
          /<Drawer[^>]*>/gi,
          /isOpen|open.*modal/gi,
          /showModal|hideModal/gi
        ],
        keywords: ['modal', 'dialog', 'drawer', 'popup'],
        props: ['isOpen', 'onClose', 'onOpen', 'show', 'visible']
      },

      // Formulários
      form: {
        patterns: [
          /<form[^>]*>/gi,
          /<Form[^>]*>/gi,
          /onSubmit\s*=/gi,
          /useForm|useFormik/gi,
          /Formik|Form\.Item/gi
        ],
        keywords: ['form', 'input', 'validation'],
        props: ['onSubmit', 'validation', 'initialValues', 'errors']
      },

      // Tabelas
      table: {
        patterns: [
          /<table[^>]*>/gi,
          /<Table[^>]*>/gi,
          /<DataGrid[^>]*>/gi,
          /columns\s*=\s*\[/gi,
          /\.map.*<tr>/gi,
          /TableRow|TableCell/gi
        ],
        keywords: ['table', 'grid', 'rows', 'columns', 'data'],
        props: ['columns', 'data', 'rows', 'onSort', 'pagination']
      },

      // Inputs
      input: {
        patterns: [
          /<input[^>]*>/gi,
          /<Input[^>]*>/gi,
          /<TextField[^>]*>/gi,
          /type=['"](text|email|password|number)['"]/gi
        ],
        keywords: ['input', 'field', 'value'],
        props: ['value', 'onChange', 'placeholder', 'required']
      },

      // Dropdowns/Selects
      select: {
        patterns: [
          /<select[^>]*>/gi,
          /<Select[^>]*>/gi,
          /<Dropdown[^>]*>/gi,
          /options\s*=\s*\[/gi
        ],
        keywords: ['select', 'dropdown', 'option'],
        props: ['options', 'value', 'onChange', 'placeholder']
      },

      // Cards
      card: {
        patterns: [
          /<Card[^>]*>/gi,
          /<div.*card/gi,
          /className.*card/gi
        ],
        keywords: ['card', 'panel'],
        props: ['title', 'content', 'actions']
      },

      // Navegação
      navigation: {
        patterns: [
          /<nav[^>]*>/gi,
          /<Navigation[^>]*>/gi,
          /<Menu[^>]*>/gi,
          /<Link[^>]*>/gi,
          /useNavigate|useRouter/gi
        ],
        keywords: ['nav', 'menu', 'link', 'route'],
        props: ['to', 'href', 'active']
      },

      // Loading/Spinner
      loading: {
        patterns: [
          /<Spinner[^>]*>/gi,
          /<Loading[^>]*>/gi,
          /isLoading|loading/gi,
          /CircularProgress|LinearProgress/gi
        ],
        keywords: ['loading', 'spinner', 'progress'],
        props: ['loading', 'isLoading', 'progress']
      },

      // Alertas/Notificações
      alert: {
        patterns: [
          /<Alert[^>]*>/gi,
          /<Notification[^>]*>/gi,
          /<Toast[^>]*>/gi,
          /alert\(|notification/gi
        ],
        keywords: ['alert', 'notification', 'toast', 'message'],
        props: ['message', 'type', 'severity', 'onClose']
      }
    };
  }

  async detectElements(filePath, component) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const elements = [];

      // Detectar cada tipo de elemento
      for (const [elementType, config] of Object.entries(this.elementPatterns)) {
        const detected = this.detectElementType(content, elementType, config, component);
        elements.push(...detected);
      }

      // Análise contextual adicional
      const contextualElements = this.analyzeContext(content, elements, component);
      elements.push(...contextualElements);

      return this.deduplicateElements(elements);

    } catch (error) {
      console.warn(`⚠️ Erro ao detectar elementos UI em ${filePath}: ${error.message}`);
      return [];
    }
  }

  detectElementType(content, elementType, config, component) {
    const elements = [];
    let confidence = 0;
    const instances = [];

    // Verificar padrões de código
    config.patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        confidence += matches.length * 2;
        instances.push(...matches.slice(0, 3)); // Máximo 3 exemplos
      }
    });

    // Verificar palavras-chave
    config.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        confidence += matches.length;
      }
    });

    // Verificar props específicas
    if (component.props) {
      config.props.forEach(prop => {
        const hasProp = component.props.some(p => p.name === prop);
        if (hasProp) {
          confidence += 3;
        }
      });
    }

    // Se temos evidência suficiente, adicionar elemento
    if (confidence > 0) {
      elements.push({
        type: elementType,
        confidence: this.calculateConfidenceLevel(confidence),
        instances: instances.slice(0, 2), // Máximo 2 exemplos
        details: this.extractElementDetails(content, elementType, instances),
        metadata: {
          patternMatches: confidence,
          contextualClues: this.getContextualClues(content, elementType)
        }
      });
    }

    return elements;
  }

  calculateConfidenceLevel(score) {
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    if (score >= 2) return 'low';
    return 'very-low';
  }

  extractElementDetails(content, elementType, instances) {
    const details = {};

    switch (elementType) {
      case 'filter':
        details.filterTypes = this.extractFilterTypes(content);
        details.searchFields = this.extractSearchFields(content);
        break;

      case 'button':
        details.buttonTypes = this.extractButtonTypes(content, instances);
        details.actions = this.extractButtonActions(content);
        break;

      case 'form':
        details.fields = this.extractFormFields(content);
        details.validation = this.hasValidation(content);
        break;

      case 'table':
        details.columns = this.extractTableColumns(content);
        details.features = this.extractTableFeatures(content);
        break;

      case 'modal':
        details.triggers = this.extractModalTriggers(content);
        details.size = this.extractModalSize(content);
        break;

      default:
        details.general = this.extractGeneralDetails(content, elementType);
    }

    return details;
  }

  extractFilterTypes(content) {
    const types = [];
    
    if (content.includes('type="search"') || content.includes('SearchInput')) {
      types.push('search');
    }
    if (content.includes('type="date"') || content.includes('DatePicker')) {
      types.push('date');
    }
    if (content.includes('<select') || content.includes('Select')) {
      types.push('select');
    }
    if (content.includes('checkbox') || content.includes('Checkbox')) {
      types.push('checkbox');
    }

    return types;
  }

  extractSearchFields(content) {
    const fields = [];
    const placeholderPattern = /placeholder=['"]([^'"]*search[^'"]*)['"]]/gi;
    let match;

    while ((match = placeholderPattern.exec(content)) !== null) {
      fields.push(match[1]);
    }

    return fields;
  }

  extractButtonTypes(content, instances) {
    const types = [];
    
    instances.forEach(instance => {
      if (instance.includes('submit') || instance.includes('Submit')) {
        types.push('submit');
      } else if (instance.includes('delete') || instance.includes('Delete')) {
        types.push('delete');
      } else if (instance.includes('save') || instance.includes('Save')) {
        types.push('save');
      } else if (instance.includes('cancel') || instance.includes('Cancel')) {
        types.push('cancel');
      } else {
        types.push('action');
      }
    });

    return [...new Set(types)];
  }

  extractButtonActions(content) {
    const actions = [];
    const actionPattern = /onClick\s*=\s*\{([^}]+)\}/g;
    let match;

    while ((match = actionPattern.exec(content)) !== null) {
      const action = match[1].trim();
      if (action.length < 50) { // Evitar funções muito longas
        actions.push(action);
      }
    }

    return actions.slice(0, 3); // Máximo 3 ações
  }

  extractFormFields(content) {
    const fields = [];
    const inputPattern = /<input[^>]*name=['"]([^'"]+)['"][^>]*>/gi;
    let match;

    while ((match = inputPattern.exec(content)) !== null) {
      fields.push(match[1]);
    }

    return fields;
  }

  hasValidation(content) {
    const validationKeywords = ['required', 'validate', 'error', 'yup', 'joi', 'zod'];
    return validationKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
  }

  extractTableColumns(content) {
    const columns = [];
    
    // Procurar definição de colunas
    const columnsPattern = /columns\s*=\s*\[(.*?)\]/gs;
    const match = columnsPattern.exec(content);
    
    if (match) {
      // Parse básico das colunas
      const columnsText = match[1];
      const columnMatches = columnsText.match(/['"]([^'"]+)['"]|key:\s*['"]([^'"]+)['"]/g);
      
      if (columnMatches) {
        columnMatches.forEach(col => {
          const cleanCol = col.replace(/['"key:]/g, '').trim();
          if (cleanCol) columns.push(cleanCol);
        });
      }
    }

    return columns.slice(0, 5); // Máximo 5 colunas
  }

  extractTableFeatures(content) {
    const features = [];
    
    if (content.includes('sort') || content.includes('Sort')) {
      features.push('sorting');
    }
    if (content.includes('pagination') || content.includes('Pagination')) {
      features.push('pagination');
    }
    if (content.includes('filter') || content.includes('Filter')) {
      features.push('filtering');
    }
    if (content.includes('selection') || content.includes('Selection')) {
      features.push('selection');
    }

    return features;
  }

  extractModalTriggers(content) {
    const triggers = [];
    const triggerPattern = /onClick\s*=\s*\{[^}]*(?:open|show|setShow|setOpen)[^}]*\}/gi;
    const matches = content.match(triggerPattern);
    
    if (matches) {
      triggers.push(...matches.slice(0, 2));
    }

    return triggers;
  }

  extractModalSize(content) {
    if (content.includes('size="large"') || content.includes('large')) return 'large';
    if (content.includes('size="small"') || content.includes('small')) return 'small';
    if (content.includes('fullscreen') || content.includes('Fullscreen')) return 'fullscreen';
    return 'medium';
  }

  extractGeneralDetails(content, elementType) {
    // Detalhes gerais para outros tipos de elementos
    return {
      hasProps: content.includes('{...props}'),
      hasChildren: content.includes('children'),
      hasClassName: content.includes('className')
    };
  }

  getContextualClues(content, elementType) {
    const clues = [];
    
    // Clues baseados em imports
    if (content.includes('react-hook-form')) clues.push('react-hook-form');
    if (content.includes('formik')) clues.push('formik');
    if (content.includes('antd')) clues.push('ant-design');
    if (content.includes('@mui/material')) clues.push('material-ui');
    if (content.includes('react-table')) clues.push('react-table');

    // Clues baseados em padrões
    if (content.includes('useState')) clues.push('state-management');
    if (content.includes('useEffect')) clues.push('side-effects');
    if (content.includes('async') || content.includes('await')) clues.push('async-operations');

    return clues;
  }

  analyzeContext(content, elements, component) {
    const contextualElements = [];

    // Detectar padrões compostos
    if (this.hasMultipleElements(elements, ['filter', 'table'])) {
      contextualElements.push({
        type: 'filterable-table',
        confidence: 'high',
        description: 'Tabela com funcionalidade de filtro',
        composedOf: ['filter', 'table']
      });
    }

    if (this.hasMultipleElements(elements, ['form', 'modal'])) {
      contextualElements.push({
        type: 'modal-form',
        confidence: 'high',
        description: 'Formulário dentro de modal',
        composedOf: ['form', 'modal']
      });
    }

    if (this.hasMultipleElements(elements, ['button', 'table'])) {
      contextualElements.push({
        type: 'action-table',
        confidence: 'medium',
        description: 'Tabela com botões de ação',
        composedOf: ['button', 'table']
      });
    }

    // Detectar padrões CRUD
    const crudElements = elements.filter(e => 
      ['form', 'table', 'button', 'modal'].includes(e.type)
    );
    
    if (crudElements.length >= 3) {
      contextualElements.push({
        type: 'crud-interface',
        confidence: 'medium',
        description: 'Interface CRUD completa',
        composedOf: crudElements.map(e => e.type)
      });
    }

    return contextualElements;
  }

  hasMultipleElements(elements, types) {
    return types.every(type => 
      elements.some(element => element.type === type)
    );
  }

  deduplicateElements(elements) {
    const seen = new Set();
    return elements.filter(element => {
      const key = `${element.type}-${JSON.stringify(element.details)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Método público para obter estatísticas
  getDetectionStatistics(elements) {
    const stats = {
      total: elements.length,
      byType: {},
      byConfidence: {},
      patterns: []
    };

    elements.forEach(element => {
      // Por tipo
      stats.byType[element.type] = (stats.byType[element.type] || 0) + 1;
      
      // Por confiança
      stats.byConfidence[element.confidence] = (stats.byConfidence[element.confidence] || 0) + 1;
      
      // Padrões detectados
      if (element.composedOf) {
        stats.patterns.push(element.type);
      }
    });

    return stats;
  }
}

module.exports = UIElementDetector;
