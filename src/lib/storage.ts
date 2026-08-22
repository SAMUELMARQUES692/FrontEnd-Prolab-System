// A API do ProlabSystem não expõe endpoints de listagem para Recebimento
// (só POST/PUT/DELETE), para DocumentoCliente (só POST/PUT/DELETE/GET-by-id)
// nem para Palete (só POST). Para dar uma experiência utilizável mesmo assim,
// guardamos localmente um histórico dos registros criados/vistos nesta
// máquina. É só um atalho de UX — nunca a fonte da verdade — por isso cada
// tela deixa isso explícito.

const RECEBIMENTOS_KEY = "prolab:recebimentos-recentes";
const DOCUMENTOS_KEY = "prolab:documentos-recentes";
const PALETES_KEY = "prolab:paletes-recentes";

export interface RecebimentoLocal {
  id: number;
  prime: string;
  agendamentoId: number;
  clienteId: number;
  caminhaoId: number;
  dataHoraRecebimento: string;
  pesoConferido: number | null;
  observacoes: string | null;
  createdAt: string;
}

export interface PaleteLocal {
  id: number;
  ticket: string;
  recebimentoId: number;
  prime: string;
  numeroPalete: number;
  tipo: string;
  peso: number;
  estadoFisico: string;
  armazenado: boolean;
  createdAt: string;
}

export interface DocumentoLocal {
  id: number;
  clienteId: number;
  recebimentoId: number | null;
  tipo: string;
  numero: string | null;
  createdAt: string;
}

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // sem storage disponível (modo privado etc.) — degrada silenciosamente
  }
}

export function getRecebimentosLocais(): RecebimentoLocal[] {
  return readList<RecebimentoLocal>(RECEBIMENTOS_KEY).sort((a, b) => b.id - a.id);
}

export function upsertRecebimentoLocal(item: RecebimentoLocal) {
  const list = readList<RecebimentoLocal>(RECEBIMENTOS_KEY).filter((r) => r.id !== item.id);
  list.push(item);
  writeList(RECEBIMENTOS_KEY, list);
}

export function removeRecebimentoLocal(id: number) {
  writeList(
    RECEBIMENTOS_KEY,
    readList<RecebimentoLocal>(RECEBIMENTOS_KEY).filter((r) => r.id !== id)
  );
}

export function getPaletesLocais(): PaleteLocal[] {
  return readList<PaleteLocal>(PALETES_KEY).sort((a, b) => b.id - a.id);
}

export function upsertPaleteLocal(item: PaleteLocal) {
  const list = readList<PaleteLocal>(PALETES_KEY).filter((p) => p.id !== item.id);
  list.push(item);
  writeList(PALETES_KEY, list);
}

export function getDocumentosLocais(): DocumentoLocal[] {
  return readList<DocumentoLocal>(DOCUMENTOS_KEY).sort((a, b) => b.id - a.id);
}

export function upsertDocumentoLocal(item: DocumentoLocal) {
  const list = readList<DocumentoLocal>(DOCUMENTOS_KEY).filter((d) => d.id !== item.id);
  list.push(item);
  writeList(DOCUMENTOS_KEY, list);
}

export function removeDocumentoLocal(id: number) {
  writeList(
    DOCUMENTOS_KEY,
    readList<DocumentoLocal>(DOCUMENTOS_KEY).filter((d) => d.id !== id)
  );
}

const TOKEN_KEY = "prolab:token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}
