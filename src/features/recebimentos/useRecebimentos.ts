import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recebimentosApi } from "@/api/recebimentos";
import {
  getRecebimentosLocais,
  removeRecebimentoLocal,
  upsertRecebimentoLocal,
  type RecebimentoLocal,
} from "@/lib/storage";
import type { RecebimentoRequest } from "@/types/domain";

// Não existe cache de servidor para listar (ver src/api/recebimentos.ts) —
// este hook gerencia o histórico local em localStorage como estado React.
export function useRecebimentosLocais() {
  const [items, setItems] = useState<RecebimentoLocal[]>(() => getRecebimentosLocais());

  const refresh = useCallback(() => setItems(getRecebimentosLocais()), []);

  const remove = useCallback((id: number) => {
    removeRecebimentoLocal(id);
    refresh();
  }, [refresh]);

  return { items, refresh, remove };
}

export function useCadastrarRecebimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecebimentoRequest) => recebimentosApi.cadastrar(data),
    onSuccess: (res) => {
      upsertRecebimentoLocal({
        id: res.id,
        prime: res.prime,
        agendamentoId: res.agendamentoId,
        clienteId: res.clienteId,
        caminhaoId: res.caminhaoId,
        dataHoraRecebimento: res.dataHoraRecebimento,
        pesoConferido: res.pesoConferido,
        observacoes: res.observacoes,
        createdAt: res.createdAt,
      });
      qc.invalidateQueries({ queryKey: ["caminhoes"] });
    },
  });
}

export function useAtualizarRecebimento() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecebimentoRequest }) => recebimentosApi.atualizar(id, data),
    onSuccess: (res) => {
      upsertRecebimentoLocal({
        id: res.id,
        prime: res.prime,
        agendamentoId: res.agendamentoId,
        clienteId: res.clienteId,
        caminhaoId: res.caminhaoId,
        dataHoraRecebimento: res.dataHoraRecebimento,
        pesoConferido: res.pesoConferido,
        observacoes: res.observacoes,
        createdAt: res.createdAt,
      });
    },
  });
}

export function useDeletarRecebimento() {
  return useMutation({
    mutationFn: (id: number) => recebimentosApi.deletar(id),
    onSuccess: (_res, id) => removeRecebimentoLocal(id),
  });
}
