import {
  DatePickerImproved,
  Filter,
  FilterToolbar,
  TextFilter,
  type FilterOption,
} from "@shared/components/filters";
import { CalendarIcon, FilterIcon, TagIcon, UserIcon } from "lucide-react";
import { useMemo } from "react";
import { useFilters } from "../../hooks/useFilters";

interface ComunicacoesToolbarProps {
  autores: string[];
  totalCount?: number;
}

export function ComunicacoesToolbar({
  autores,
  totalCount,
}: ComunicacoesToolbarProps) {
  const {
    filters,
    hasActiveFilters,
    resetFilters,
    setSearch,
    setTipo,
    setAutor,
    setDateRange,
  } = useFilters();

  // 🎯 Tipo options with icons
  const tipoOptions: FilterOption[] = useMemo(
    () => [
      {
        label: "Comunicado",
        value: "Comunicado",
        icon: <FilterIcon className="h-4 w-4 text-blue-500" />,
      },
      {
        label: "Aviso",
        value: "Aviso",
        icon: <FilterIcon className="h-4 w-4 text-yellow-500" />,
      },
      {
        label: "Notícia",
        value: "Notícia",
        icon: <FilterIcon className="h-4 w-4 text-green-500" />,
      },
    ],
    [],
  );

  // 🎯 Autor options from data
  const autorOptions: FilterOption[] = useMemo(
    () =>
      autores.map((autor) => ({
        label: autor,
        value: autor,
        icon: <UserIcon className="h-4 w-4 text-gray-500" />,
      })),
    [autores],
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center justify-between">
        <TextFilter
          value={filters.search}
          onChange={setSearch}
          placeholder="Pesquisar comunicações..."
          className="max-w-sm"
        />

        {totalCount && (
          <div className="text-muted-foreground text-sm">
            {totalCount} comunicaç{totalCount === 1 ? "ão" : "ões"} encontrada
            {totalCount === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {/* Filter toolbar */}
      <FilterToolbar hasActiveFilters={hasActiveFilters} onReset={resetFilters}>
        {/* Tipo filter */}
        <Filter
          title="Tipo"
          options={tipoOptions}
          icon={<TagIcon className="h-4 w-4" />}
          value={filters.tipo}
          onChange={(values: (string | boolean)[]) =>
            setTipo(values as string[])
          }
        />

        {/* Autor filter */}
        {autorOptions.length > 0 && (
          <Filter
            title="Autor"
            options={autorOptions}
            icon={<UserIcon className="h-4 w-4" />}
            value={filters.autor ? [filters.autor] : []}
            onChange={(values: (string | boolean)[]) =>
              setAutor((values[0] as string) || "")
            }
            placeholder="Filtrar por autor..."
          />
        )}

        {/* Date range filter */}
        <DatePickerImproved
          title="Data de Criação"
          value={filters.dateRange}
          onChange={setDateRange}
          icon={<CalendarIcon className="h-4 w-4" />}
        />
      </FilterToolbar>
    </div>
  );
}
