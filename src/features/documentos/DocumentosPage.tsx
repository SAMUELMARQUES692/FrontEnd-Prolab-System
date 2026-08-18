import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { IconAlert, IconDocumento, IconEdit, IconPlus, IconTrash } from "@/components/icons";
import { useDocumentosLocais, useDeletarDocumento, useBuscarDocumentoPorId } from "./useDocumentos";
import { DocumentoFormDrawer } from "./DocumentoFormDrawer";
import { useClientes } from "@/features/clientes/useClientes";
import { TIPO_DOCUMENTO } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/api/http";
import type { DocumentoLocal } from "@/lib/storage";

export function DocumentosPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { items, refresh } = useDocumentosLocais();
  const { data: clientes } = useClientes();
  const deletar = useDeletarDocumento();
  const buscarPorId = useBuscarDocumentoPorId();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lookupId, setLookupId] = useState("");

  const clienteNome = useMemo(() => {
    const map = new Map((clientes ?? []).map((c) => [c.id, c.razaoSocial]));
    return (id: number) => map.get(id) ?? `Cliente #${id}`;
  }, [clientes]);

  const columns: Column<DocumentoLocal>[] = [
    {
      key: "tipo",
      header: "Documento",
      render: (d) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-white/6 text-muted">
            <IconDocumento className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium">#{d.id}</p>
            <p className="text-xs text-muted">{d.numero || "sem número"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "tipoBadge",
      header: "Tipo",
      render: (d) => {
        const meta = TIPO_DOCUMENTO[d.tipo as keyof typeof TIPO_DOCUMENTO];
        return <Badge tone={meta?.tone ?? "neutral"}>{meta?.label ?? d.tipo}</Badge>;
      },
    },
    { key: "cliente", header: "Cliente", render: (d) => clienteNome(d.clienteId) },
    { key: "recebimento", header: "Recebimento", render: (d) => (d.recebimentoId ? `#${d.recebimentoId}` : "—") },
    { key: "createdAt", header: "Criado em", render: (d) => <span className="text-muted">{formatDate(d.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (d) =>
        user?.isAdmin && (
          <div className="flex justify-end gap-1.5">
            <IconButton
              aria-label="Editar"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingId(d.id);
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
                  title: `Excluir documento #${d.id}?`,
                  description: "Essa ação não pode ser desfeita.",
                  confirmLabel: "Excluir",
                  danger: true,
                });
                if (!ok) return;
                try {
                  await deletar.mutateAsync(d.id);
                  toast.success("Documento excluído");
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
        eyebrow="Compliance"
        title="Documentos"
        description="MTRs, declarações e notas fiscais vinculados aos clientes e recebimentos."
        action={
          user?.isAdmin && (
            <Button
              icon={<IconPlus className="h-4 w-4" />}
              onClick={() => {
                setEditingId(null);
                setFormOpen(true);
              }}
            >
              Novo documento
            </Button>
          )
        }
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-info/30 bg-info-soft px-4 py-3.5 text-xs leading-relaxed text-info">
        <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          O ProlabSystem não expõe listagem de documentos (só criação, edição, exclusão e busca por ID). Este
          histórico é local a este navegador; use a busca abaixo para trazer um documento existente pelo ID.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Buscar documento por ID</label>
            <Input value={lookupId} onChange={(e) => setLookupId(e.target.value.replace(/\D/g, ""))} placeholder="Ex.: 7" className="w-40" />
          </div>
          <Button
            variant="secondary"
            loading={buscarPorId.isPending}
            disabled={!lookupId}
            onClick={async () => {
              try {
                await buscarPorId.mutateAsync(Number(lookupId));
                toast.success("Documento encontrado");
                setLookupId("");
                refresh();
              } catch (err) {
                toast.error("Documento não encontrado", toApiError(err).message);
              }
            }}
          >
            Buscar
          </Button>
        </div>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          data={items}
          rowKey={(d) => d.id}
          emptyTitle="Nenhum documento nesta máquina ainda"
          emptyDescription="Cadastre um novo documento ou busque um existente pelo ID."
        />
      </Card>

      <DocumentoFormDrawer
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          refresh();
        }}
        documentoId={editingId}
      />
    </div>
  );
}
