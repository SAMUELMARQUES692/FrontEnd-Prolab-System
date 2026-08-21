import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { CopyableCode } from "@/components/ui/CopyableCode";
import { IconArrowUpRight, IconPlus } from "@/components/icons";
import { usePaletes } from "./usePaletes";
import { PaleteFormDrawer } from "./PaleteFormDrawer";
import { ResiduoFormDrawer } from "@/features/residuos/ResiduoFormDrawer";
import { TIPO_RESIDUO, ESTADO_FISICO } from "@/lib/enums";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { PaleteResponse } from "@/types/domain";

export function PaletesPage() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = usePaletes();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [alocando, setAlocando] = useState<PaleteResponse | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [...data].sort((a, b) => b.id - a.id);
    return data
      .filter((p) => p.ticket.toLowerCase().includes(q) || p.prime.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id);
  }, [data, query]);

  const columns: Column<PaleteResponse>[] = [
    { key: "ticket", header: "Ticket", render: (p) => <CopyableCode value={p.ticket} /> },
    { key: "prime", header: "PRIME", render: (p) => <CopyableCode value={p.prime} /> },
    { key: "recebimento", header: "Recebimento", render: (p) => <span className="text-muted">#{p.recebimentoId}</span> },
    { key: "numero", header: "Nº do palete", render: (p) => p.numeroPalete },
    {
      key: "tipo",
      header: "Tipo de resíduo",
      render: (p) => {
        const meta = TIPO_RESIDUO[p.tipo as keyof typeof TIPO_RESIDUO];
        return meta ? (
          <div>
            <p className="text-sm">{meta.label}</p>
            <p className="text-xs text-muted-2">{meta.codigo}</p>
          </div>
        ) : (
          <span className="text-muted">{p.tipo}</span>
        );
      },
    },
    { key: "peso", header: "Peso", render: (p) => formatNumber(p.peso, "kg") },
    {
      key: "estado",
      header: "Estado físico",
      render: (p) => {
        const meta = ESTADO_FISICO[p.estadoFisico as keyof typeof ESTADO_FISICO];
        return meta ? <Badge tone={meta.tone}>{meta.label}</Badge> : <span className="text-muted">{p.estadoFisico}</span>;
      },
    },
    { key: "criado", header: "Criado em", render: (p) => <span className="text-muted">{formatDateTime(p.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) =>
        user?.isAdmin && (
          <div className="flex justify-end">
            <IconButton
              aria-label="Alocar em posição de estoque"
              variant="ghost"
              size="sm"
              title="Alocar em posição de estoque"
              onClick={() => setAlocando(p)}
            >
              <IconArrowUpRight className="h-4 w-4" />
            </IconButton>
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operação de pátio"
        title="Paletes"
        description="Lotes físicos de resíduo vinculados a um recebimento — geram ticket e número sequencial e alimentam o peso conferido."
        action={
          user?.isAdmin && (
            <Button icon={<IconPlus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
              Novo palete
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por ticket ou PRIME..." className="max-w-xs" />
        <span className="text-xs text-muted-2">
          {filtered.length} de {data?.length ?? 0} palete(s)
        </span>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          rowKey={(p) => p.id}
          emptyTitle="Nenhum palete encontrado"
          emptyDescription="Ajuste a busca ou cadastre um palete vinculado a um recebimento para vê-lo aparecer aqui."
        />
      </Card>

      <PaleteFormDrawer
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          refetch();
        }}
      />

      <ResiduoFormDrawer
        open={!!alocando}
        onClose={() => setAlocando(null)}
        defaultPaleteId={alocando?.id}
      />
    </div>
  );
}
