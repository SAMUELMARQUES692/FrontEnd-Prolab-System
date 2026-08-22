import { coreHttp } from "./http";
import type { PaleteRequest, PaleteResponse } from "@/types/domain";

// O backend expõe POST para cadastro, GET para listar todos e GET por PRIME
// (o código do recebimento ao qual o palete pertence) — ainda sem
// atualização ou exclusão.
export const paletesApi = {
  cadastrar: (data: PaleteRequest) => coreHttp.post<PaleteResponse>("/api/paletes", data).then((r) => r.data),
  listar: () => coreHttp.get<PaleteResponse[]>("/api/paletes").then((r) => r.data),
  buscarPorPrime: (prime: string) =>
    coreHttp.get<PaleteResponse[]>(`/api/paletes/${encodeURIComponent(prime)}/prime`).then((r) => r.data),
};
