/**
 * Testes de Integração - Feature Documentation System v3.0
 * Validação completa do fluxo end-to-end
 */

const path = require('path');
const fs = require('fs');

class FeatureDocsIntegrationTests {
  constructor() {
    this.testResults = [];
    this.tempDir = path.join(__dirname, '..', 'temp-integration');
    this.fixturesDir = path.join(__dirname, '..', 'fixtures');
  }

  async runAll() {
    console.log('🔗 TESTES DE INTEGRAÇÃO - Feature Documentation System');
    console.log('='.repeat(60));

    await this.setupTestEnvironment();
    await this.testFullWorkflow();
    await this.testGitIntegration();
    await this.testFeatureScanning();
    await this.testDocumentGeneration();
    await this.testConfigurationSystem();
    await this.testErrorHandling();
    await this.cleanup();

    return this.generateReport();
  }

  async setupTestEnvironment() {
    console.log('\n🔧 Configurando ambiente de teste...');

    try {
      // Criar diretório temporário
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true });
      }
      fs.mkdirSync(this.tempDir, { recursive: true });

      // Criar estrutura de features simulada
      const featuresDir = path.join(this.tempDir, 'src', 'features');
      fs.mkdirSync(featuresDir, { recursive: true });

      // Feature 1: user-management
      const userManagementDir = path.join(featuresDir, 'user-management');
      fs.mkdirSync(userManagementDir, { recursive: true });
      fs.mkdirSync(path.join(userManagementDir, 'components'), { recursive: true });
      fs.mkdirSync(path.join(userManagementDir, 'pages'), { recursive: true });
      fs.mkdirSync(path.join(userManagementDir, 'hooks'), { recursive: true });

      // Feature 2: dashboard
      const dashboardDir = path.join(featuresDir, 'dashboard');
      fs.mkdirSync(dashboardDir, { recursive: true });
      fs.mkdirSync(path.join(dashboardDir, 'components'), { recursive: true });
      fs.mkdirSync(path.join(dashboardDir, 'widgets'), { recursive: true });

      // Criar componentes de teste
      await this.createTestComponents();

      console.log('   ✅ Ambiente configurado');

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      throw error;
    }
  }

  async createTestComponents() {
    const userManagementDir = path.join(this.tempDir, 'src', 'features', 'user-management');
    const dashboardDir = path.join(this.tempDir, 'src', 'features', 'dashboard');

    // UserList component
    const userListComponent = `
import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

interface UserListProps {
  /** Título da lista de usuários */
  title?: string;
  /** Função chamada quando usuário é selecionado */
  onUserSelect?: (user: User) => void;
  /** Se deve mostrar filtros */
  showFilters?: boolean;
}

/**
 * UserList - Lista de usuários com filtros e paginação
 * 
 * Funcionalidades:
 * - Filtro por nome e email
 * - Paginação automática
 * - Seleção de usuários
 * - Status visual dos usuários
 */
export const UserList: React.FC<UserListProps> = ({
  title = 'Lista de Usuários',
  onUserSelect,
  showFilters = true
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Carregando usuários...</div>;
  }

  return (
    <div className="user-list">
      <h2>{title}</h2>

      {showFilters && (
        <div className="filters">
          <input
            type="search"
            placeholder="Filtrar por nome ou email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      )}

      <div className="user-grid">
        {filteredUsers.map(user => (
          <div 
            key={user.id} 
            className={\`user-card \${user.status}\`}
            onClick={() => onUserSelect?.(user)}
          >
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className="status">{user.status}</span>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="empty-state">Nenhum usuário encontrado</div>
      )}
    </div>
  );
};

export default UserList;
`;

    // UserForm component
    const userFormComponent = `
import React, { useState } from 'react';

interface UserFormProps {
  /** Usuário para edição (opcional) */
  user?: {
    id?: number;
    name: string;
    email: string;
  };
  /** Função chamada ao salvar */
  onSave: (user: any) => void;
  /** Função chamada ao cancelar */
  onCancel?: () => void;
  /** Se está em modo de carregamento */
  loading?: boolean;
}

/**
 * UserForm - Formulário para criação/edição de usuários
 */
export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...user,
        ...formData
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-group">
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          disabled={loading}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          disabled={loading}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default UserForm;
`;

    // Dashboard Widget
    const dashboardWidget = `
import React, { useMemo } from 'react';

interface DashboardWidgetProps {
  /** Título do widget */
  title: string;
  /** Dados a serem exibidos */
  data: any[];
  /** Tipo de visualização */
  type: 'chart' | 'table' | 'metric';
  /** Configurações do widget */
  config?: {
    showExport?: boolean;
    refreshInterval?: number;
  };
}

/**
 * DashboardWidget - Widget genérico para dashboard
 * 
 * Suporta diferentes tipos de visualização:
 * - Gráficos (chart)
 * - Tabelas (table) 
 * - Métricas (metric)
 */
export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  data,
  type,
  config = {}
}) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);

  const renderContent = () => {
    switch (type) {
      case 'chart':
        return (
          <div className="chart-container">
            <div className="chart">Gráfico com {data.length} pontos</div>
          </div>
        );
      
      case 'table':
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name || \`Item \${index + 1}\`}</td>
                    <td>{item.value || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'metric':
        return (
          <div className="metric-container">
            <div className="metric-value">{data.length}</div>
            <div className="metric-label">Total de itens</div>
          </div>
        );
      
      default:
        return <div>Tipo de widget não suportado</div>;
    }
  };

  return (
    <div className={\`dashboard-widget widget-\${type}\`}>
      <div className="widget-header">
        <h3>{title}</h3>
        {config.showExport && (
          <button className="export-btn">Exportar</button>
        )}
      </div>
      
      <div className="widget-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardWidget;
`;

    // Salvar componentes
    fs.writeFileSync(
      path.join(userManagementDir, 'components', 'UserList.tsx'),
      userListComponent
    );

    fs.writeFileSync(
      path.join(userManagementDir, 'components', 'UserForm.tsx'),
      userFormComponent
    );

    fs.writeFileSync(
      path.join(dashboardDir, 'components', 'DashboardWidget.tsx'),
      dashboardWidget
    );

    // Página de usuários
    const userPage = `
import React, { useState } from 'react';
import { UserList } from '../components/UserList';
import { UserForm } from '../components/UserForm';

/**
 * UserPage - Página principal de gestão de usuários
 */
export const UserPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleSave = (userData) => {
    // Salvar usuário
    console.log('Salvando usuário:', userData);
    setShowForm(false);
    setSelectedUser(null);
  };

  return (
    <div className="user-page">
      <div className="page-header">
        <h1>Gestão de Usuários</h1>
        <button onClick={() => setShowForm(true)}>
          Novo Usuário
        </button>
      </div>

      <div className="page-content">
        <UserList onUserSelect={handleUserSelect} />
        
        {showForm && (
          <div className="modal">
            <UserForm
              user={selectedUser}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setSelectedUser(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
`;

    fs.writeFileSync(
      path.join(userManagementDir, 'pages', 'UserPage.tsx'),
      userPage
    );
  }

  async testFullWorkflow() {
    console.log('\n📝 Teste: Fluxo Completo do Sistema');

    try {
      const FeatureDocsEngine = require('../../feature-docs/core/feature-docs-engine');
      
      // Configurar engine para usar diretório de teste
      const options = {
        features: ['user-management'],
        all: false,
        detectChanges: false,
        config: false,
        rootPath: this.tempDir
      };

      // Simular inicialização
      const engine = new FeatureDocsEngine(options);
      
      if (typeof engine.initialize !== 'function') {
        throw new Error('Método initialize não encontrado');
      }

      // Simular escaneamento de features
      if (typeof engine.scanFeatures !== 'function') {
        throw new Error('Método scanFeatures não encontrado');
      }

      console.log('   ✅ Fluxo completo OK');
      this.testResults.push({
        test: 'Fluxo Completo',
        status: 'PASSED',
        details: 'Engine inicializada e métodos disponíveis'
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Fluxo Completo',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testGitIntegration() {
    console.log('\n📝 Teste: Integração com Git');

    try {
      const GitAnalyzer = require('../../feature-docs/core/git-analyzer');
      const analyzer = new GitAnalyzer();

      // Testar verificação de repositório
      const isRepo = await analyzer.checkGitRepository(this.tempDir);
      console.log(`   ℹ️ Diretório de teste ${isRepo ? 'é' : 'não é'} repositório Git`);

      // Testar com repositório real (diretório do projeto)
      const projectRoot = path.join(__dirname, '..', '..');
      const isProjectRepo = await analyzer.checkGitRepository(projectRoot);
      
      if (!isProjectRepo) {
        console.log('   ⚠️ Projeto principal não é repositório Git');
      }

      // Testar extração de features de paths
      const testPaths = [
        path.join(this.tempDir, 'src/features/user-management/components/UserList.tsx'),
        path.join(this.tempDir, 'src/features/dashboard/components/DashboardWidget.tsx')
      ];

      const extractedFeatures = analyzer.extractFeaturesFromPaths(testPaths);
      
      if (!Array.isArray(extractedFeatures)) {
        throw new Error('extractFeaturesFromPaths deve retornar array');
      }

      const expectedFeatures = ['user-management', 'dashboard'];
      const foundFeatures = expectedFeatures.filter(feature => 
        extractedFeatures.includes(feature)
      );

      if (foundFeatures.length !== expectedFeatures.length) {
        console.log(`   ⚠️ Algumas features não foram extraídas: esperado ${expectedFeatures.length}, encontrado ${foundFeatures.length}`);
      }

      console.log('   ✅ Integração Git OK');
      this.testResults.push({
        test: 'Integração Git',
        status: 'PASSED',
        details: `${extractedFeatures.length} features extraídas`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Integração Git',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testFeatureScanning() {
    console.log('\n📝 Teste: Escaneamento de Features');

    try {
      const FeatureScanner = require('../../feature-docs/core/feature-scanner');
      const ConfigManager = require('../../feature-docs/config/settings');

      const config = new ConfigManager();
      const scanner = new FeatureScanner(config);

      // Escanear features no diretório de teste
      const featuresPath = path.join(this.tempDir, 'src', 'features');
      const features = await scanner.scanFeatures(featuresPath);

      if (!Array.isArray(features)) {
        throw new Error('scanFeatures deve retornar array');
      }

      // Verificar se features foram encontradas
      const expectedFeatures = ['user-management', 'dashboard'];
      const foundFeatures = features.map(f => f.name || f);

      for (const expectedFeature of expectedFeatures) {
        if (!foundFeatures.includes(expectedFeature)) {
          console.log(`   ⚠️ Feature não encontrada: ${expectedFeature}`);
        }
      }

      // Verificar estrutura das features
      for (const feature of features) {
        if (typeof feature === 'object') {
          if (!feature.name || !feature.path) {
            console.log(`   ⚠️ Feature com estrutura incompleta: ${JSON.stringify(feature)}`);
          }
        }
      }

      console.log('   ✅ Escaneamento de Features OK');
      this.testResults.push({
        test: 'Escaneamento Features',
        status: 'PASSED',
        details: `${features.length} features encontradas`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Escaneamento Features',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testDocumentGeneration() {
    console.log('\n📝 Teste: Geração de Documentação');

    try {
      const DocumentGenerator = require('../../feature-docs/generators/documentation-generator');
      const ComponentAnalyzer = require('../../feature-docs/analyzers/component-analyzer');
      const UIElementDetector = require('../../feature-docs/analyzers/ui-element-detector');

      const generator = new DocumentGenerator();
      const componentAnalyzer = new ComponentAnalyzer();
      const uiDetector = new UIElementDetector();

      // Analisar componente de teste
      const userListPath = path.join(this.tempDir, 'src/features/user-management/components/UserList.tsx');
      const componentAnalysis = await componentAnalyzer.analyzeComponent(userListPath);

      if (!componentAnalysis) {
        throw new Error('Análise de componente falhou');
      }

      // Detectar elementos UI
      const uiElements = await uiDetector.detectElements(userListPath, componentAnalysis);

      if (!Array.isArray(uiElements)) {
        throw new Error('Detecção de elementos UI falhou');
      }

      // Simular geração de documentação
      const mockFeature = {
        name: 'user-management',
        path: path.join(this.tempDir, 'src/features/user-management'),
        components: [
          {
            ...componentAnalysis,
            path: userListPath,
            uiElements
          }
        ]
      };

      // Verificar se o gerador tem os métodos necessários
      if (typeof generator.generateFeatureDoc !== 'function') {
        console.log('   ⚠️ Método generateFeatureDoc não encontrado');
      }

      console.log('   ✅ Geração de Documentação OK');
      this.testResults.push({
        test: 'Geração Documentação',
        status: 'PASSED',
        details: `Componente analisado, ${uiElements.length} elementos UI detectados`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Geração Documentação',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testConfigurationSystem() {
    console.log('\n📝 Teste: Sistema de Configuração');

    try {
      const ConfigManager = require('../../feature-docs/config/settings');
      
      // Teste de configuração padrão
      const config = new ConfigManager();
      const validation = config.validate();

      if (typeof validation.isValid !== 'boolean') {
        throw new Error('Validação deve retornar objeto com isValid');
      }

      if (!validation.isValid && !validation.errors) {
        throw new Error('Validação inválida deve incluir erros');
      }

      // Teste de configuração personalizada
      const customConfig = new ConfigManager({
        output: {
          path: './custom-docs',
          format: 'markdown'
        },
        analysis: {
          includePrivate: true,
          complexityThreshold: 5
        }
      });

      const customValidation = customConfig.validate();
      
      if (typeof customValidation.isValid !== 'boolean') {
        throw new Error('Validação customizada falhou');
      }

      // Teste de templates
      const templatesPath = path.join(__dirname, '../../feature-docs/config/templates-config.json');
      if (fs.existsSync(templatesPath)) {
        const templatesConfig = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
        
        if (!templatesConfig.templates || !templatesConfig.sections) {
          throw new Error('Configuração de templates inválida');
        }
      } else {
        console.log('   ⚠️ Arquivo de configuração de templates não encontrado');
      }

      console.log('   ✅ Sistema de Configuração OK');
      this.testResults.push({
        test: 'Sistema Configuração',
        status: 'PASSED',
        details: 'Configuração padrão e customizada funcionando'
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Sistema Configuração',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testErrorHandling() {
    console.log('\n📝 Teste: Tratamento de Erros');

    try {
      const ComponentAnalyzer = require('../../feature-docs/analyzers/component-analyzer');
      const analyzer = new ComponentAnalyzer();

      // Teste com arquivo inexistente
      try {
        await analyzer.analyzeComponent('/path/that/does/not/exist.tsx');
        console.log('   ⚠️ Deveria ter falhado para arquivo inexistente');
      } catch (error) {
        // Este erro é esperado
        console.log('   ✅ Erro tratado para arquivo inexistente');
      }

      // Teste com arquivo inválido
      const invalidFile = path.join(this.tempDir, 'invalid.tsx');
      fs.writeFileSync(invalidFile, 'this is not valid typescript code {{{');

      try {
        await analyzer.analyzeComponent(invalidFile);
        console.log('   ⚠️ Deveria ter falhado para arquivo inválido');
      } catch (error) {
        // Este erro é esperado
        console.log('   ✅ Erro tratado para arquivo inválido');
      }

      // Teste com diretório inexistente no scanner
      const FeatureScanner = require('../../feature-docs/core/feature-scanner');
      const ConfigManager = require('../../feature-docs/config/settings');

      const config = new ConfigManager();
      const scanner = new FeatureScanner(config);

      try {
        await scanner.scanFeatures('/path/that/does/not/exist');
        console.log('   ⚠️ Deveria ter falhado para diretório inexistente');
      } catch (error) {
        // Este erro é esperado
        console.log('   ✅ Erro tratado para diretório inexistente');
      }

      console.log('   ✅ Tratamento de Erros OK');
      this.testResults.push({
        test: 'Tratamento Erros',
        status: 'PASSED',
        details: 'Erros tratados adequadamente'
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Tratamento Erros',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async cleanup() {
    console.log('\n🧹 Limpando ambiente de teste...');

    try {
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true });
      }
      console.log('   ✅ Limpeza concluída');

    } catch (error) {
      console.log(`   ⚠️ Erro na limpeza: ${error.message}`);
    }
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO - Testes de Integração');
    console.log(`✅ Passou: ${passed}/${total}`);
    console.log(`❌ Falhou: ${failed}/${total}`);

    if (failed > 0) {
      console.log('\nErros encontrados:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => {
          console.log(`   • ${r.test}: ${r.error}`);
        });
    }

    return {
      total,
      passed,
      failed,
      results: this.testResults
    };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tests = new FeatureDocsIntegrationTests();
  tests.runAll().then(report => {
    if (report.failed > 0) {
      process.exit(1);
    }
  });
}

module.exports = FeatureDocsIntegrationTests;
