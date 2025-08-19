import type { Comunicacao } from "@features/comunicacoes/schemas/comunicacao.schemas";
import {
  DatePickerImproved,
  Filter,
  FilterToolbar,
  TextFilter,
  type FilterOption,
} from "@shared/components/filters";
import { CalendarIcon, FilterIcon, TagIcon, UserIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFilters } from "../../hooks/useFilters";

interface ComunicacoesToolbarProps {
  comunicacoes: Comunicacao[];
  autores: string[];
  totalCount?: number;
  onFilteredDataChange: (filtered: Comunicacao[]) => void;
}

// 🎯 Filter configuration - single source of truth
const FILTER_CONFIG = {
  search: {
    key: "search" as const,
    searchableFields: ["titulo", "autor", "tipo", "descricao"] as const,
  },
  tipo: {
    key: "tipo" as const,
    field: "tipo" as const,
    options: [
      {
        value: "Comunicado",
        translationKey: "form.types.comunicado",
        color: "blue",
      },
      { value: "Aviso", translationKey: "form.types.aviso", color: "yellow" },
    ],
  },
  autor: {
    key: "autor" as const,
    field: "autor" as const,
  },
  dateRange: {
    startKey: "startDate" as const,
    endKey: "endDate" as const,
    field: "dataCriacao" as const,
  },
} as const;

export const ComunicacoesToolbar = memo(function ComunicacoesToolbar({
  comunicacoes,
  autores,
  onFilteredDataChange,
}: ComunicacoesToolbarProps) {
  const { filters, setFilters, hasActiveFilters, resetFilters } = useFilters();
  const { t } = useTranslation("records");

  // 🎯 Memoized filter options
  const filterOptions = useMemo(
    () => ({
      tipo: FILTER_CONFIG.tipo.options.map((option) => ({
        label: t(option.translationKey),
        value: option.value,
        icon: <FilterIcon className={`h-4 w-4 text-${option.color}-500`} />,
      })) as FilterOption[],

      autor: autores.map((autor) => ({
        label: autor,
        value: autor,
        icon: <UserIcon className="h-4 w-4 text-gray-500" />,
      })) as FilterOption[],
    }),
    [t, autores],
  );

  // 🎯 Central filtering logic with optimized predicates
  const applyFilters = useCallback(
    (data: Comunicacao[]) => {
      const predicates = [
        // Search predicate
        (item: Comunicacao) => {
          if (!filters.search) return true;
          const searchTerm = filters.search.toLowerCase();
          return FILTER_CONFIG.search.searchableFields.some((field) =>
            item[field]?.toLowerCase().includes(searchTerm),
          );
        },

        // Tipo predicate
        (item: Comunicacao) => {
          if (filters.tipo.length === 0) return true;
          return filters.tipo.includes(item[FILTER_CONFIG.tipo.field]);
        },

        // Autor predicate
        (item: Comunicacao) => {
          if (filters.autor.length === 0) return true;
          return filters.autor.some((autorFilter) =>
            item[FILTER_CONFIG.autor.field]
              .toLowerCase()
              .includes(autorFilter.toLowerCase()),
          );
        },

        // Date range predicate
        (item: Comunicacao) => {
          if (!filters.startDate && !filters.endDate) return true;
          const itemDate = new Date(item[FILTER_CONFIG.dateRange.field]);

          if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            startDate.setHours(0, 0, 0, 0);
            if (itemDate < startDate) return false;
          }

          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (itemDate > endDate) return false;
          }

          return true;
        },
      ];

      return data.filter((item) =>
        predicates.every((predicate) => predicate(item)),
      );
    },
    [filters],
  );

  // 🎯 Execute filtering and notify parent
  useMemo(() => {
    const filtered = applyFilters(comunicacoes);
    onFilteredDataChange(filtered);
    return filtered;
  }, [applyFilters, comunicacoes, onFilteredDataChange]);

  // 🎯 Optimized filter handlers
  const handleFilterChange = useMemo(
    () => ({
      search: (search: string) =>
        setFilters({ [FILTER_CONFIG.search.key]: search }),
      tipo: (values: string[]) =>
        setFilters({ [FILTER_CONFIG.tipo.key]: values }),
      autor: (values: string[]) =>
        setFilters({ [FILTER_CONFIG.autor.key]: values }),
      dateRange: (dateRange: {
        startDate: Date | null;
        endDate: Date | null;
      }) =>
        setFilters({
          [FILTER_CONFIG.dateRange.startKey]: dateRange.startDate,
          [FILTER_CONFIG.dateRange.endKey]: dateRange.endDate,
        }),
    }),
    [setFilters],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {/* Search */}
        <TextFilter
          value={filters.search}
          onChange={handleFilterChange.search}
          placeholder={t("filters.searchPlaceholder")}
          className="w-full max-w-sm"
        />

        {/* Filters */}
        <FilterToolbar
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        >
          {/* Tipo */}
          <Filter
            title={t("filters.type")}
            options={filterOptions.tipo}
            icon={<TagIcon className="h-4 w-4" />}
            value={filters.tipo}
            onChange={(values) => handleFilterChange.tipo(values as string[])}
          />

          {/* Autor */}
          {filterOptions.autor.length > 0 && (
            <Filter
              title={t("filters.author")}
              options={filterOptions.autor}
              icon={<UserIcon className="h-4 w-4" />}
              value={filters.autor}
              onChange={(values) =>
                handleFilterChange.autor(values as string[])
              }
              placeholder={t("filters.authorPlaceholder")}
            />
          )}

          {/* Date Range */}
          <DatePickerImproved
            title={t("filters.createdAt")}
            value={{
              startDate: filters.startDate,
              endDate: filters.endDate,
            }}
            onChange={handleFilterChange.dateRange}
            icon={<CalendarIcon className="h-4 w-4" />}
          />
        </FilterToolbar>
      </div>
    </div>
  );
});
