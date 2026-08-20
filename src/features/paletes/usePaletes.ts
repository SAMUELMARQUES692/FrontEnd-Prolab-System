import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paletesApi } from "@/api/paletes";
import { getPaletesLocais, upsertPaleteLocal, getRecebimentosLocais, upsertRecebimentoLocal, type PaleteLocal } from "@/lib/storage";
import type { PaleteRequest } from "@/types/domain";

// Não existe endpoint de listagem para Palete (ver src/api/paletes.ts) —
// este hook gerencia o histórico local em localStorage como estado React,
// no mesmo espírito do useRecebimentosLocais.
export function usePaletesLocais() {
  const [items, setItems] = useState<PaleteLocal[]>(() => getPaletesLocais());

  const refresh = useCallback(() => setItems(getPaletesLocais()), []);

  return { items, refresh };
}

export function usePaletesPorRecebimento(recebimentoId: number | undefined) {
  const { items } = usePaletesLocais();
  if (!recebimentoId) return [];
  return items.filter((p) => p.recebimentoId === recebimentoId);
}

export function useCadastrarPalete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PaleteRequest) => paletesApi.cadastrar(data),
    onSuccess: (res) => {
      upsertPaleteLocal({
        id: res.id,
        ticket: res.ticket,
        recebimentoId: res.recebimentoId,
        numeroPalete: res.numeroPalete,
        tipo: res.tipo,
        peso: res.peso,
        estadoFisico: res.estadoFisico,
        createdAt: res.createdAt,
      });
      // O servidor soma o peso do palete ao pesoConferido do recebimento —
      // refletimos essa mesma conta no espelho local (ver PaleteService#cadastrar).
      const recebimentoLocal = getRecebimentosLocais().find((r) => r.id === res.recebimentoId);
      if (recebimentoLocal) {
        upsertRecebimentoLocal({
          ...recebimentoLocal,
          pesoConferido: (recebimentoLocal.pesoConferido ?? 0) + res.peso,
        });
      }
      qc.invalidateQueries({ queryKey: ["residuos"] });
    },
  });
}
