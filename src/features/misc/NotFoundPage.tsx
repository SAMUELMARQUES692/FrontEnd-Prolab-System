import { Link } from "react-router-dom";
import { LeafLogo } from "@/components/icons";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas text-center">
      <LeafLogo className="h-8 w-8 text-accent" />
      <p className="font-display text-3xl tracking-tight text-ink">Página não encontrada</p>
      <p className="max-w-xs text-sm text-muted">O endereço acessado não existe ou foi movido.</p>
      <Link
        to="/"
        className="mt-2 inline-flex h-10 items-center justify-center rounded-pill bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
      >
        Voltar ao painel
      </Link>
    </div>
  );
}
