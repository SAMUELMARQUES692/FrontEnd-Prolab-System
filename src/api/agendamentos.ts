import { coreHttp } from "./http";
import type { AgendamentoRequest, AgendamentoResponse, StatusAgendamento, TipoDeDestruicao } from "@/types/domain";

const TODOS_STATUS: StatusAgendamento[] = ["AGENDADO", "CONFIRMADO", "CANCELADO", "CONCLUIDO"];

export const agendamentosApi = {
  // Não existe GET geral no backend — agregamos chamando por status (o único
  // filtro disponível que cobre o domínio inteiro) e mesclamos no cliente.
  listarTodos: async (): Promise<AgendamentoResponse[]> => {
    const listas = await Promise.all(TODOS_STATUS.map((status) => agendamentosApi.porStatus(status)));
    return listas.flat().sort((a, b) => b.id - a.id);
  },
  porCliente: (clienteId: number) =>
    coreHttp.get<AgendamentoResponse[]>(`/api/agendamentos/cliente/${clienteId}`).then((r) => r.data),
  porStatus: (status: StatusAgendamento) =>
    coreHttp.get<AgendamentoResponse[]>(`/api/agendamentos/status/${status}`).then((r) => r.data),
  porTipoDeDestruicao: (tipo: TipoDeDestruicao) =>
    coreHttp
      .get<AgendamentoResponse[]>("/api/agendamentos/buscar-tipo", { params: { tipo } })
      .then((r) => r.data),
  cadastrar: (data: AgendamentoRequest) =>
    coreHttp.post<AgendamentoResponse>("/api/agendamentos", data).then((r) => r.data),
  atualizar: (id: number, data: AgendamentoRequest) =>
    coreHttp.put<AgendamentoResponse>(`/api/agendamentos/${id}`, data).then((r) => r.data),
  deletar: (id: number) => coreHttp.delete<void>(`/api/agendamentos/${id}`).then((r) => r.data),
};
