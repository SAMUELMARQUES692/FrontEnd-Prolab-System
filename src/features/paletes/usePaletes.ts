import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paletesApi } from "@/api/paletes";
import { getPaletesLocais, upsertPaleteLocal, getRecebimentosLocais, upsertRecebimentoLocal, type PaleteLocal } from "@/lib/storage";
import type { PaleteRequest } from "@/types/domain";

const KEY = ["paletes"];

// O backend agora expõe listagem completa de paletes.
export function usePaletes() {
  return useQuery({ queryKey: KEY, queryFn: paletesApi.listar });
}

// Busca todos os paletes vinculados a um recebimento pelo código PRIME.
export function useBuscarPaletesPorPrime(prime: string | null) {
  return useQuery({
    queryKey: [...KEY, "prime", prime],
    queryFn: () => paletesApi.buscarPorPrime(prime as string),
    enabled: !!prime,
  });
}

// Mantido como espelho local extra (histórico "visto neste navegador"),
// usado pela tela de pesagem contínua para retomar uma sessão em aberto.
export function usePaletesLocais() {
  const [items, setItems] = useState<PaleteLocal[]>(() => getPaletesLocais());

  const refresh = useCallback(() => setItems(getPaletesLocais()), []);

  return { items, refresh };
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
        prime: res.prime,
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
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["recebimentos"] });
      qc.invalidateQueries({ queryKey: ["residuos"] });
    },
  });
}
