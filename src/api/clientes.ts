import { coreHttp } from "./http";
import type { ClienteRequest, ClienteResponse } from "@/types/domain";

export const clientesApi = {
  listar: () => coreHttp.get<ClienteResponse[]>("/api/clientes").then((r) => r.data),
  buscarPorId: (id: number) => coreHttp.get<ClienteResponse>(`/api/clientes/${id}`).then((r) => r.data),
  buscarPorRazaoSocial: (razaoSocial: string) =>
    coreHttp
      .get<ClienteResponse>("/api/clientes/buscar-razao", { params: { razaoSocial } })
      .then((r) => r.data),
  cadastrar: (data: ClienteRequest) =>
    coreHttp.post<ClienteResponse>("/api/clientes", data).then((r) => r.data),
  atualizar: (id: number, data: ClienteRequest) =>
    coreHttp.put<ClienteResponse>(`/api/clientes/${id}`, data).then((r) => r.data),
  inativar: (id: number) => coreHttp.delete<void>(`/api/clientes/${id}`).then((r) => r.data),
};
