import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CopyableCode } from "@/components/ui/CopyableCode";
import { IconAlert, IconEdit, IconPalete, IconRecebimento, IconTrash } from "@/components/icons";
import { useRecebimentosLocais, useDeletarRecebimento } from "./useRecebimentos";
import { RecebimentoFormDrawer } from "./RecebimentoFormDrawer";
import { PaleteFormDrawer } from "@/features/paletes/PaleteFormDrawer";
import { useClientes } from "@/features/clientes/useClientes";
import { useCaminhoes } from "@/features/caminhoes/useCaminhoes";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/api/http";
import type { RecebimentoLocal } from "@/lib/storage";

export function RecebimentosPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { items, refresh } = useRecebimentosLocais();
  const { data: clientes } = useClientes();
  const { data: caminhoes } = useCaminhoes();
  const deletar = useDeletarRecebimento();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecebimentoLocal | null>(null);
  const [manualId, setManualId] = useState("");
  const [paleteRecebimentoId, setPaleteRecebimentoId] = useState<number | null>(null);

  const clienteNome = useMemo(() => {
    const map = new Map((clientes ?? []).map((c) => [c.id, c.razaoSocial]));
    return (id: number) => map.get(id) ?? `Cliente #${id}`;
  }, [clientes]);

  const caminhaoPlaca = useMemo(() => {
    const map = new Map((caminhoes ?? []).map((c) => [c.id, c.placa]));
    return (id: number) => map.get(id) ?? `#${id}`;
  }, [caminhoes]);

  const columns: Column<RecebimentoLocal>[] = [
    { key: "prime", header: "PRIME", render: (r) => <CopyableCode value={r.prime} /> },
    { key: "cliente", header: "Cliente", render: (r) => clienteNome(r.clienteId) },
    { key: "caminhao", header: "Caminhão", render: (r) => <span className="font-mono">{caminhaoPlaca(r.caminhaoId)}</span> },
    { key: "data", header: "Recebido em", render: (r) => <span className="text-muted">{formatDateTime(r.dataHoraRecebimento)}</span> },
    { key: "peso", header: "Peso conferido", render: (r) => formatNumber(r.pesoConferido, "kg") },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (r) =>
        user?.isAdmin && (
          <div className="flex justify-end gap-1.5">
            <IconButton
              aria-label="Cadastrar palete"
              variant="ghost"
              size="sm"
              title="Cadastrar palete para este recebimento"
              onClick={() => setPaleteRecebimentoId(r.id)}
            >
              <IconPalete className="h-4 w-4" />
            </IconButton>
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
                  title: `Excluir recebimento ${r.prime}?`,
                  description: "Essa ação não pode ser desfeita.",
                  confirmLabel: "Excluir",
                  danger: true,
                });
                if (!ok) return;
                try {
                  await deletar.mutateAsync(r.id);
                  toast.success("Recebimento excluído");
                  refresh();
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
        eyebrow="Operação de pátio"
        title="Recebimentos"
        description="Registro da chegada da carga: caminhão, peso conferido e geração do código PRIME."
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-info/30 bg-info-soft px-4 py-3.5 text-xs leading-relaxed text-info">
        <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          O ProlabSystem não expõe endpoint de listagem para recebimentos (só criação/edição/exclusão). Por isso este
          histórico é mantido localmente, neste navegador. Para registrar um novo recebimento, use o botão{" "}
          <strong>"Registrar recebimento"</strong> na tela de Agendamentos — ou informe um ID de agendamento abaixo.
        </p>
      </div>

      {user?.isAdmin && (
        <Card>
          <div className="flex flex-wrap items-end gap-3 p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">ID do agendamento</label>
              <Input
                value={manualId}
                onChange={(e) => setManualId(e.target.value.replace(/\D/g, ""))}
                placeholder="Ex.: 12"
                className="w-40"
              />
            </div>
            <Button
              variant="secondary"
              icon={<IconRecebimento className="h-4 w-4" />}
              disabled={!manualId}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Registrar recebimento
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <DataTable
          columns={columns}
          data={items}
          rowKey={(r) => r.id}
          emptyTitle="Nenhum recebimento nesta máquina ainda"
          emptyDescription="Registre um recebimento a partir de um agendamento confirmado para vê-lo aparecer aqui."
        />
      </Card>

      <RecebimentoFormDrawer
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          refresh();
        }}
        agendamentoId={editing ? undefined : manualId ? Number(manualId) : undefined}
        recebimentoLocal={editing}
      />

      <PaleteFormDrawer
        open={paleteRecebimentoId !== null}
        onClose={() => {
          setPaleteRecebimentoId(null);
          refresh();
        }}
        defaultRecebimentoId={paleteRecebimentoId ?? undefined}
      />
    </div>
  );
}
