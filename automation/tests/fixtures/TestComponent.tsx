
import React, { useState } from 'react';

interface TestComponentProps {
  title: string;
  onSubmit?: (data: any) => void;
  loading?: boolean;
}

/**
 * TestComponent - Componente de teste para validação
 * @param props - Propriedades do componente
 */
export const TestComponent: React.FC<TestComponentProps> = ({ 
  title, 
  onSubmit, 
  loading = false 
}) => {
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ filter });
  };

  return (
    <div className="test-component">
      <h2>{title}</h2>
      
      {/* Filtro */}
      <input
        type="search"
        placeholder="Filtrar resultados..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" required />
        <input type="email" name="email" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Enviar'}
        </button>
      </form>

      {/* Tabela */}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>João</td>
            <td>joao@email.com</td>
            <td>
              <button onClick={() => setIsModalOpen(true)}>Editar</button>
              <button onClick={() => console.log('delete')}>Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Modal de Edição</h3>
            <button onClick={() => setIsModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestComponent;
