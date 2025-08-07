import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table";
import type { Table as TableType } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { memo } from "react";

interface OptimizedTableProps<TData> {
  table: TableType<TData>;
  enableAnimations?: boolean;
}

export function VirtualizedTable<TData>({
  table,
  height = 400,
  itemHeight = 50,
}: VirtualizedTableProps<TData>) {
  const { rows } = table.getRowModel();
  const visibleColumns = table.getVisibleFlatColumns();

  // Don't virtualize if we have less than 20 rows for better UX
  if (rows.length < 20) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="hover:bg-muted/50 border-b transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {cell.getValue() as React.ReactNode}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-md border"
    >
      {/* Fixed Header */}
      <div className="bg-muted/50 border-b">
        <div className="flex">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="flex items-center px-4 py-3 font-medium"
                style={{ width: header.getSize() }}
              >
                {header.isPlaceholder ? null : header.column.columnDef.header}
              </div>
            )),
          )}
        </div>
      </div>

      {/* Virtualized Body */}
      <List
        height={height}
        itemCount={rows.length}
        itemSize={itemHeight}
        itemData={{
          rows: rows.map((row) => row.getVisibleCells()),
          visibleColumns,
        }}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {VirtualizedRow}
      </List>
    </motion.div>
  );
}
