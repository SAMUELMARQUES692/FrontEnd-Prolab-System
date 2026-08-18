import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TableSkeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  rowKey,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription,
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[] | undefined;
  loading?: boolean;
  rowKey: (row: T) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}) {
  if (loading) {
    return (
      <div className="p-5">
        <TableSkeleton cols={columns.length} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-5">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-muted-2 ${col.headerClassName ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr
              key={rowKey(row)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.02, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border/60 last:border-0 ${onRowClick ? "cursor-pointer hover:bg-white/[0.03]" : ""} transition-colors`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-3.5 align-middle text-ink ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
