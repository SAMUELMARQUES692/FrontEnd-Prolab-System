import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { LeafLogo } from "@/components/icons";
import { NAV_ITEMS } from "./navItems";
import { useAuth } from "@/context/AuthContext";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-base">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-accent-soft text-accent">
          <LeafLogo className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="font-display text-[15px] leading-none tracking-tight text-ink">prolab</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-2">System</p>
        </div>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.filter((item) => !item.adminOnly || user?.isAdmin).map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-white/8 font-medium text-ink"
                      : "text-muted hover:bg-white/[0.04] hover:text-ink"
                  )
                }
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border px-6 py-4">
        <p className="text-[11px] leading-relaxed text-muted-2">
          Gestão de resíduos, cargas e destinação — ecossistema Prolab.
        </p>
      </div>
    </div>
  );
}
