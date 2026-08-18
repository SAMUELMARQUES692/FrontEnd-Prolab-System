import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agendamentosApi } from "@/api/agendamentos";
import type { AgendamentoRequest } from "@/types/domain";

const KEY = ["agendamentos"];

export function useAgendamentos() {
  return useQuery({ queryKey: KEY, queryFn: agendamentosApi.listarTodos });
}

export function useCadastrarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AgendamentoRequest) => agendamentosApi.cadastrar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AgendamentoRequest }) => agendamentosApi.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => agendamentosApi.deletar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
