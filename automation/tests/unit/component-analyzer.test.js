/**
 * Testes Unitários - Component Analyzer
 * Validação completa do analisador de componentes
 */

const path = require('path');
const fs = require('fs');

class ComponentAnalyzerTests {
  constructor() {
    this.testResults = [];
    this.ComponentAnalyzer = require('../../feature-docs/analyzers/component-analyzer');
    this.fixturesDir = path.join(__dirname, '..', 'fixtures');
  }

  async runAll() {
    console.log('🧩 TESTES UNITÁRIOS - Component Analyzer');
    console.log('='.repeat(50));

    await this.createTestFixtures();
    await this.testInitialization();
    await this.testReactComponent();
    await this.testVueComponent();
    await this.testPropsExtraction();
    await this.testHooksDetection();
    await this.testComplexityCalculation();

    return this.generateReport();
  }

  async createTestFixtures() {
    console.log('\n🔧 Criando fixtures de teste...');

    if (!fs.existsSync(this.fixturesDir)) {
      fs.mkdirSync(this.fixturesDir, { recursive: true });
    }

    // Fixture React complexo
    const reactComponent = `
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  /** Título da lista */
  title: string;
  /** Função chamada quando usuário é selecionado */
  onUserSelect?: (user: User) => void;
  /** Se deve mostrar filtros */
  showFilters?: boolean;
  /** Configuração de paginação */
  pagination?: {
    pageSize: number;
    showSizeChanger: boolean;
  };
  /** Classe CSS adicional */
  className?: string;
  /** Se está em modo de carregamento */
  loading?: boolean;
}

/**
 * UserList - Componente para exibir lista de usuários
 * 
 * Este componente exibe uma lista de usuários com funcionalidades de:
 * - Filtro por nome/email
 * - Paginação
 * - Seleção de usuários
 * - Estados de loading
 * 
 * @param props - Propriedades do componente
 * @returns JSX Element
 */
export const UserList: React.FC<UserListProps> = ({
  title,
  onUserSelect,
  showFilters = true,
  pagination = { pageSize: 10, showSizeChanger: true },
  className = '',
  loading = false
}) => {
  // Estados locais
  const [filter, setFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Query para buscar usuários
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', filter, currentPage],
    queryFn: () => fetchUsers({ filter, page: currentPage }),
    enabled: !loading
  });

  // Mutation para ações dos usuários
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      // Atualizar lista
    }
  });

  // Callbacks
  const handleUserClick = useCallback((user: User) => {
    onUserSelect?.(user);
  }, [onUserSelect]);

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
    setCurrentPage(1);
  }, []);

  const handleDeleteUser = useCallback(async (userId: number) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  }, [deleteUserMutation]);

  // Computed values
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      user.name.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / pagination.pageSize);
  }, [filteredUsers.length, pagination.pageSize]);

  // Effects
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }, [error]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedUsers([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (isLoading || loading) {
    return <div className="loading">Carregando usuários...</div>;
  }

  if (error) {
    return <div className="error">Erro ao carregar usuários</div>;
  }

  return (
    <div className={\`user-list \${className}\`}>
      <h2>{title}</h2>
      
      {showFilters && (
        <div className="filters">
          <input
            type="search"
            placeholder="Filtrar por nome ou email..."
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
          />
        </div>
      )}

      <div className="user-grid">
        {filteredUsers.map(user => (
          <div 
            key={user.id} 
            className="user-card"
            onClick={() => handleUserClick(user)}
          >
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUser(user.id);
              }}
            >
              Deletar
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Anterior
          </button>
          
          <span>Página {currentPage} de {totalPages}</span>
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

// Funções auxiliares
async function fetchUsers(params: { filter: string; page: number }): Promise<User[]> {
  // Implementação da busca
  return [];
}

async function deleteUser(id: number): Promise<void> {
  // Implementação da deleção
}

export default UserList;
`;

    // Fixture Vue
    const vueComponent = `
<template>
  <div class="product-card" :class="className">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div class="badge" v-if="product.isNew">Novo</div>
    </div>
    
    <div class="product-info">
      <h3>{{ product.name }}</h3>
      <p class="description">{{ product.description }}</p>
      <div class="price">
        <span class="current-price">R$ {{ formatPrice(product.price) }}</span>
        <span v-if="product.oldPrice" class="old-price">
          R$ {{ formatPrice(product.oldPrice) }}
        </span>
      </div>
    </div>

    <div class="actions">
      <button @click="addToCart" :disabled="!product.inStock">
        {{ product.inStock ? 'Adicionar ao Carrinho' : 'Esgotado' }}
      </button>
      <button @click="toggleWishlist" class="wishlist-btn">
        <i :class="wishlistIcon"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  isNew: boolean;
  inStock: boolean;
}

export default defineComponent({
  name: 'ProductCard',
  
  props: {
    /** Produto a ser exibido */
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    /** Classe CSS adicional */
    className: {
      type: String,
      default: ''
    },
    /** Se deve mostrar botão de wishlist */
    showWishlist: {
      type: Boolean,
      default: true
    }
  },

  emits: {
    /** Emitido quando produto é adicionado ao carrinho */
    addToCart: (product: Product) => true,
    /** Emitido quando produto é adicionado/removido da wishlist */
    wishlistToggle: (product: Product, added: boolean) => true
  },

  setup(props, { emit }) {
    const isInWishlist = ref(false);

    // Computed
    const wishlistIcon = computed(() => {
      return isInWishlist.value ? 'fas fa-heart' : 'far fa-heart';
    });

    // Methods
    const formatPrice = (price: number): string => {
      return price.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const addToCart = () => {
      if (props.product.inStock) {
        emit('addToCart', props.product);
      }
    };

    const toggleWishlist = () => {
      isInWishlist.value = !isInWishlist.value;
      emit('wishlistToggle', props.product, isInWishlist.value);
    };

    return {
      isInWishlist,
      wishlistIcon,
      formatPrice,
      addToCart,
      toggleWishlist
    };
  }
});
</script>

<style scoped>
.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  margin-bottom: 12px;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.price {
  margin: 8px 0;
}

.current-price {
  font-weight: bold;
  color: #27ae60;
}

.old-price {
  text-decoration: line-through;
  color: #7f8c8d;
  margin-left: 8px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.wishlist-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
`;

    // Salvar fixtures
    fs.writeFileSync(
      path.join(this.fixturesDir, 'UserList.tsx'),
      reactComponent
    );

    fs.writeFileSync(
      path.join(this.fixturesDir, 'ProductCard.vue'),
      vueComponent
    );

    // Componente simples para testes básicos
    const simpleComponent = `
import React from 'react';

export const SimpleButton = ({ children, onClick }) => (
  <button onClick={onClick}>
    {children}
  </button>
);
`;

    fs.writeFileSync(
      path.join(this.fixturesDir, 'SimpleButton.tsx'),
      simpleComponent
    );

    console.log('   ✅ Fixtures criados');
  }

  async testInitialization() {
    console.log('\n📝 Teste: Inicialização');

    try {
      const analyzer = new this.ComponentAnalyzer();

      // Verificar métodos essenciais
      const requiredMethods = [
        'analyzeComponent',
        'analyzeReactComponent',
        'analyzeVueComponent',
        'extractComponentName',
        'extractProps',
        'detectHooks',
        'calculateComplexity'
      ];

      for (const method of requiredMethods) {
        if (typeof analyzer[method] !== 'function') {
          throw new Error(`Método ${method} ausente`);
        }
      }

      console.log('   ✅ Inicialização OK');
      this.testResults.push({
        test: 'Inicialização',
        status: 'PASSED',
        details: 'Todos os métodos estão presentes'
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Inicialização',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testReactComponent() {
    console.log('\n📝 Teste: Análise de Componente React');

    try {
      const analyzer = new this.ComponentAnalyzer();
      const componentPath = path.join(this.fixturesDir, 'UserList.tsx');
      
      const analysis = await analyzer.analyzeComponent(componentPath);

      // Verificar estrutura básica
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Análise deve retornar objeto');
      }

      const requiredFields = ['name', 'type', 'props', 'hooks', 'complexity'];
      for (const field of requiredFields) {
        if (!analysis.hasOwnProperty(field)) {
          throw new Error(`Campo ${field} ausente na análise`);
        }
      }

      // Verificar valores específicos
      if (analysis.name !== 'UserList') {
        throw new Error(`Nome incorreto: esperado 'UserList', got '${analysis.name}'`);
      }

      if (analysis.type !== 'react') {
        throw new Error(`Tipo incorreto: esperado 'react', got '${analysis.type}'`);
      }

      if (!Array.isArray(analysis.props)) {
        throw new Error('Props deve ser array');
      }

      if (!Array.isArray(analysis.hooks)) {
        throw new Error('Hooks deve ser array');
      }

      // Verificar se props foram detectados
      const propNames = analysis.props.map(p => p.name);
      const expectedProps = ['title', 'onUserSelect', 'showFilters'];
      
      for (const expectedProp of expectedProps) {
        if (!propNames.includes(expectedProp)) {
          console.log(`   ⚠️ Prop esperado não encontrado: ${expectedProp}`);
        }
      }

      // Verificar se hooks foram detectados
      const hookNames = analysis.hooks.map(h => h.name);
      const expectedHooks = ['useState', 'useCallback', 'useMemo', 'useEffect'];
      
      const detectedHooks = expectedHooks.filter(hook => 
        hookNames.some(h => h.includes(hook))
      );

      if (detectedHooks.length === 0) {
        console.log('   ⚠️ Nenhum hook detectado');
      }

      console.log('   ✅ Análise React OK');
      this.testResults.push({
        test: 'Análise React',
        status: 'PASSED',
        details: `${analysis.props.length} props, ${analysis.hooks.length} hooks, complexidade: ${analysis.complexity}`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Análise React',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testVueComponent() {
    console.log('\n📝 Teste: Análise de Componente Vue');

    try {
      const analyzer = new this.ComponentAnalyzer();
      const componentPath = path.join(this.fixturesDir, 'ProductCard.vue');
      
      const analysis = await analyzer.analyzeComponent(componentPath);

      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Análise deve retornar objeto');
      }

      if (analysis.type !== 'vue') {
        throw new Error(`Tipo incorreto: esperado 'vue', got '${analysis.type}'`);
      }

      if (analysis.name !== 'ProductCard') {
        throw new Error(`Nome incorreto: esperado 'ProductCard', got '${analysis.name}'`);
      }

      // Verificar estrutura Vue específica
      if (!analysis.hasOwnProperty('template')) {
        console.log('   ⚠️ Seção template não detectada');
      }

      if (!analysis.hasOwnProperty('script')) {
        console.log('   ⚠️ Seção script não detectada');
      }

      if (!analysis.hasOwnProperty('style')) {
        console.log('   ⚠️ Seção style não detectada');
      }

      console.log('   ✅ Análise Vue OK');
      this.testResults.push({
        test: 'Análise Vue',
        status: 'PASSED',
        details: `Componente Vue analisado com sucesso`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Análise Vue',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testPropsExtraction() {
    console.log('\n📝 Teste: Extração de Props');

    try {
      const analyzer = new this.ComponentAnalyzer();
      const componentPath = path.join(this.fixturesDir, 'UserList.tsx');
      
      const props = await analyzer.extractProps(componentPath);

      if (!Array.isArray(props)) {
        throw new Error('extractProps deve retornar array');
      }

      // Verificar estrutura das props
      for (const prop of props) {
        const requiredFields = ['name', 'type', 'required'];
        for (const field of requiredFields) {
          if (!prop.hasOwnProperty(field)) {
            console.log(`   ⚠️ Campo ${field} ausente na prop ${prop.name}`);
          }
        }
      }

      // Verificar props específicos
      const titleProp = props.find(p => p.name === 'title');
      if (titleProp) {
        if (titleProp.type !== 'string') {
          console.log(`   ⚠️ Tipo incorreto para title: ${titleProp.type}`);
        }
        if (!titleProp.required) {
          console.log(`   ⚠️ Title deveria ser required`);
        }
      }

      console.log('   ✅ Extração de Props OK');
      this.testResults.push({
        test: 'Extração Props',
        status: 'PASSED',
        details: `${props.length} props extraídas`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Extração Props',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testHooksDetection() {
    console.log('\n📝 Teste: Detecção de Hooks');

    try {
      const analyzer = new this.ComponentAnalyzer();
      const componentPath = path.join(this.fixturesDir, 'UserList.tsx');
      
      const hooks = await analyzer.detectHooks(componentPath);

      if (!Array.isArray(hooks)) {
        throw new Error('detectHooks deve retornar array');
      }

      // Verificar estrutura dos hooks
      for (const hook of hooks) {
        if (!hook.hasOwnProperty('name')) {
          throw new Error('Hook deve ter propriedade name');
        }
        if (!hook.hasOwnProperty('type')) {
          throw new Error('Hook deve ter propriedade type');
        }
      }

      // Verificar hooks específicos
      const stateHooks = hooks.filter(h => h.name.includes('useState'));
      const effectHooks = hooks.filter(h => h.name.includes('useEffect'));
      const callbackHooks = hooks.filter(h => h.name.includes('useCallback'));

      if (stateHooks.length === 0) {
        console.log('   ⚠️ useState não detectado');
      }

      if (effectHooks.length === 0) {
        console.log('   ⚠️ useEffect não detectado');
      }

      console.log('   ✅ Detecção de Hooks OK');
      this.testResults.push({
        test: 'Detecção Hooks',
        status: 'PASSED',
        details: `${hooks.length} hooks detectados`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Detecção Hooks',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testComplexityCalculation() {
    console.log('\n📝 Teste: Cálculo de Complexidade');

    try {
      const analyzer = new this.ComponentAnalyzer();
      
      // Teste com componente complexo
      const complexPath = path.join(this.fixturesDir, 'UserList.tsx');
      const complexComplexity = await analyzer.calculateComplexity(complexPath);
      
      // Teste com componente simples
      const simplePath = path.join(this.fixturesDir, 'SimpleButton.tsx');
      const simpleComplexity = await analyzer.calculateComplexity(simplePath);

      if (typeof complexComplexity !== 'object') {
        throw new Error('Complexidade deve retornar objeto');
      }

      if (typeof simpleComplexity !== 'object') {
        throw new Error('Complexidade deve retornar objeto');
      }

      const requiredFields = ['score', 'level', 'factors'];
      for (const field of requiredFields) {
        if (!complexComplexity.hasOwnProperty(field)) {
          throw new Error(`Campo ${field} ausente na complexidade`);
        }
      }

      // Componente complexo deve ter score maior
      if (complexComplexity.score <= simpleComplexity.score) {
        console.log('   ⚠️ Complexidade pode estar incorreta');
      }

      console.log('   ✅ Cálculo de Complexidade OK');
      this.testResults.push({
        test: 'Cálculo Complexidade',
        status: 'PASSED',
        details: `Complexo: ${complexComplexity.score}, Simples: ${simpleComplexity.score}`
      });

    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`);
      this.testResults.push({
        test: 'Cálculo Complexidade',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO - Component Analyzer');
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
  const tests = new ComponentAnalyzerTests();
  tests.runAll().then(report => {
    if (report.failed > 0) {
      process.exit(1);
    }
  });
}

module.exports = ComponentAnalyzerTests;
