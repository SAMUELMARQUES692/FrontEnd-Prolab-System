import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button, IconButton } from "@/components/ui/Button";
import { IconCaminhao, IconEdit, IconPlus, IconTrash } from "@/components/icons";
import { useCaminhoes, useDeletarCaminhao } from "./useCaminhoes";
import { CaminhaoFormDrawer } from "./CaminhaoFormDrawer";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/api/http";
import type { CaminhaoResponse } from "@/types/domain";

export function CaminhoesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, isLoading } = useCaminhoes();
  const deletar = useDeletarCaminhao();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CaminhaoResponse | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => c.placa.toLowerCase().includes(q) || c.motorista.toLowerCase().includes(q));
  }, [data, query]);

  const columns: Column<CaminhaoResponse>[] = [
    {
      key: "placa",
      header: "Placa",
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-white/6 text-muted">
            <IconCaminhao className="h-4 w-4" />
          </span>
          <span className="font-mono text-sm font-medium tracking-wide">{c.placa}</span>
        </div>
      ),
    },
    { key: "modelo", header: "Modelo", render: (c) => <span className="text-muted">{c.modelo || "—"}</span> },
    { key: "motorista", header: "Motorista", render: (c) => c.motorista },
    { key: "createdAt", header: "Cadastrado em", render: (c) => <span className="text-muted">{formatDate(c.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (c) =>
        user?.isAdmin && (
          <div className="flex justify-end gap-1.5">
            <IconButton
              aria-label="Editar"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(c);
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
                  title: `Excluir caminhão ${c.placa}?`,
                  description: "Essa ação não pode ser desfeita.",
                  confirmLabel: "Excluir",
                  danger: true,
                });
                if (!ok) return;
                try {
                  await deletar.mutateAsync(c.id);
                  toast.success("Caminhão excluído");
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
        eyebrow="Frota"
        title="Caminhões"
        description="Veículos utilizados no recebimento de cargas — cadastrados automaticamente no primeiro recebimento ou manualmente aqui."
        action={
          user?.isAdmin && (
            <Button
              icon={<IconPlus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Novo caminhão
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por placa ou motorista..." className="max-w-xs" />
        <span className="text-xs text-muted-2">
          {filtered.length} de {data?.length ?? 0} caminhão(ões)
        </span>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          rowKey={(c) => c.id}
          emptyTitle="Nenhum caminhão cadastrado"
          emptyDescription="Caminhões também são criados automaticamente ao registrar um recebimento com uma placa nova."
        />
      </Card>

      <CaminhaoFormDrawer open={formOpen} onClose={() => setFormOpen(false)} caminhao={editing} />
    </div>
  );
}
