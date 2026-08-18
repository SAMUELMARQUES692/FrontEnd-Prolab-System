import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconEdit, IconTrash } from "@/components/icons";
import { useUsuarios, useDeletarUsuario } from "./useUsuarios";
import { UsuarioFormDrawer } from "./UsuarioFormDrawer";
import { initials, formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { toApiError } from "@/api/http";
import type { UsuarioResponse } from "@/types/domain";

export function UsuariosPage() {
  const { user: current } = useAuth();
  const toast = useToast();
  const { data, isLoading } = useUsuarios();
  const deletar = useDeletarUsuario();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioResponse | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((u) => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [data, query]);

  const columns: Column<UsuarioResponse>[] = [
    {
      key: "nome",
      header: "Usuário",
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-xs font-semibold text-accent">
            {initials(u.nome)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{u.nome}</p>
            <p className="truncate text-xs text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "scopes",
      header: "Permissões",
      render: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {u.scopes.map((s) => (
            <Badge key={s} tone={s.toUpperCase().includes("ADMIN") ? "accent" : "neutral"}>
              {s}
            </Badge>
          ))}
        </div>
      ),
    },
    { key: "createdAt", header: "Cadastrado em", render: (u) => <span className="text-muted">{formatDate(u.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-1.5">
          <IconButton
            aria-label="Editar"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(u);
              setFormOpen(true);
            }}
          >
            <IconEdit className="h-4 w-4" />
          </IconButton>
          <IconButton
            aria-label="Excluir"
            variant="ghost"
            size="sm"
            disabled={u.email === current?.email}
            title={u.email === current?.email ? "Você não pode excluir sua própria conta" : "Excluir"}
            onClick={async () => {
              const ok = await confirmAction({
                title: `Excluir usuário ${u.nome}?`,
                description: "Essa ação não pode ser desfeita.",
                confirmLabel: "Excluir",
                danger: true,
              });
              if (!ok) return;
              try {
                await deletar.mutateAsync(u.id);
                toast.success("Usuário excluído");
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
        eyebrow="Administração"
        title="Usuários"
        description="Contas com acesso ao painel Prolab. Novos usuários se cadastram pela tela pública de cadastro."
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nome ou e-mail..." className="max-w-xs" />
        <span className="text-xs text-muted-2">
          {filtered.length} de {data?.length ?? 0} usuário(s)
        </span>
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} loading={isLoading} rowKey={(u) => u.id} emptyTitle="Nenhum usuário encontrado" />
      </Card>

      <UsuarioFormDrawer open={formOpen} onClose={() => setFormOpen(false)} usuario={editing} />
    </div>
  );
}
