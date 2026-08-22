// Tipos espelhando os DTOs (request/response) reais dos serviços Java.
// Mantidos em sincronia com ProlabSystem e auth-service — não inventar campos.

export type StatusAgendamento = "AGENDADO" | "CONFIRMADO" | "CANCELADO" | "CONCLUIDO";
export type StatusPosicao = "DISPONIVEL" | "OCUPADA" | "INATIVA" | "RESERVADA";
export type StatusResiduo = "ARMAZENADO" | "EM_TRATAMENTO" | "DESTRUIDO";
export type TipoDeDestruicao = "PROCESSO_FISCAL" | "DESTRUICAO_DIRETA" | "LOGISTICA_REVERSA";
export type TipoDocumento = "MTR" | "DECLARACAO" | "NOTA_FISCAL";
export type EstadoFisico = "SOLIDO" | "LIQUIDO";
export type TipoResiduo =
  | "CODIGO_16_05_08"
  | "CODIGO_15_02_02"
  | "CODIGO_15_01_10"
  | "CODIGO_20_01_35"
  | "CODIGO_07_05_13";

export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
}

// ---------- Cliente ----------
export interface ClienteRequest {
  razaoSocial: string;
  cnpj: string;
  contato?: string | null;
  endereco?: string | null;
}
export interface ClienteResponse {
  id: number;
  razaoSocial: string;
  cnpj: string;
  contato: string | null;
  endereco: string | null;
  ativo: boolean;
  createdAt: string;
}

// ---------- Caminhao ----------
export interface CaminhaoRequest {
  placa: string;
  modelo?: string | null;
  motorista: string;
}
export interface CaminhaoResponse {
  id: number;
  placa: string;
  modelo: string | null;
  motorista: string;
  createdAt: string;
}

// ---------- Agendamento ----------
export interface AgendamentoRequest {
  clienteId: number;
  tipoResiduo: string;
  tipoDeDestruicao: TipoDeDestruicao;
  quantidadePaletes: number;
  dataHoraPrevista: string;
}
export interface AgendamentoResponse {
  id: number;
  clienteId: number;
  tipoResiduo: string;
  tipoDeDestruicao: string;
  quantidadePaletes: number;
  dataHoraPrevista: string;
  status: StatusAgendamento;
  createdAt: string;
}

// ---------- Recebimento ----------
// pesoConferido não é mais enviado no cadastro: o backend agora calcula esse
// total a partir do peso dos Paletes vinculados (ver PaleteService#cadastrar).
export interface RecebimentoRequest {
  agendamentoId: number;
  placaCaminhao: string;
  modeloCaminhao?: string | null;
  motoristaCaminhao: string;
  dataHoraRecebimento: string;
  observacoes?: string | null;
}
export interface RecebimentoResponse {
  id: number;
  agendamentoId: number;
  clienteId: number;
  caminhaoId: number;
  prime: string;
  dataHoraRecebimento: string;
  pesoConferido: number | null;
  observacoes: string | null;
  createdAt: string;
}

// ---------- Palete ----------
// Novo desde a refatoração que tirou de Residuo a responsabilidade de
// carregar tipo/peso — agora cada Palete representa um lote físico (com
// ticket e número sequencial gerados pelo servidor) vinculado a um Recebimento.
export interface PaleteRequest {
  recebimentoId: number;
  tipo: TipoResiduo;
  peso: number;
  estadoFisico: EstadoFisico;
}
export interface PaleteResponse {
  id: number;
  ticket: string;
  recebimentoId: number;
  prime: string;
  numeroPalete: number;
  tipo: TipoResiduo;
  peso: number;
  estadoFisico: EstadoFisico;
  armazenado: boolean;
  createdAt: string;
}

// ---------- Residuo ----------
// Residuo agora só representa a alocação de um Palete numa posição de
// estoque — tipo/peso/quantidade saíram daqui e vivem em Palete.
export interface ResiduoRequest {
  paleteId: number;
  posicaoId: number;
  mtrVinculado?: string | null;
}
export interface ResiduoResponse {
  id: number;
  paleteId: number;
  ticket: string;
  prime: string;
  posicaoId: number;
  status: StatusResiduo;
  mtrVinculado: string | null;
  dataDestinacao: string | null;
  createdAt: string;
}

// ---------- PosicaoEstoque ----------
export interface PosicaoEstoqueRequest {
  codigo: string;
  capacidade?: number | null;
  status: StatusPosicao;
}
export interface PosicaoEstoqueResponse {
  id: number;
  codigo: string;
  status: StatusPosicao;
  capacidade: number | null;
  createdAt: string;
}

// ---------- DocumentoCliente ----------
export interface DocumentoClienteRequest {
  clienteId: number;
  recebimentoId?: number | null;
  tipo: TipoDocumento;
  numero?: string | null;
  arquivoUrl?: string | null;
  dataEmissao?: string | null;
  observacoes?: string | null;
}
export interface DocumentoClienteResponse {
  id: number;
  clienteId: number;
  recebimentoId: number | null;
  tipo: TipoDocumento;
  numero: string | null;
  arquivoUrl: string | null;
  dataEmissao: string | null;
  observacoes: string | null;
  createdAt: string;
}

// ---------- Usuario / Auth ----------
export interface AuthRequest {
  email: string;
  senha: string;
}
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}
export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
}
export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  createdAt: string;
  scopes: string[];
}
