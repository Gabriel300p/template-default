import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table";
import type { Cell, Row, Table as TableType } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { memo } from "react";

interface OptimizedTableProps<TData> {
  table: TableType<TData>;
  enableAnimations?: boolean;
}

// Memoized table row for performance
const TableRowMemo = memo(function TableRowMemo<TData>({
  row,
  index,
  enableAnimations = true,
}: {
  row: Row<TData>;
  index: number;
  enableAnimations?: boolean;
}) {
  const RowComponent = enableAnimations ? motion.tr : "tr";
  const animationProps = enableAnimations
    ? {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        transition: { delay: index * 0.05, duration: 0.3 },
      }
    : {};

  return (
    <RowComponent
      key={row.id}
      {...animationProps}
      className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
    >
      {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </RowComponent>
  );
});

export function OptimizedTable<TData>({
  table,
  enableAnimations = true,
}: OptimizedTableProps<TData>) {
  const { rows } = table.getRowModel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-md border"
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows?.length ? (
            rows.map((row, index) => (
              <TableRowMemo
                key={row.id}
                row={row}
                index={index}
                enableAnimations={enableAnimations}
              />
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                Nenhum resultado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
}
