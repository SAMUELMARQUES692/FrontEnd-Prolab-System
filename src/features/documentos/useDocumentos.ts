import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { documentosApi } from "@/api/documentos";
import {
  getDocumentosLocais,
  removeDocumentoLocal,
  upsertDocumentoLocal,
  type DocumentoLocal,
} from "@/lib/storage";
import type { DocumentoClienteRequest } from "@/types/domain";

// Sem endpoint de listagem no backend (ver src/api/documentos.ts) — histórico local.
export function useDocumentosLocais() {
  const [items, setItems] = useState<DocumentoLocal[]>(() => getDocumentosLocais());
  const refresh = useCallback(() => setItems(getDocumentosLocais()), []);
  return { items, refresh };
}

function toLocal(res: { id: number; clienteId: number; recebimentoId: number | null; tipo: string; numero: string | null; createdAt: string }): DocumentoLocal {
  return {
    id: res.id,
    clienteId: res.clienteId,
    recebimentoId: res.recebimentoId,
    tipo: res.tipo,
    numero: res.numero,
    createdAt: res.createdAt,
  };
}

export function useCadastrarDocumento() {
  return useMutation({
    mutationFn: (data: DocumentoClienteRequest) => documentosApi.cadastrar(data),
    onSuccess: (res) => upsertDocumentoLocal(toLocal(res)),
  });
}

export function useAtualizarDocumento() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DocumentoClienteRequest }) => documentosApi.atualizar(id, data),
    onSuccess: (res) => upsertDocumentoLocal(toLocal(res)),
  });
}

export function useDeletarDocumento() {
  return useMutation({
    mutationFn: (id: number) => documentosApi.deletar(id),
    onSuccess: (_res, id) => removeDocumentoLocal(id),
  });
}

export function useBuscarDocumentoPorId() {
  return useMutation({
    mutationFn: (id: number) => documentosApi.buscarPorId(id),
    onSuccess: (res) => upsertDocumentoLocal(toLocal(res)),
  });
}
