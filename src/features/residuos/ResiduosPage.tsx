import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button, IconButton } from "@/components/ui/Button";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconArrowUpRight, IconEdit, IconPlus, IconTrash } from "@/components/icons";
import { useResiduosPorStatus, useResiduosPorCodigoPosicao, useAtualizarStatusResiduo, useDeletarResiduo } from "./useResiduos";
import { ResiduoFormDrawer } from "./ResiduoFormDrawer";
import { usePaletesLocais } from "@/features/paletes/usePaletes";
import { usePosicoes } from "@/features/posicoes/usePosicoes";
import { PROXIMO_STATUS_RESIDUO, STATUS_RESIDUO, TIPO_RESIDUO, entries } from "@/lib/enums";
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
  const [posicaoCodigo, setPosicaoCodigo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ResiduoResponse | null>(null);

  const buscandoPorPosicao = posicaoCodigo.trim().length > 0;
  const { data: porStatus, isLoading: loadingStatus } = useResiduosPorStatus(tab, !buscandoPorPosicao);
  const {
    data: porPosicao,
    isLoading: loadingPosicao,
    error: erroPosicao,
  } = useResiduosPorCodigoPosicao(buscandoPorPosicao ? posicaoCodigo.trim() : null);
  const data = buscandoPorPosicao ? porPosicao : porStatus;
  const isLoading = buscandoPorPosicao ? loadingPosicao : loadingStatus;

  const { items: paletes } = usePaletesLocais();
  const { data: posicoes } = usePosicoes();
  const avancarStatus = useAtualizarStatusResiduo();
  const deletar = useDeletarResiduo();

  // Resíduo não carrega tipo/peso (isso ficou em Palete) — enriquecemos com o
  // espelho local de paletes, quando disponível nesta máquina. Ticket e PRIME
  // já vêm prontos na própria response do resíduo.
  const paleteById = useMemo(() => new Map(paletes.map((p) => [p.id, p])), [paletes]);
  const posicaoById = useMemo(() => new Map((posicoes ?? []).map((p) => [p.id, p])), [posicoes]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((r) => {
      const palete = paleteById.get(r.paleteId);
      const tipoLabel = palete ? TIPO_RESIDUO[palete.tipo as keyof typeof TIPO_RESIDUO]?.label ?? palete.tipo : "";
      return (
        r.ticket.toLowerCase().includes(q) ||
        r.prime.toLowerCase().includes(q) ||
        tipoLabel.toLowerCase().includes(q) ||
        (r.mtrVinculado ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, query, paleteById]);

  const tabs: TabItem<StatusResiduo>[] = entries(STATUS_RESIDUO).map(([value, meta]) => ({
    value,
    label: meta.label,
  }));

  const columns: Column<ResiduoResponse>[] = [
    {
      key: "tipo",
      header: "Resíduo",
      render: (r) => {
        const palete = paleteById.get(r.paleteId);
        const tipoMeta = palete ? TIPO_RESIDUO[palete.tipo as keyof typeof TIPO_RESIDUO] : undefined;
        const codigoPosicao = posicaoById.get(r.posicaoId)?.codigo ?? `#${r.posicaoId}`;
        return (
          <div>
            <p className="font-medium">{tipoMeta?.label ?? `Palete #${r.paleteId}`}</p>
            <p className="text-xs text-muted">
              {r.ticket} · PRIME {r.prime} · Posição {codigoPosicao}
            </p>
          </div>
        );
      },
    },
    {
      key: "peso",
      header: "Peso",
      render: (r) => {
        const palete = paleteById.get(r.paleteId);
        return palete ? formatNumber(palete.peso, "kg") : <span className="text-muted-2">—</span>;
      },
    },
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
                    description: `Resíduo #${r.id} sairá de "${STATUS_RESIDUO[r.status].label}" para "${STATUS_RESIDUO[proximo].label}". Essa transição não pode ser revertida pela API.`,
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
        description="Alocações de paletes em posições de estoque — organizadas pelo fluxo de status do backend."
        action={
          user?.isAdmin && (
            <Button
              icon={<IconPlus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Alocar resíduo
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={buscandoPorPosicao ? "pointer-events-none opacity-50" : ""}>
          <Tabs items={tabs} value={tab} onChange={setTab} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={posicaoCodigo}
            onChange={setPosicaoCodigo}
            placeholder="Buscar por código da posição..."
            className="max-w-[220px] uppercase"
          />
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por ticket, PRIME, tipo ou MTR..." className="max-w-xs" />
        </div>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          rowKey={(r) => r.id}
          emptyTitle={
            buscandoPorPosicao
              ? erroPosicao
                ? `Posição "${posicaoCodigo}" não encontrada`
                : `Nenhum resíduo na posição "${posicaoCodigo}"`
              : `Nenhum resíduo com status "${STATUS_RESIDUO[tab].label}"`
          }
          emptyDescription={
            buscandoPorPosicao ? "Confira o código digitado." : "Troque de aba ou cadastre um novo resíduo."
          }
        />
      </Card>

      <ResiduoFormDrawer open={formOpen} onClose={() => setFormOpen(false)} residuo={editing} />
    </div>
  );
}
