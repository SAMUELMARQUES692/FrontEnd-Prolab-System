import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { caminhoesApi } from "@/api/caminhoes";
import type { CaminhaoRequest } from "@/types/domain";

const KEY = ["caminhoes"];

export function useCaminhoes() {
  return useQuery({ queryKey: KEY, queryFn: caminhoesApi.listar });
}

export function useCadastrarCaminhao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CaminhaoRequest) => caminhoesApi.cadastrar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarCaminhao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CaminhaoRequest }) => caminhoesApi.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletarCaminhao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => caminhoesApi.deletar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
