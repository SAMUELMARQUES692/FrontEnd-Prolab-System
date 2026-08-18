import { coreHttp } from "./http";
import type { RecebimentoRequest, RecebimentoResponse } from "@/types/domain";

// O backend só expõe POST/PUT/DELETE para Recebimento — não há GET nenhum.
// Ver src/lib/storage.ts para o cache local que compensa a ausência de listagem.
export const recebimentosApi = {
  cadastrar: (data: RecebimentoRequest) =>
    coreHttp.post<RecebimentoResponse>("/api/recebimentos", data).then((r) => r.data),
  atualizar: (id: number, data: RecebimentoRequest) =>
    coreHttp.put<RecebimentoResponse>(`/api/recebimentos/${id}`, data).then((r) => r.data),
  deletar: (id: number) => coreHttp.delete<void>(`/api/recebimentos/${id}`).then((r) => r.data),
};
