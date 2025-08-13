import {
  DatePickerImproved,
  Filter,
  FilterToolbar,
  TextFilter,
  type FilterOption,
} from "@shared/components/filters";
import { CalendarIcon, FilterIcon, TagIcon, UserIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFilters } from "../../hooks/useFilters";

interface ComunicacoesToolbarProps {
  autores: string[];
  totalCount?: number;
}

export function ComunicacoesToolbar({ autores }: ComunicacoesToolbarProps) {
  const { filters, hasActiveFilters, resetFilters, updateFilters } =
    useFilters();
  const { t } = useTranslation("records");

  // 🎯 Tipo options with icons
  const tipoOptions: FilterOption[] = useMemo(
    () => [
      {
        label: t("form.types.comunicado"),
        value: "Comunicado",
        icon: <FilterIcon className="h-4 w-4 text-blue-500" />,
      },
      {
        label: t("form.types.aviso"),
        value: "Aviso",
        icon: <FilterIcon className="h-4 w-4 text-yellow-500" />,
      },
    ],
    [t],
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
      <div className="flex items-center gap-3">
        <TextFilter
          value={filters.search}
          onChange={(search) => updateFilters({ search })}
          placeholder={t("filters.searchPlaceholder")}
          className="w-full max-w-sm"
        />

        {/* Filter toolbar */}
        <FilterToolbar
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        >
          {/* Tipo filter */}
          <Filter
            title={t("filters.type")}
            options={tipoOptions}
            icon={<TagIcon className="h-4 w-4" />}
            value={filters.tipo || []}
            onChange={(values: (string | boolean)[]) => {
              updateFilters({ tipo: values as string[] });
            }}
          />

          {/* Autor filter */}
          {autorOptions.length > 0 && (
            <Filter
              title={t("filters.author")}
              options={autorOptions}
              icon={<UserIcon className="h-4 w-4" />}
              value={filters.autor || []}
              onChange={(values: (string | boolean)[]) => {
                updateFilters({ autor: values as string[] });
              }}
              placeholder={t("filters.authorPlaceholder")}
            />
          )}

          {/* Date range filter */}
          <DatePickerImproved
            title={t("filters.createdAt")}
            value={{
              startDate: filters.startDate || null,
              endDate: filters.endDate || null,
            }}
            onChange={(dateRange) =>
              updateFilters({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
              })
            }
            icon={<CalendarIcon className="h-4 w-4" />}
          />
        </FilterToolbar>
      </div>
    </div>
  );
}
