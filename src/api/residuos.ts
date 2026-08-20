import { coreHttp } from "./http";
import type { ResiduoRequest, ResiduoResponse, StatusResiduo, TipoResiduo } from "@/types/domain";

export const residuosApi = {
  buscarPorId: (id: number) => coreHttp.get<ResiduoResponse>(`/api/residuos/${id}`).then((r) => r.data),
  porStatus: (status: StatusResiduo) =>
    coreHttp.get<ResiduoResponse[]>("/api/residuos/status-residuo", { params: { status } }).then((r) => r.data),
  porTipo: (tipo: TipoResiduo) =>
    coreHttp.get<ResiduoResponse[]>(`/api/residuos/${tipo}/tipo`).then((r) => r.data),
  porPosicao: (posicaoId: number) =>
    coreHttp.get<ResiduoResponse[]>(`/api/residuos/${posicaoId}/posicao`).then((r) => r.data),
  cadastrar: (data: ResiduoRequest) =>
    coreHttp.post<ResiduoResponse>("/api/residuos", data).then((r) => r.data),
  atualizar: (id: number, data: ResiduoRequest) =>
    coreHttp.put<ResiduoResponse>(`/api/residuos/${id}`, data).then((r) => r.data),
  atualizarStatus: (id: number, novoStatus: StatusResiduo) =>
    coreHttp.patch<ResiduoResponse>(`/api/residuos/${id}/status`, { novoStatus }).then((r) => r.data),
  deletar: (id: number) => coreHttp.delete<void>(`/api/residuos/${id}`).then((r) => r.data),
};
