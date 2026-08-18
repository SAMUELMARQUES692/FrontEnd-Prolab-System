import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Input";
import { IconEdit, IconPlus, IconRecebimento, IconTrash } from "@/components/icons";
import { useAgendamentos, useDeletarAgendamento } from "./useAgendamentos";
import { AgendamentoFormDrawer } from "./AgendamentoFormDrawer";
import { useClientes } from "@/features/clientes/useClientes";
import { RecebimentoFormDrawer } from "@/features/recebimentos/RecebimentoFormDrawer";
import { entries, STATUS_AGENDAMENTO, TIPO_DESTRUICAO } from "@/lib/enums";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/api/http";
import type { AgendamentoResponse, StatusAgendamento } from "@/types/domain";

type TabValue = StatusAgendamento | "TODOS";

export function AgendamentosPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, isLoading } = useAgendamentos();
  const { data: clientes } = useClientes();
  const deletar = useDeletarAgendamento();

  const [tab, setTab] = useState<TabValue>("TODOS");
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AgendamentoResponse | null>(null);
  const [recebimentoTarget, setRecebimentoTarget] = useState<AgendamentoResponse | null>(null);

  const clienteNome = useMemo(() => {
    const map = new Map((clientes ?? []).map((c) => [c.id, c.razaoSocial]));
    return (id: number) => map.get(id) ?? `Cliente #${id}`;
  }, [clientes]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) => {
      if (tab !== "TODOS" && a.status !== tab) return false;
      if (clienteFiltro && String(a.clienteId) !== clienteFiltro) return false;
      return true;
    });
  }, [data, tab, clienteFiltro]);

  const tabs: TabItem<TabValue>[] = [
    { value: "TODOS", label: "Todos", count: data?.length ?? 0 },
    ...entries(STATUS_AGENDAMENTO).map(([value, meta]) => ({
      value,
      label: meta.label,
      count: data?.filter((a) => a.status === value).length ?? 0,
    })),
  ];

  const columns: Column<AgendamentoResponse>[] = [
    {
      key: "cliente",
      header: "Cliente",
      render: (a) => (
        <div>
          <p className="font-medium">{clienteNome(a.clienteId)}</p>
          <p className="text-xs text-muted">{a.tipoResiduo}</p>
        </div>
      ),
    },
    {
      key: "tipo",
      header: "Destruição",
      render: (a) => {
        const meta = TIPO_DESTRUICAO[a.tipoDeDestruicao as keyof typeof TIPO_DESTRUICAO];
        return <Badge tone={meta?.tone ?? "neutral"}>{meta?.label ?? a.tipoDeDestruicao}</Badge>;
      },
    },
    { key: "paletes", header: "Paletes", render: (a) => a.quantidadePaletes },
    { key: "data", header: "Previsto para", render: (a) => <span className="text-muted">{formatDateTime(a.dataHoraPrevista)}</span> },
    {
      key: "status",
      header: "Status",
      render: (a) => <Badge tone={STATUS_AGENDAMENTO[a.status].tone}>{STATUS_AGENDAMENTO[a.status].label}</Badge>,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (a) => (
        <div className="flex justify-end gap-1.5">
          {user?.isAdmin && a.status !== "CANCELADO" && (
            <IconButton aria-label="Registrar recebimento" variant="ghost" size="sm" onClick={() => setRecebimentoTarget(a)}>
              <IconRecebimento className="h-4 w-4" />
            </IconButton>
          )}
          {user?.isAdmin && (
            <>
              <IconButton
                aria-label="Editar"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(a);
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
                    title: `Excluir agendamento #${a.id}?`,
                    description: "Essa ação não pode ser desfeita.",
                    confirmLabel: "Excluir",
                    danger: true,
                  });
                  if (!ok) return;
                  try {
                    await deletar.mutateAsync(a.id);
                    toast.success("Agendamento excluído");
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
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operação de pátio"
        title="Agendamentos"
        description="Programação de recebimento de cargas por cliente, tipo de resíduo e destinação."
        action={
          user?.isAdmin && (
            <Button
              icon={<IconPlus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Novo agendamento
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs items={tabs} value={tab} onChange={setTab} />
        <Select value={clienteFiltro} onChange={(e) => setClienteFiltro(e.target.value)} className="w-56">
          <option value="">Todos os clientes</option>
          {clientes?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.razaoSocial}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          rowKey={(a) => a.id}
          emptyTitle="Nenhum agendamento encontrado"
          emptyDescription="Ajuste os filtros ou crie um novo agendamento."
        />
      </Card>

      <AgendamentoFormDrawer open={formOpen} onClose={() => setFormOpen(false)} agendamento={editing} />
      <RecebimentoFormDrawer
        open={!!recebimentoTarget}
        onClose={() => setRecebimentoTarget(null)}
        agendamentoId={recebimentoTarget?.id}
        agendamentoLabel={recebimentoTarget?.tipoResiduo}
      />
    </div>
  );
}
