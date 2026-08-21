import { coreHttp } from "./http";
import type { RecebimentoRequest, RecebimentoResponse } from "@/types/domain";

// O backend expõe POST/PUT/DELETE e agora também GET para listar todos e
// GET por PRIME (código gerado no cadastro do recebimento).
export const recebimentosApi = {
  cadastrar: (data: RecebimentoRequest) =>
    coreHttp.post<RecebimentoResponse>("/api/recebimentos", data).then((r) => r.data),
  atualizar: (id: number, data: RecebimentoRequest) =>
    coreHttp.put<RecebimentoResponse>(`/api/recebimentos/${id}`, data).then((r) => r.data),
  deletar: (id: number) => coreHttp.delete<void>(`/api/recebimentos/${id}`).then((r) => r.data),
  listar: () => coreHttp.get<RecebimentoResponse[]>("/api/recebimentos").then((r) => r.data),
  buscarPorPrime: (prime: string) =>
    coreHttp.get<RecebimentoResponse>(`/api/recebimentos/prime/${encodeURIComponent(prime)}`).then((r) => r.data),
};
