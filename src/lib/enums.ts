import type {
  StatusAgendamento,
  StatusPosicao,
  StatusResiduo,
  TipoDeDestruicao,
  TipoDocumento,
} from "@/types/domain";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

interface EnumMeta {
  label: string;
  tone: Tone;
}

export const STATUS_AGENDAMENTO: Record<StatusAgendamento, EnumMeta> = {
  AGENDADO: { label: "Agendado", tone: "info" },
  CONFIRMADO: { label: "Confirmado", tone: "accent" },
  CANCELADO: { label: "Cancelado", tone: "danger" },
  CONCLUIDO: { label: "Concluído", tone: "success" },
};

export const STATUS_POSICAO: Record<StatusPosicao, EnumMeta> = {
  DISPONIVEL: { label: "Disponível", tone: "success" },
  OCUPADA: { label: "Ocupada", tone: "warning" },
  INATIVA: { label: "Inativa", tone: "neutral" },
  RESERVADA: { label: "Reservada", tone: "info" },
};

export const STATUS_RESIDUO: Record<StatusResiduo, EnumMeta> = {
  ARMAZENADO: { label: "Armazenado", tone: "info" },
  EM_TRATAMENTO: { label: "Em tratamento", tone: "warning" },
  DESTRUIDO: { label: "Destruído", tone: "success" },
};

export const TIPO_DESTRUICAO: Record<TipoDeDestruicao, EnumMeta> = {
  PROCESSO_FISCAL: { label: "Processo fiscal", tone: "info" },
  DESTRUICAO_DIRETA: { label: "Destruição direta", tone: "danger" },
  LOGISTICA_REVERSA: { label: "Logística reversa", tone: "accent" },
};

export const TIPO_DOCUMENTO: Record<TipoDocumento, EnumMeta> = {
  MTR: { label: "MTR", tone: "info" },
  DECLARACAO: { label: "Declaração", tone: "accent" },
  NOTA_FISCAL: { label: "Nota fiscal", tone: "neutral" },
};

// Ordem válida de transição de status do Resíduo (espelha ResiduoService#validarTransicao)
export const PROXIMO_STATUS_RESIDUO: Record<StatusResiduo, StatusResiduo | null> = {
  ARMAZENADO: "EM_TRATAMENTO",
  EM_TRATAMENTO: "DESTRUIDO",
  DESTRUIDO: null,
};

export function entries<T extends Record<string, EnumMeta>>(rec: T) {
  return Object.entries(rec) as [keyof T, EnumMeta][];
}
