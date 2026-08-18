import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconBuilding, IconEdit, IconPlus, IconTrash } from "@/components/icons";
import { useClientes, useInativarCliente } from "./useClientes";
import { ClienteFormDrawer } from "./ClienteFormDrawer";
import { ClienteDetailDrawer } from "./ClienteDetailDrawer";
import { formatCnpj, formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/api/http";
import type { ClienteResponse } from "@/types/domain";

export function ClientesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, isLoading } = useClientes();
  const inativar = useInativarCliente();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteResponse | null>(null);
  const [detail, setDetail] = useState<ClienteResponse | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) => c.razaoSocial.toLowerCase().includes(q) || c.cnpj.includes(q.replace(/\D/g, ""))
    );
  }, [data, query]);

  const columns: Column<ClienteResponse>[] = [
    {
      key: "razaoSocial",
      header: "Cliente",
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-white/6 text-muted">
            <IconBuilding className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{c.razaoSocial}</p>
            <p className="truncate text-xs text-muted">{formatCnpj(c.cnpj)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contato",
      header: "Contato",
      render: (c) => <span className="text-muted">{c.contato || "—"}</span>,
    },
    {
      key: "createdAt",
      header: "Cadastrado em",
      render: (c) => <span className="text-muted">{formatDate(c.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <Badge tone={c.ativo ? "success" : "neutral"}>{c.ativo ? "Ativo" : "Inativo"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (c) =>
        user?.isAdmin && (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
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
            {c.ativo && (
              <IconButton
                aria-label="Inativar"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const ok = await confirmAction({
                    title: `Inativar ${c.razaoSocial}?`,
                    description: "O cliente deixará de aparecer nas listagens ativas. Essa ação não apaga o histórico.",
                    confirmLabel: "Inativar",
                    danger: true,
                  });
                  if (!ok) return;
                  try {
                    await inativar.mutateAsync(c.id);
                    toast.success("Cliente inativado");
                  } catch (err) {
                    toast.error("Não foi possível inativar", toApiError(err).message);
                  }
                }}
              >
                <IconTrash className="h-4 w-4" />
              </IconButton>
            )}
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cadastros"
        title="Clientes"
        description="Empresas atendidas pela Prolab — geradoras dos resíduos recebidos e destinados."
        action={
          user?.isAdmin && (
            <Button
              icon={<IconPlus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Novo cliente
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por razão social ou CNPJ..." className="max-w-xs" />
        <span className="text-xs text-muted-2">
          {filtered.length} de {data?.length ?? 0} cliente(s)
        </span>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          rowKey={(c) => c.id}
          onRowClick={setDetail}
          emptyTitle="Nenhum cliente encontrado"
          emptyDescription="Ajuste a busca ou cadastre um novo cliente para começar."
        />
      </Card>

      <ClienteFormDrawer open={formOpen} onClose={() => setFormOpen(false)} cliente={editing} />
      <ClienteDetailDrawer cliente={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
