import { Fragment, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";
import { CopyableCode } from "@/components/ui/CopyableCode";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { IconArrowUpRight } from "@/components/icons";
import { TIPO_RESIDUO, ESTADO_FISICO } from "@/lib/enums";
import { formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { PaleteResponse } from "@/types/domain";

interface PrimeGroup {
  prime: string;
  recebimentoId: number;
  paletes: PaleteResponse[];
  totalPeso: number;
  ultimaPesagem: string;
}

const thClass = "whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-muted-2";

// Uma linha por PRIME (recebimento) — os paletes daquele recebimento só
// aparecem quando o operador clica na linha para expandir.
export function PaletesGroupedTable({
  data,
  loading,
  isAdmin,
  onAlocar,
  emptyTitle,
  emptyDescription,
}: {
  data: PaleteResponse[];
  loading?: boolean;
  isAdmin?: boolean;
  onAlocar: (palete: PaleteResponse) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups = useMemo<PrimeGroup[]>(() => {
    const byPrime = new Map<string, PaleteResponse[]>();
    for (const p of data) {
      const list = byPrime.get(p.prime) ?? [];
      list.push(p);
      byPrime.set(p.prime, list);
    }
    return Array.from(byPrime.entries())
      .map(([prime, paletes]) => ({
        prime,
        recebimentoId: paletes[0].recebimentoId,
        paletes: [...paletes].sort((a, b) => b.numeroPalete - a.numeroPalete),
        totalPeso: paletes.reduce((acc, p) => acc + p.peso, 0),
        ultimaPesagem: paletes.reduce((max, p) => (p.createdAt > max ? p.createdAt : max), paletes[0].createdAt),
      }))
      .sort((a, b) => (a.ultimaPesagem < b.ultimaPesagem ? 1 : -1));
  }, [data]);

  const toggle = (prime: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(prime)) next.delete(prime);
      else next.add(prime);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-5">
        <TableSkeleton cols={5} />
      </div>
    );
  }

  if (groups.length === 0) {
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
            <th className={thClass}>PRIME</th>
            <th className={thClass}>Recebimento</th>
            <th className={thClass}>Paletes</th>
            <th className={thClass}>Peso total</th>
            <th className={thClass}>Última pesagem</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const isOpen = expanded.has(g.prime);
            return (
              <Fragment key={g.prime}>
                <tr
                  onClick={() => toggle(g.prime)}
                  className="cursor-pointer border-b border-border/60 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-3.5 align-middle text-ink">
                    <div className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={cn("h-3.5 w-3.5 shrink-0 text-muted-2 transition-transform duration-150", isOpen && "rotate-90")}
                      >
                        <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div onClick={(e) => e.stopPropagation()}>
                        <CopyableCode value={g.prime} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle text-muted">#{g.recebimentoId}</td>
                  <td className="px-5 py-3.5 align-middle">
                    <Badge tone="neutral">{g.paletes.length} palete{g.paletes.length === 1 ? "" : "s"}</Badge>
                  </td>
                  <td className="px-5 py-3.5 align-middle text-ink">{formatNumber(g.totalPeso, "kg")}</td>
                  <td className="px-5 py-3.5 align-middle text-muted">{formatDateTime(g.ultimaPesagem)}</td>
                </tr>
                <tr className="border-b border-border/60 last:border-0">
                  <td colSpan={5} className={cn("p-0", isOpen && "bg-canvas-2/30")}>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="overflow-hidden rounded-lg border border-border">
                              <table className="w-full border-collapse text-sm">
                                <thead>
                                  <tr className="border-b border-border/60 text-left">
                                    <th className="px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-2">Ticket</th>
                                    <th className="px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-2">Nº</th>
                                    <th className="px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-2">Tipo de resíduo</th>
                                    <th className="px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-2">Peso</th>
                                    <th className="px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-2">Estado físico</th>
                                    <th className="px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-2">Criado em</th>
                                    {isAdmin && <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-2" />}
                                  </tr>
                                </thead>
                                <tbody>
                                  {g.paletes.map((p) => {
                                    const tipoMeta = TIPO_RESIDUO[p.tipo as keyof typeof TIPO_RESIDUO];
                                    const estadoMeta = ESTADO_FISICO[p.estadoFisico as keyof typeof ESTADO_FISICO];
                                    return (
                                      <tr key={p.id} className="border-b border-border/40 last:border-0">
                                        <td className="px-4 py-2.5">
                                          <CopyableCode value={p.ticket} />
                                        </td>
                                        <td className="px-4 py-2.5 text-ink">{p.numeroPalete}</td>
                                        <td className="px-4 py-2.5">
                                          {tipoMeta ? (
                                            <div>
                                              <p className="text-sm">{tipoMeta.label}</p>
                                              <p className="text-xs text-muted-2">{tipoMeta.codigo}</p>
                                            </div>
                                          ) : (
                                            <span className="text-muted">{p.tipo}</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5 text-ink">{formatNumber(p.peso, "kg")}</td>
                                        <td className="px-4 py-2.5">
                                          {estadoMeta ? (
                                            <Badge tone={estadoMeta.tone}>{estadoMeta.label}</Badge>
                                          ) : (
                                            <span className="text-muted">{p.estadoFisico}</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5 text-muted">{formatDateTime(p.createdAt)}</td>
                                        {isAdmin && (
                                          <td className="px-4 py-2.5 text-right">
                                            <IconButton
                                              aria-label="Alocar em posição de estoque"
                                              variant="ghost"
                                              size="sm"
                                              title="Alocar em posição de estoque"
                                              onClick={() => onAlocar(p)}
                                            >
                                              <IconArrowUpRight className="h-4 w-4" />
                                            </IconButton>
                                          </td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
