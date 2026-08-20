import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { CopyableCode } from "@/components/ui/CopyableCode";
import { IconAlert, IconArrowUpRight, IconPlus } from "@/components/icons";
import { usePaletesLocais } from "./usePaletes";
import { PaleteFormDrawer } from "./PaleteFormDrawer";
import { ResiduoFormDrawer } from "@/features/residuos/ResiduoFormDrawer";
import { TIPO_RESIDUO, ESTADO_FISICO } from "@/lib/enums";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { PaleteLocal } from "@/lib/storage";

export function PaletesPage() {
  const { user } = useAuth();
  const { items, refresh } = usePaletesLocais();

  const [formOpen, setFormOpen] = useState(false);
  const [alocando, setAlocando] = useState<PaleteLocal | null>(null);

  const columns: Column<PaleteLocal>[] = [
    { key: "ticket", header: "Ticket", render: (p) => <CopyableCode value={p.ticket} /> },
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

      <div className="flex items-start gap-2.5 rounded-lg border border-info/30 bg-info-soft px-4 py-3.5 text-xs leading-relaxed text-info">
        <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          O ProlabSystem não expõe endpoint de listagem para paletes (só criação). Por isso este histórico é mantido
          localmente, neste navegador. Depois de cadastrar um palete, use <strong>"Alocar em posição de estoque"</strong>{" "}
          para registrar o resíduo correspondente.
        </p>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={items}
          rowKey={(p) => p.id}
          emptyTitle="Nenhum palete nesta máquina ainda"
          emptyDescription="Cadastre um palete vinculado a um recebimento para vê-lo aparecer aqui."
        />
      </Card>

      <PaleteFormDrawer
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          refresh();
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
