import type {
  EstadoFisico,
  StatusAgendamento,
  StatusPosicao,
  StatusResiduo,
  TipoDeDestruicao,
  TipoDocumento,
  TipoResiduo,
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

export const ESTADO_FISICO: Record<EstadoFisico, EnumMeta> = {
  SOLIDO: { label: "Sólido", tone: "neutral" },
  LIQUIDO: { label: "Líquido", tone: "info" },
};

interface TipoResiduoMeta extends EnumMeta {
  codigo: string;
}

// Espelha o enum TipoResiduo do ProlabSystem — código MTR + descrição oficial.
export const TIPO_RESIDUO: Record<TipoResiduo, TipoResiduoMeta> = {
  CODIGO_16_05_08: {
    codigo: "16 05 08",
    label: "Produtos químicos orgânicos fora de uso com substâncias perigosas",
    tone: "danger",
  },
  CODIGO_15_02_02: {
    codigo: "15 02 02",
    label: "Absorventes, materiais filtrantes, panos e vestuário contaminados",
    tone: "warning",
  },
  CODIGO_15_01_10: {
    codigo: "15 01 10",
    label: "Embalagens contendo ou contaminadas por substâncias perigosas",
    tone: "warning",
  },
  CODIGO_20_01_35: {
    codigo: "20 01 35",
    label: "Eletroeletrônicos fora de uso com componentes perigosos",
    tone: "accent",
  },
  CODIGO_07_05_13: {
    codigo: "07 05 13",
    label: "Resíduos sólidos contendo substâncias perigosas",
    tone: "danger",
  },
};

// Ordem válida de transição de status do Resíduo (espelha ResiduoService#validarTransicao)
export const PROXIMO_STATUS_RESIDUO: Record<StatusResiduo, StatusResiduo | null> = {
  ARMAZENADO: "EM_TRATAMENTO",
  EM_TRATAMENTO: "DESTRUIDO",
  DESTRUIDO: null,
};

export function entries<T extends Record<string, EnumMeta>>(rec: T) {
  return Object.entries(rec) as [keyof T, T[keyof T]][];
}
