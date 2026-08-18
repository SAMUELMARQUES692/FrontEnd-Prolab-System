import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { posicoesApi } from "@/api/posicoes";
import type { PosicaoEstoqueRequest } from "@/types/domain";

const KEY = ["posicoes"];

export function usePosicoes() {
  return useQuery({ queryKey: KEY, queryFn: posicoesApi.listar });
}

export function useCadastrarPosicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PosicaoEstoqueRequest) => posicoesApi.cadastrar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarPosicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PosicaoEstoqueRequest }) => posicoesApi.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletarPosicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => posicoesApi.deletar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
