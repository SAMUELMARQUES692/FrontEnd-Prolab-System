export interface JwtClaims {
  iss?: string;
  sub?: string;
  scope?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

// Decodificação client-side apenas para leitura de claims (exibição/gating de UI).
// A validação real da assinatura RS256 é feita pelos resource servers.
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getScopes(token: string): string[] {
  const claims = decodeJwt(token);
  if (!claims?.scope) return [];
  return claims.scope.split(" ").filter(Boolean);
}

export function isAdmin(scopes: string[]): boolean {
  return scopes.some((s) => s.toUpperCase().includes("ADMIN"));
}

export function isExpired(token: string): boolean {
  const claims = decodeJwt(token);
  if (!claims?.exp) return true;
  return Date.now() >= claims.exp * 1000;
}
