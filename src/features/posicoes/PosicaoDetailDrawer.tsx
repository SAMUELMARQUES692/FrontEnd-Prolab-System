import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatRing } from "@/components/ui/StatRing";
import { IconResiduo } from "@/components/icons";
import { posicoesApi } from "@/api/posicoes";
import { usePaletesLocais } from "@/features/paletes/usePaletes";
import { STATUS_POSICAO, STATUS_RESIDUO, TIPO_RESIDUO } from "@/lib/enums";
import { formatNumber } from "@/lib/format";
import type { PosicaoEstoqueResponse } from "@/types/domain";

export function PosicaoDetailDrawer({
  posicao,
  onClose,
}: {
  posicao: PosicaoEstoqueResponse | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["posicoes", "residuos", posicao?.codigo],
    queryFn: () => posicoesApi.residuosPorCodigo(posicao!.codigo),
    enabled: !!posicao,
  });
  const { items: paletes } = usePaletesLocais();

  // Resíduo não carrega mais o peso (isso ficou em Palete) — o total exibido
  // aqui só soma o peso dos paletes conhecidos nesta máquina, por isso pode
  // ficar abaixo do valor real quando o servidor tem residuos.somarPesoPorPosicao
  // computado a partir de paletes cadastrados em outro dispositivo.
  const paleteById = useMemo(() => new Map(paletes.map((p) => [p.id, p])), [paletes]);
  const total = data?.reduce((acc, r) => acc + (paleteById.get(r.paleteId)?.peso ?? 0), 0) ?? 0;
  const percent = posicao?.capacidade ? Math.min(100, (total / posicao.capacidade) * 100) : 0;

  return (
    <Drawer open={!!posicao} onClose={onClose} title={posicao?.codigo ?? ""} subtitle={posicao ? STATUS_POSICAO[posicao.status].label : ""}>
      {posicao && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 rounded-lg border border-border bg-canvas-2/50 p-4">
            <div className="relative flex items-center justify-center">
              <StatRing percent={percent} size={64} tone={STATUS_POSICAO[posicao.status].tone} />
              <span className="absolute font-display text-xs text-ink">{Math.round(percent)}%</span>
            </div>
            <div>
              <p className="text-xs text-muted">Ocupação</p>
              <p className="font-display text-lg tracking-tight text-ink">
                {formatNumber(total, "kg")} {posicao.capacidade ? `/ ${formatNumber(posicao.capacidade, "kg")}` : ""}
              </p>
              <Badge tone={STATUS_POSICAO[posicao.status].tone} className="mt-1.5">
                {STATUS_POSICAO[posicao.status].label}
              </Badge>
            </div>
          </div>

          <div>
            <p className="mb-3 font-display text-sm tracking-tight text-ink">Resíduos nesta posição</p>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : !data || data.length === 0 ? (
              <EmptyState icon={<IconResiduo className="h-5 w-5" />} title="Nenhum resíduo alocado" />
            ) : (
              <ul className="flex flex-col gap-2">
                {data.map((r) => {
                  const palete = paleteById.get(r.paleteId);
                  const tipoMeta = palete ? TIPO_RESIDUO[palete.tipo as keyof typeof TIPO_RESIDUO] : undefined;
                  return (
                    <li key={r.id} className="rounded-lg border border-border bg-canvas-2/40 p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{tipoMeta?.label ?? `Palete #${r.paleteId}`}</p>
                        <Badge tone={STATUS_RESIDUO[r.status].tone}>{STATUS_RESIDUO[r.status].label}</Badge>
                      </div>
                      <p className="mt-1.5 text-xs text-muted">
                        {palete ? formatNumber(palete.peso, "kg") : "Peso indisponível — palete não listado nesta máquina"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
