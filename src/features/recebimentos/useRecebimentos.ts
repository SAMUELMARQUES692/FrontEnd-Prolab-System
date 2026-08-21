import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recebimentosApi } from "@/api/recebimentos";
import {
  getRecebimentosLocais,
  removeRecebimentoLocal,
  upsertRecebimentoLocal,
  type RecebimentoLocal,
} from "@/lib/storage";
import type { RecebimentoRequest } from "@/types/domain";

const KEY = ["recebimentos"];

// O backend agora expõe listagem completa de recebimentos.
export function useRecebimentos() {
  return useQuery({ queryKey: KEY, queryFn: recebimentosApi.listar });
}

// Busca um recebimento específico pelo código PRIME.
export function useBuscarRecebimentoPorPrime(prime: string | null) {
  return useQuery({
    queryKey: [...KEY, "prime", prime],
    queryFn: () => recebimentosApi.buscarPorPrime(prime as string),
    enabled: !!prime,
  });
}

// Mantido como espelho local extra (histórico "visto neste navegador").
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
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useAtualizarRecebimento() {
  const qc = useQueryClient();
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
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useDeletarRecebimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recebimentosApi.deletar(id),
    onSuccess: (_res, id) => {
      removeRecebimentoLocal(id);
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}
