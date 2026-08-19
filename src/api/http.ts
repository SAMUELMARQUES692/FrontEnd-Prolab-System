import axios, { AxiosError } from "axios";
import { clearStoredToken, getStoredToken } from "@/lib/storage";
import type { ErrorResponse } from "@/types/domain";

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:8081";
const CORE_BASE_URL = import.meta.env.VITE_PROLAB_API_URL ?? "http://localhost:8080";

function createClient(baseURL: string) {
  const client = axios.create({ baseURL, timeout: 60000 });

  client.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorResponse>) => {
      if (error.response?.status === 401) {
        clearStoredToken();
        if (!location.pathname.startsWith("/login")) {
          location.assign("/login?expirado=1");
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const authHttp = createClient(AUTH_BASE_URL);
export const coreHttp = createClient(CORE_BASE_URL);

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ErrorResponse>;
    const data = err.response?.data;
    if (data?.message) {
      return new ApiError(data.code, data.message, err.response?.status ?? 0);
    }
    if (err.code === "ERR_NETWORK") {
      return new ApiError(
        "REDE",
        "Não foi possível conectar ao servidor. Verifique se os serviços estão no ar.",
        0
      );
    }
    return new ApiError("ERRO", err.message, err.response?.status ?? 0);
  }
  if (error instanceof Error) return new ApiError("ERRO", error.message, 0);
  return new ApiError("ERRO", "Erro inesperado", 0);
}
