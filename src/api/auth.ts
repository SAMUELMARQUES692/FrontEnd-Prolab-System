import { authHttp } from "./http";
import type { AuthRequest, AuthResponse, UsuarioRequest, UsuarioResponse } from "@/types/domain";

export const authApi = {
  login: (data: AuthRequest) => authHttp.post<AuthResponse>("/auth/login", data).then((r) => r.data),
};

export const usuariosApi = {
  cadastrar: (data: UsuarioRequest) =>
    authHttp.post<UsuarioResponse>("/api/usuarios/cadastrar", data).then((r) => r.data),
  listar: () => authHttp.get<UsuarioResponse[]>("/api/usuarios").then((r) => r.data),
  buscarPorId: (id: number) => authHttp.get<UsuarioResponse>(`/api/usuarios/${id}`).then((r) => r.data),
  buscarPorEmail: (email: string) =>
    authHttp.get<UsuarioResponse>("/api/usuarios/buscar-email", { params: { email } }).then((r) => r.data),
  atualizar: (id: number, data: UsuarioRequest) =>
    authHttp.put<UsuarioResponse>(`/api/usuarios/${id}`, data).then((r) => r.data),
  deletar: (id: number) => authHttp.delete<void>(`/api/usuarios/${id}`).then((r) => r.data),
};
