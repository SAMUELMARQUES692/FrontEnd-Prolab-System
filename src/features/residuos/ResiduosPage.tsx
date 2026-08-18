import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button, IconButton } from "@/components/ui/Button";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconArrowUpRight, IconEdit, IconPlus, IconTrash } from "@/components/icons";
import { useResiduosPorStatus, useAtualizarStatusResiduo, useDeletarResiduo } from "./useResiduos";
import { ResiduoFormDrawer } from "./ResiduoFormDrawer";
import { PROXIMO_STATUS_RESIDUO, STATUS_RESIDUO, entries } from "@/lib/enums";
import { formatDate, formatNumber } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/api/http";
import type { ResiduoResponse, StatusResiduo } from "@/types/domain";

export function ResiduosPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<StatusResiduo>("ARMAZENADO");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ResiduoResponse | null>(null);

  const { data, isLoading } = useResiduosPorStatus(tab);
  const avancarStatus = useAtualizarStatusResiduo();
  const deletar = useDeletarResiduo();

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((r) => r.tipoResiduo.toLowerCase().includes(q) || (r.mtrVinculado ?? "").toLowerCase().includes(q));
  }, [data, query]);

  const tabs: TabItem<StatusResiduo>[] = entries(STATUS_RESIDUO).map(([value, meta]) => ({
    value,
    label: meta.label,
  }));

  const columns: Column<ResiduoResponse>[] = [
    {
      key: "tipo",
      header: "Resíduo",
      render: (r) => (
        <div>
          <p className="font-medium">{r.tipoResiduo}</p>
          <p className="text-xs text-muted">Recebimento #{r.recebimentoId} · Posição #{r.posicaoId}</p>
        </div>
      ),
    },
    { key: "quantidade", header: "Quantidade", render: (r) => formatNumber(r.quantidade, "kg") },
    { key: "mtr", header: "MTR vinculado", render: (r) => <span className="text-muted">{r.mtrVinculado || "—"}</span> },
    {
      key: "destinacao",
      header: "Data destinação",
      render: (r) => <span className="text-muted">{r.dataDestinacao ? formatDate(r.dataDestinacao) : "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (r) => {
        const proximo = PROXIMO_STATUS_RESIDUO[r.status];
        return (
          <div className="flex justify-end gap-1.5">
            {user?.isAdmin && proximo && (
              <IconButton
                aria-label={`Avançar para ${STATUS_RESIDUO[proximo].label}`}
                variant="ghost"
                size="sm"
                title={`Avançar para ${STATUS_RESIDUO[proximo].label}`}
                onClick={async () => {
                  const ok = await confirmAction({
                    title: `Avançar status para "${STATUS_RESIDUO[proximo].label}"?`,
                    description: `${r.tipoResiduo} sairá de "${STATUS_RESIDUO[r.status].label}" para "${STATUS_RESIDUO[proximo].label}". Essa transição não pode ser revertida pela API.`,
                    confirmLabel: "Avançar",
                  });
                  if (!ok) return;
                  try {
                    await avancarStatus.mutateAsync({ id: r.id, novoStatus: proximo });
                    toast.success("Status atualizado", STATUS_RESIDUO[proximo].label);
                  } catch (err) {
                    toast.error("Não foi possível avançar status", toApiError(err).message);
                  }
                }}
              >
                <IconArrowUpRight className="h-4 w-4" />
              </IconButton>
            )}
            {user?.isAdmin && (
              <>
                <IconButton
                  aria-label="Editar"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(r);
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
                      title: `Excluir resíduo #${r.id}?`,
                      description: "Essa ação não pode ser desfeita.",
                      confirmLabel: "Excluir",
                      danger: true,
                    });
                    if (!ok) return;
                    try {
                      await deletar.mutateAsync(r.id);
                      toast.success("Resíduo excluído");
                    } catch (err) {
                      toast.error("Não foi possível excluir", toApiError(err).message);
                    }
                  }}
                >
                  <IconTrash className="h-4 w-4" />
                </IconButton>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Estoque"
        title="Resíduos"
        description="Itens armazenados, em tratamento ou já destinados — organizados pelo fluxo de status do backend."
        action={
          user?.isAdmin && (
            <Button
              icon={<IconPlus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Novo resíduo
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs items={tabs} value={tab} onChange={setTab} />
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por tipo ou MTR..." className="max-w-xs" />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          rowKey={(r) => r.id}
          emptyTitle={`Nenhum resíduo com status "${STATUS_RESIDUO[tab].label}"`}
          emptyDescription="Troque de aba ou cadastre um novo resíduo."
        />
      </Card>

      <ResiduoFormDrawer open={formOpen} onClose={() => setFormOpen(false)} residuo={editing} />
    </div>
  );
}
