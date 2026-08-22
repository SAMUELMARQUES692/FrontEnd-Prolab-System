import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { residuosApi } from "@/api/residuos";
import type { ResiduoRequest, StatusResiduo } from "@/types/domain";

const KEY = (status: StatusResiduo) => ["residuos", status];

export function useResiduosPorStatus(status: StatusResiduo, enabled = true) {
  return useQuery({ queryKey: KEY(status), queryFn: () => residuosApi.porStatus(status), enabled });
}

// Busca resíduos alocados numa posição de estoque pelo código dela (ex.: "A-01"),
// independente do status — endpoint dedicado do ResiduoController.
export function useResiduosPorCodigoPosicao(codigo: string | null) {
  return useQuery({
    queryKey: ["residuos", "codigo", codigo],
    queryFn: () => residuosApi.porCodigoPosicao(codigo as string),
    enabled: !!codigo,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["residuos"] });
  qc.invalidateQueries({ queryKey: ["posicoes"] });
}

export function useCadastrarResiduo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ResiduoRequest) => residuosApi.cadastrar(data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAtualizarResiduo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResiduoRequest }) => residuosApi.atualizar(id, data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAtualizarStatusResiduo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, novoStatus }: { id: number; novoStatus: StatusResiduo }) =>
      residuosApi.atualizarStatus(id, novoStatus),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeletarResiduo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => residuosApi.deletar(id),
    onSuccess: () => invalidateAll(qc),
  });
}
