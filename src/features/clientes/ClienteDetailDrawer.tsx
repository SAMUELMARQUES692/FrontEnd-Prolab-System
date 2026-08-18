import { useQuery } from "@tanstack/react-query";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconAgendamento } from "@/components/icons";
import { agendamentosApi } from "@/api/agendamentos";
import { STATUS_AGENDAMENTO, TIPO_DESTRUICAO } from "@/lib/enums";
import { formatCnpj, formatDate, formatDateTime } from "@/lib/format";
import type { ClienteResponse } from "@/types/domain";

export function ClienteDetailDrawer({
  cliente,
  onClose,
}: {
  cliente: ClienteResponse | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["agendamentos", "cliente", cliente?.id],
    queryFn: () => agendamentosApi.porCliente(cliente!.id),
    enabled: !!cliente,
  });

  return (
    <Drawer open={!!cliente} onClose={onClose} title={cliente?.razaoSocial ?? ""} subtitle={cliente ? formatCnpj(cliente.cnpj) : ""}>
      {cliente && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-canvas-2/50 p-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-2">Status</p>
              <Badge tone={cliente.ativo ? "success" : "neutral"} className="mt-1.5">
                {cliente.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-2">Cadastrado em</p>
              <p className="mt-1.5 text-sm">{formatDate(cliente.createdAt)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-2">Contato</p>
              <p className="mt-1.5 text-sm">{cliente.contato || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-2">Endereço</p>
              <p className="mt-1.5 text-sm leading-relaxed">{cliente.endereco || "—"}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 font-display text-sm tracking-tight text-ink">Agendamentos</p>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : !data || data.length === 0 ? (
              <EmptyState
                icon={<IconAgendamento className="h-5 w-5" />}
                title="Nenhum agendamento"
                description="Este cliente ainda não possui agendamentos registrados."
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {data
                  .sort((a, b) => b.id - a.id)
                  .map((a) => (
                    <li key={a.id} className="rounded-lg border border-border bg-canvas-2/40 p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-ink">{a.tipoResiduo}</p>
                        <Badge tone={STATUS_AGENDAMENTO[a.status].tone}>{STATUS_AGENDAMENTO[a.status].label}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span>{TIPO_DESTRUICAO[a.tipoDeDestruicao as keyof typeof TIPO_DESTRUICAO]?.label ?? a.tipoDeDestruicao}</span>
                        <span>{a.quantidadePaletes} palete(s)</span>
                        <span>{formatDateTime(a.dataHoraPrevista)}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
