import { coreHttp } from "./http";
import type { PaleteRequest, PaleteResponse } from "@/types/domain";

// O backend só expõe POST para Palete — sem listagem, atualização ou exclusão.
// Ver src/lib/storage.ts para o cache local que compensa a ausência de listagem.
export const paletesApi = {
  cadastrar: (data: PaleteRequest) => coreHttp.post<PaleteResponse>("/api/paletes", data).then((r) => r.data),
};
