import { coreHttp } from "./http";
import type { CaminhaoRequest, CaminhaoResponse } from "@/types/domain";

export const caminhoesApi = {
  listar: () => coreHttp.get<CaminhaoResponse[]>("/api/caminhoes").then((r) => r.data),
  cadastrar: (data: CaminhaoRequest) =>
    coreHttp.post<CaminhaoResponse>("/api/caminhoes", data).then((r) => r.data),
  atualizar: (id: number, data: CaminhaoRequest) =>
    coreHttp.put<CaminhaoResponse>(`/api/caminhoes/${id}`, data).then((r) => r.data),
  deletar: (id: number) => coreHttp.delete<void>(`/api/caminhoes/${id}`).then((r) => r.data),
};
