import { useToast } from "@shared/hooks";
import {
  QUERY_KEYS,
  createMutationOptions,
  createQueryOptions,
} from "@shared/lib/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  Comunicacao,
  ComunicacaoForm,
} from "../schemas/comunicacao.schemas";
import {
  createComunicacao,
  deleteComunicacao,
  fetchComunicacoes,
  updateComunicacao,
} from "../services/comunicacao.service";

// 🚀 Optimized hook with advanced caching and optimistic updates
export function useComunicacoes() {
  const { success, error: showErrorToast } = useToast();
  // 🔄 Optimized query with centralized configuration
  const {
    data: comunicacoes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.comunicacoes.all,
    ...createQueryOptions.list(fetchComunicacoes),
  });

  // 🚀 Create mutation with optimistic updates
  const createMutation = useMutation(
    createMutationOptions.withOptimisticUpdate<Comunicacao, ComunicacaoForm>({
      mutationFn: createComunicacao,
      queryKey: QUERY_KEYS.comunicacoes.all,
      optimisticUpdateFn: (oldData: unknown, newData: ComunicacaoForm) => {
        const comunicacoesList = oldData as Comunicacao[];
        const optimisticComunicacao: Comunicacao = {
          id: `temp-${Date.now()}`, // Temporary ID
          ...newData,
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
        };
        return [...comunicacoesList, optimisticComunicacao];
      },
      onError: (error) => {
        console.error("Failed to create comunicacao:", error);
        showErrorToast(
          "Erro ao criar comunicação",
          "Falha ao salvar no sistema.",
          "Verifique sua conexão com a internet e certifique-se de que todos os campos obrigatórios foram preenchidos corretamente.",
        );
      },
    }),
  );

  // 🚀 Update mutation with optimistic updates
  const updateMutation = useMutation(
    createMutationOptions.withOptimisticUpdate<
      Comunicacao,
      { id: string; data: ComunicacaoForm }
    >({
      mutationFn: ({ id, data }) => updateComunicacao(id, data),
      queryKey: QUERY_KEYS.comunicacoes.all,
      optimisticUpdateFn: (oldData: unknown, { id, data }) => {
        const comunicacoesList = oldData as Comunicacao[];
        return comunicacoesList.map((comunicacao) =>
          comunicacao.id === id ? { ...comunicacao, ...data } : comunicacao,
        );
      },
      onError: (error) => {
        console.error("Failed to update comunicacao:", error);
        showErrorToast(
          "Erro ao atualizar comunicação",
          "Falha ao salvar alterações.",
          "As alterações não puderam ser salvas. Verifique sua conexão e tente novamente em alguns instantes.",
        );
      },
    }),
  );

  // 🚀 Delete mutation with optimistic updates
  const deleteMutation = useMutation(
    createMutationOptions.withOptimisticUpdate<void, string>({
      mutationFn: deleteComunicacao,
      queryKey: QUERY_KEYS.comunicacoes.all,
      optimisticUpdateFn: (oldData: unknown, id: string) => {
        const comunicacoesList = oldData as Comunicacao[];
        return comunicacoesList.filter((comunicacao) => comunicacao.id !== id);
      },
      onError: (error) => {
        console.error("Failed to delete comunicacao:", error);
        showErrorToast(
          "Erro ao excluir comunicação",
          "Falha ao remover do sistema.",
          "A comunicação não pôde ser removida do sistema. Verifique suas permissões e tente novamente.",
        );
      },
    }),
  );

  // 🍞 Toast-enabled mutation wrappers
  const createWithToast = async (data: ComunicacaoForm) => {
    const result = await createMutation.mutateAsync(data);
    success(
      "Comunicação criada com sucesso!",
      `A comunicação "${data.titulo}" foi adicionada ao sistema.`,
      "A nova comunicação está agora disponível para visualização por todos os usuários autorizados.",
    );
    return result;
  };

  const updateWithToast = async (id: string, data: ComunicacaoForm) => {
    const result = await updateMutation.mutateAsync({ id, data });
    success(
      "Comunicação atualizada com sucesso!",
      `As alterações na comunicação "${data.titulo}" foram salvas.`,
      "Todas as modificações estão agora visíveis para os usuários do sistema.",
    );
    return result;
  };

  const deleteWithToast = async (id: string) => {
    const result = await deleteMutation.mutateAsync(id);
    success(
      "Comunicação excluída com sucesso!",
      "A comunicação foi removida permanentemente.",
      "Esta ação não pode ser desfeita. Os dados foram completamente removidos do sistema.",
    );
    return result;
  };

  return {
    comunicacoes,
    isLoading,
    error,
    createComunicacao: createWithToast,
    updateComunicacao: updateWithToast,
    deleteComunicacao: deleteWithToast,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
