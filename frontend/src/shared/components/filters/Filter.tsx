import { Badge, BadgeWithoutDot } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/components/ui/popover";
import { Separator } from "@shared/components/ui/separator";
import type { Column } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

export interface FilterOption {
  label: string;
  value: string | boolean;
  icon?: React.ReactNode;
  count?: number;
  isBooleanFilter?: boolean;
}

interface FilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: FilterOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  value?: (string | boolean)[];
  onChange?: (values: (string | boolean)[]) => void;
}

export function Filter<TData, TValue>({
  column,
  title,
  options,
  icon,
  placeholder,
  value: externalValue,
  onChange: externalOnChange,
}: FilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const columnFilterValue = column?.getFilterValue();

  const selectedValues = React.useMemo(() => {
    // Use external value if provided, otherwise use column filter value
    if (externalValue !== undefined) {
      return new Set(externalValue);
    }

    if (Array.isArray(columnFilterValue)) {
      return new Set(columnFilterValue as (string | boolean)[]);
    }

    if (columnFilterValue !== undefined) {
      return new Set([columnFilterValue] as (string | boolean)[]);
    }

    return new Set();
  }, [columnFilterValue, externalValue]);

  const isBooleanFilter = options.some((option) => option.isBooleanFilter);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-accent/50 h-10 gap-1.5 border border-slate-200 text-sm transition-colors"
          >
            {icon}
            {title}
            {selectedValues.size > 0 && (
              <>
                <Separator orientation="vertical" className="mx-0.5 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedValues.size} selecionados
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <BadgeWithoutDot
                          key={option.value.toString()}
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </BadgeWithoutDot>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-fit max-w-md p-0" align="start">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Command>
              <CommandInput
                placeholder={
                  placeholder || `Filtrar ${title?.toLowerCase()}...`
                }
              />
              <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup>
                  {options.map((option, index) => {
                    const isSelected = selectedValues.has(option.value);
                    const count =
                      option.count || facets?.get(option.value) || 0;

                    return (
                      <motion.div
                        key={option.value.toString()}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <CommandItem
                          className="hover:bg-accent/80 flex cursor-pointer items-center gap-2 transition-colors"
                          onSelect={() => {
                            if (isBooleanFilter) {
                              if (externalOnChange) {
                                externalOnChange([option.value]);
                              } else {
                                column?.setFilterValue(option.value);
                              }
                            } else {
                              const newSelectedValues = new Set(selectedValues);
                              if (isSelected) {
                                newSelectedValues.delete(option.value);
                              } else {
                                newSelectedValues.add(option.value);
                              }
                              const filterValues =
                                Array.from(newSelectedValues);

                              if (externalOnChange) {
                                externalOnChange(
                                  filterValues as (string | boolean)[],
                                );
                              } else {
                                column?.setFilterValue(
                                  filterValues.length
                                    ? filterValues
                                    : undefined,
                                );
                              }
                            }
                          }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.1 }}
                          >
                            <Checkbox checked={isSelected} />
                          </motion.div>
                          <div className="flex items-center gap-1.5">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                          {count > 0 && (
                            <motion.span
                              className="ml-auto flex h-4 w-4 items-center justify-center text-xs"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.05 + 0.1 }}
                            >
                              {count}
                            </motion.span>
                          )}
                        </CommandItem>
                      </motion.div>
                    );
                  })}
                </CommandGroup>
                {selectedValues.size > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CommandItem
                          onSelect={() => {
                            if (externalOnChange) {
                              externalOnChange([]);
                            } else {
                              column?.setFilterValue(undefined);
                            }
                          }}
                          className="justify-center text-center text-red-600 transition-colors hover:bg-red-50"
                        >
                          Limpar filtro
                        </CommandItem>
                      </motion.div>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
