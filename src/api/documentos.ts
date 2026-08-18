import { coreHttp } from "./http";
import type { DocumentoClienteRequest, DocumentoClienteResponse } from "@/types/domain";

// O backend só expõe POST/PUT/DELETE/GET-by-id — sem listagem por cliente.
// Ver src/lib/storage.ts para o cache local que compensa a ausência de listagem.
export const documentosApi = {
  buscarPorId: (id: number) =>
    coreHttp.get<DocumentoClienteResponse>(`/api/documentos/${id}`).then((r) => r.data),
  cadastrar: (data: DocumentoClienteRequest) =>
    coreHttp.post<DocumentoClienteResponse>("/api/documentos", data).then((r) => r.data),
  atualizar: (id: number, data: DocumentoClienteRequest) =>
    coreHttp.put<DocumentoClienteResponse>(`/api/documentos/${id}`, data).then((r) => r.data),
  deletar: (id: number) => coreHttp.delete<void>(`/api/documentos/${id}`).then((r) => r.data),
};
