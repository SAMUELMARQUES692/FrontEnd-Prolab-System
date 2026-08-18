import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usuariosApi } from "@/api/auth";
import type { UsuarioRequest } from "@/types/domain";

const KEY = ["usuarios"];

export function useUsuarios() {
  return useQuery({ queryKey: KEY, queryFn: usuariosApi.listar });
}

export function useAtualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsuarioRequest }) => usuariosApi.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.deletar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
