import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientesApi } from "@/api/clientes";
import type { ClienteRequest } from "@/types/domain";

const KEY = ["clientes"];

export function useClientes() {
  return useQuery({ queryKey: KEY, queryFn: clientesApi.listar });
}

export function useCadastrarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteRequest) => clientesApi.cadastrar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClienteRequest }) => clientesApi.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useInativarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientesApi.inativar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
