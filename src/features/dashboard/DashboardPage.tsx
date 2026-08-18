import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatRing } from "@/components/ui/StatRing";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  IconAgendamento,
  IconArrowUpRight,
  IconCaminhao,
  IconClientes,
  IconResiduo,
} from "@/components/icons";
import { useClientes } from "@/features/clientes/useClientes";
import { useCaminhoes } from "@/features/caminhoes/useCaminhoes";
import { useAgendamentos } from "@/features/agendamentos/useAgendamentos";
import { useResiduosPorStatus } from "@/features/residuos/useResiduos";
import { usePosicoes } from "@/features/posicoes/usePosicoes";
import { entries, STATUS_AGENDAMENTO, STATUS_POSICAO, STATUS_RESIDUO } from "@/lib/enums";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const { data: caminhoes, isLoading: loadingCaminhoes } = useCaminhoes();
  const { data: agendamentos, isLoading: loadingAgendamentos } = useAgendamentos();
  const { data: posicoes, isLoading: loadingPosicoes } = usePosicoes();
  const { data: armazenados, isLoading: loadingArmazenados } = useResiduosPorStatus("ARMAZENADO");
  const { data: emTratamento } = useResiduosPorStatus("EM_TRATAMENTO");
  const { data: destruidos } = useResiduosPorStatus("DESTRUIDO");

  const clientesAtivos = clientes?.filter((c) => c.ativo).length ?? 0;

  const agendamentosPorStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    entries(STATUS_AGENDAMENTO).forEach(([status]) => (counts[status] = 0));
    agendamentos?.forEach((a) => (counts[a.status] = (counts[a.status] ?? 0) + 1));
    return counts;
  }, [agendamentos]);

  const posicoesPorStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    entries(STATUS_POSICAO).forEach(([status]) => (counts[status] = 0));
    posicoes?.forEach((p) => (counts[p.status] = (counts[p.status] ?? 0) + 1));
    return counts;
  }, [posicoes]);

  const pesoArmazenado = armazenados?.reduce((acc, r) => acc + r.quantidade, 0) ?? 0;
  const ocupacaoGeral = posicoes?.length
    ? (posicoesPorStatus.OCUPADA / posicoes.length) * 100
    : 0;

  const proximosAgendamentos = useMemo(() => {
    return (agendamentos ?? [])
      .filter((a) => a.status === "AGENDADO" || a.status === "CONFIRMADO")
      .sort((a, b) => new Date(a.dataHoraPrevista).getTime() - new Date(b.dataHoraPrevista).getTime())
      .slice(0, 5);
  }, [agendamentos]);

  const clienteNome = useMemo(() => {
    const map = new Map((clientes ?? []).map((c) => [c.id, c.razaoSocial]));
    return (id: number) => map.get(id) ?? `Cliente #${id}`;
  }, [clientes]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Visão geral"
        title={`Bem-vindo${user ? `, ${user.email.split("@")[0]}` : ""}`}
        description="Panorama da operação: clientes, frota, agendamentos, resíduos e ocupação do pátio."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IconClientes className="h-5 w-5" />}
          label="Clientes ativos"
          value={clientesAtivos}
          loading={loadingClientes}
          to="/clientes"
        />
        <StatCard
          icon={<IconCaminhao className="h-5 w-5" />}
          label="Caminhões na frota"
          value={caminhoes?.length ?? 0}
          loading={loadingCaminhoes}
          to="/caminhoes"
        />
        <StatCard
          icon={<IconAgendamento className="h-5 w-5" />}
          label="Agendamentos ativos"
          value={(agendamentosPorStatus.AGENDADO ?? 0) + (agendamentosPorStatus.CONFIRMADO ?? 0)}
          loading={loadingAgendamentos}
          to="/agendamentos"
        />
        <StatCard
          icon={<IconResiduo className="h-5 w-5" />}
          label="Resíduos armazenados"
          value={formatNumber(pesoArmazenado, "kg")}
          loading={loadingArmazenados}
          to="/residuos"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Agendamentos por status" subtitle="Distribuição atual de todos os agendamentos" />
          <CardBody>
            {loadingAgendamentos ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="flex flex-col gap-4">
                {entries(STATUS_AGENDAMENTO).map(([status, meta]) => {
                  const count = agendamentosPorStatus[status] ?? 0;
                  const total = agendamentos?.length || 1;
                  const pct = (count / total) * 100;
                  return (
                    <div key={status}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        <span className="text-muted">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-pill bg-white/6">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-pill"
                          style={{ background: `var(--color-${meta.tone === "neutral" ? "muted" : meta.tone})` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Ocupação do pátio" subtitle={`${posicoes?.length ?? 0} posição(ões) cadastradas`} />
          <CardBody>
            {loadingPosicoes ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <StatRing percent={ocupacaoGeral} size={104} stroke={8} tone="warning" />
                  <div className="absolute flex flex-col items-center">
                    <span className="font-display text-xl text-ink">{Math.round(ocupacaoGeral)}%</span>
                    <span className="text-[10px] text-muted-2">ocupado</span>
                  </div>
                </div>
                <div className="grid w-full grid-cols-2 gap-2">
                  {entries(STATUS_POSICAO).map(([status, meta]) => (
                    <div key={status} className="flex items-center gap-2 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--color-${meta.tone === "neutral" ? "muted" : meta.tone})` }} />
                      <span className="text-muted">{meta.label}</span>
                      <span className="ml-auto font-medium text-ink">{posicoesPorStatus[status] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Próximos agendamentos"
            subtitle="Agendados ou confirmados, ordenados por data prevista"
            action={
              <Link to="/agendamentos" className="flex items-center gap-1 text-xs text-accent hover:underline">
                Ver todos <IconArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody>
            {loadingAgendamentos ? (
              <Skeleton className="h-40 w-full" />
            ) : proximosAgendamentos.length === 0 ? (
              <EmptyState icon={<IconAgendamento className="h-5 w-5" />} title="Nenhum agendamento pendente" />
            ) : (
              <ul className="flex flex-col gap-2">
                {proximosAgendamentos.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-canvas-2/40 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{clienteNome(a.clienteId)}</p>
                      <p className="truncate text-xs text-muted">{a.tipoResiduo}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted">{formatDateTime(a.dataHoraPrevista)}</span>
                      <Badge tone={STATUS_AGENDAMENTO[a.status].tone}>{STATUS_AGENDAMENTO[a.status].label}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Resíduos por status" />
          <CardBody>
            <div className="flex flex-col gap-4">
              <ResiduoStatusRow label={STATUS_RESIDUO.ARMAZENADO.label} tone="info" items={armazenados} />
              <ResiduoStatusRow label={STATUS_RESIDUO.EM_TRATAMENTO.label} tone="warning" items={emTratamento} />
              <ResiduoStatusRow label={STATUS_RESIDUO.DESTRUIDO.label} tone="success" items={destruidos} />
            </div>
            <Link to="/residuos" className="mt-4 flex items-center gap-1 text-xs text-accent hover:underline">
              Gerenciar resíduos <IconArrowUpRight className="h-3 w-3" />
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading?: boolean;
  to: string;
}) {
  return (
    <Link to={to}>
      <Card className="p-5 transition-colors hover:bg-surface-hover">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-white/6 text-ink">{icon}</span>
          <div className="min-w-0">
            <p className="text-xs text-muted">{label}</p>
            {loading ? <Skeleton className="mt-1.5 h-6 w-16" /> : <p className="font-display text-xl tracking-tight text-ink">{value}</p>}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ResiduoStatusRow({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "info" | "warning" | "success";
  items?: { quantidade: number }[];
}) {
  const total = items?.reduce((acc, r) => acc + r.quantidade, 0) ?? 0;
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-canvas-2/40 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--color-${tone})` }} />
        <span className="text-sm text-ink">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-ink">{formatNumber(total, "kg")}</p>
        <p className="text-[11px] text-muted-2">{items?.length ?? 0} item(ns)</p>
      </div>
    </div>
  );
}
