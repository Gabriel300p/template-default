import type { Comunicacao } from "@features/comunicacoes/schemas/comunicacao.schemas";
import {
  parseAsArrayOf,
  parseAsIsoDate,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useMemo } from "react";

// 🎯 Query parsers for URL persistence
const searchParser = parseAsString.withDefault("");
const tipoParser = parseAsArrayOf(parseAsString).withDefault([]);
const autorParser = parseAsArrayOf(parseAsString).withDefault([]);
const startDateParser = parseAsIsoDate;
const endDateParser = parseAsIsoDate;

export function useFilters() {
  const [filters, setFilters] = useQueryStates({
    search: searchParser,
    tipo: tipoParser,
    autor: autorParser,
    startDate: startDateParser,
    endDate: endDateParser,
  });

  // 🎯 Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      filters.search !== "" ||
      filters.tipo.length > 0 ||
      filters.autor.length > 0 ||
      filters.startDate !== null ||
      filters.endDate !== null,
    [filters],
  );

  // 🎯 Filter function for comunicacoes
  const filterComunicacoes = useMemo(() => {
    return (comunicacoes: Comunicacao[]): Comunicacao[] => {
      return comunicacoes.filter((comunicacao) => {
        // Search filter (título, autor, tipo, descrição)
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchableText = [
            comunicacao.titulo,
            comunicacao.autor,
            comunicacao.tipo,
            comunicacao.descricao,
          ]
            .join(" ")
            .toLowerCase();

          if (!searchableText.includes(searchTerm)) {
            return false;
          }
        }

        // Tipo filter
        if (filters.tipo.length > 0) {
          if (!filters.tipo.includes(comunicacao.tipo)) {
            return false;
          }
        }

        // Autor filter
        if (filters.autor.length > 0) {
          if (
            !filters.autor.some((autorFiltro) =>
              comunicacao.autor
                .toLowerCase()
                .includes(autorFiltro.toLowerCase()),
            )
          ) {
            return false;
          }
        }

        // Date range filter (dataCriacao)
        if (filters.startDate || filters.endDate) {
          const comunicacaoDate = new Date(comunicacao.dataCriacao);

          if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            startDate.setHours(0, 0, 0, 0);
            if (comunicacaoDate < startDate) {
              return false;
            }
          }

          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (comunicacaoDate > endDate) {
              return false;
            }
          }
        }

        return true;
      });
    };
  }, [filters]);

  // 🎯 Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      tipo: [],
      autor: [],
      startDate: null,
      endDate: null,
    });
  };

  // 🎯 Update filters (partial update)
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  return {
    filters,
    hasActiveFilters,
    filterComunicacoes,
    resetFilters,
    updateFilters,
  };
}
