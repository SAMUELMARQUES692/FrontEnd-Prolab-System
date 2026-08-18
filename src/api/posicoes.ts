import { coreHttp } from "./http";
import type { PosicaoEstoqueRequest, PosicaoEstoqueResponse, ResiduoResponse, StatusPosicao } from "@/types/domain";

export const posicoesApi = {
  listar: () => coreHttp.get<PosicaoEstoqueResponse[]>("/api/posicoes").then((r) => r.data),
  porStatus: (status: StatusPosicao) =>
    coreHttp.get<PosicaoEstoqueResponse[]>("/api/posicoes/posicao-status", { params: { status } }).then((r) => r.data),
  residuosPorCodigo: (codigo: string) =>
    coreHttp.get<ResiduoResponse[]>(`/api/posicoes/${encodeURIComponent(codigo)}/residuos`).then((r) => r.data),
  cadastrar: (data: PosicaoEstoqueRequest) =>
    coreHttp.post<PosicaoEstoqueResponse>("/api/posicoes", data).then((r) => r.data),
  atualizar: (id: number, data: PosicaoEstoqueRequest) =>
    coreHttp.put<PosicaoEstoqueResponse>(`/api/posicoes/${id}`, data).then((r) => r.data),
  deletar: (id: number) => coreHttp.delete<void>(`/api/posicoes/${id}`).then((r) => r.data),
};
