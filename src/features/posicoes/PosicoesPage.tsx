import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { IconEdit, IconPlus, IconPosicao, IconTrash } from "@/components/icons";
import { usePosicoes, useDeletarPosicao } from "./usePosicoes";
import { PosicaoFormDrawer } from "./PosicaoFormDrawer";
import { PosicaoDetailDrawer } from "./PosicaoDetailDrawer";
import { entries, STATUS_POSICAO } from "@/lib/enums";
import { formatNumber } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/api/http";
import type { PosicaoEstoqueResponse, StatusPosicao } from "@/types/domain";

export function PosicoesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, isLoading } = usePosicoes();
  const deletar = useDeletarPosicao();

  const [statusFiltro, setStatusFiltro] = useState<StatusPosicao | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PosicaoEstoqueResponse | null>(null);
  const [detail, setDetail] = useState<PosicaoEstoqueResponse | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!statusFiltro) return data;
    return data.filter((p) => p.status === statusFiltro);
  }, [data, statusFiltro]);

  const columns: Column<PosicaoEstoqueResponse>[] = [
    {
      key: "codigo",
      header: "Código",
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-white/6 text-muted">
            <IconPosicao className="h-4 w-4" />
          </span>
          <span className="font-mono text-sm font-medium">{p.codigo}</span>
        </div>
      ),
    },
    { key: "capacidade", header: "Capacidade", render: (p) => (p.capacidade ? formatNumber(p.capacidade, "kg") : "—") },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge tone={STATUS_POSICAO[p.status].tone}>{STATUS_POSICAO[p.status].label}</Badge>,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) =>
        user?.isAdmin && (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <IconButton
              aria-label="Editar"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(p);
                setFormOpen(true);
              }}
            >
              <IconEdit className="h-4 w-4" />
            </IconButton>
            <IconButton
              aria-label="Excluir"
              variant="ghost"
              size="sm"
              onClick={async () => {
                const ok = await confirmAction({
                  title: `Excluir posição ${p.codigo}?`,
                  description: "Essa ação não pode ser desfeita.",
                  confirmLabel: "Excluir",
                  danger: true,
                });
                if (!ok) return;
                try {
                  await deletar.mutateAsync(p.id);
                  toast.success("Posição excluída");
                } catch (err) {
                  toast.error("Não foi possível excluir", toApiError(err).message);
                }
              }}
            >
              <IconTrash className="h-4 w-4" />
            </IconButton>
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pátio"
        title="Posições de estoque"
        description="Espaços físicos onde os resíduos recebidos são armazenados até a destinação."
        action={
          user?.isAdmin && (
            <Button
              icon={<IconPlus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Nova posição
            </Button>
          )
        }
      />

      <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as StatusPosicao | "")} className="w-56">
        <option value="">Todos os status</option>
        {entries(STATUS_POSICAO).map(([value, meta]) => (
          <option key={value} value={value}>
            {meta.label}
          </option>
        ))}
      </Select>

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          rowKey={(p) => p.id}
          onRowClick={setDetail}
          emptyTitle="Nenhuma posição encontrada"
          emptyDescription="Ajuste o filtro ou cadastre uma nova posição de estoque."
        />
      </Card>

      <PosicaoFormDrawer open={formOpen} onClose={() => setFormOpen(false)} posicao={editing} />
      <PosicaoDetailDrawer posicao={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
