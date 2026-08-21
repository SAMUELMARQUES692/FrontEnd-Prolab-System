import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/icons";
import { usePaletes } from "./usePaletes";
import { PaleteFormDrawer } from "./PaleteFormDrawer";
import { PaletesGroupedTable } from "./PaletesGroupedTable";
import { ResiduoFormDrawer } from "@/features/residuos/ResiduoFormDrawer";
import { useAuth } from "@/context/AuthContext";
import type { PaleteResponse } from "@/types/domain";

export function PaletesPage() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = usePaletes();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [alocando, setAlocando] = useState<PaleteResponse | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p) => p.ticket.toLowerCase().includes(q) || p.prime.toLowerCase().includes(q));
  }, [data, query]);

  const primesCount = useMemo(() => new Set(filtered.map((p) => p.prime)).size, [filtered]);

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

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por ticket ou PRIME..." className="max-w-xs" />
        <span className="text-xs text-muted-2">
          {primesCount} recebimento(s) · {filtered.length} palete(s)
        </span>
      </div>

      <Card>
        <PaletesGroupedTable
          data={filtered}
          loading={isLoading}
          isAdmin={!!user?.isAdmin}
          onAlocar={setAlocando}
          emptyTitle="Nenhum palete encontrado"
          emptyDescription="Ajuste a busca ou cadastre um palete vinculado a um recebimento para vê-lo aparecer aqui."
        />
      </Card>

      <PaleteFormDrawer
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          refetch();
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
