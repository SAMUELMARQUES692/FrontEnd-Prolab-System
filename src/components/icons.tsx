import type { SVGProps } from "@/types/svg";

const base = { viewBox: "0 0 24 24", fill: "none" as const };

export function LeafLogo(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20c0-8.837 6.163-15 15-15 0 8.837-6.163 15-15 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.5 19.5 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconDashboard(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconClientes(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19.5c0-3.6 2.5-5.8 5.5-5.8s5.5 2.2 5.5 5.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="7.5" r="2.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.3 13.9c2.6.2 4.6 2.2 4.7 5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconCaminhao(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="7" width="11" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 10h4l3 3v3h-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconAgendamento(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m8.5 14 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRecebimento(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m7 10.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16.5v2.7c0 .9.7 1.6 1.6 1.6h12.8c.9 0 1.6-.7 1.6-1.6v-2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconResiduo(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 7 7.3 19a1.6 1.6 0 0 0 1.6 1.5h6.2A1.6 1.6 0 0 0 16.7 19L17.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10.2 10.5v6M13.8 10.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconPosicao(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3.5 8v8L12 20.5l8.5-4.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 12.5V20.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconPalete(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.5h18M3 12h18M3 15.5h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 8.5V20M11.5 8.5V20M18.5 8.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3.5" y="4" width="17" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconDocumento(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3.5h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 12.5h7M8.5 15.5h7M8.5 18.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconUsuarios(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 20c0-4.1 3.4-6.5 7.5-6.5s7.5 2.4 7.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlus(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconEdit(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m13.5 7.5 3 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconTrash(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 7h14M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.5 7 7.3 19a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5L17.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrowUpRight(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLogout(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4.5H6a1.6 1.6 0 0 0-1.6 1.6v11.8A1.6 1.6 0 0 0 6 19.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 8 19 12l-4.5 4M19 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMenu(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconAlert(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 9.5v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconWeight(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="6" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="m9 8.5-3.5 11a1 1 0 0 0 1 1.3h11a1 1 0 0 0 1-1.3l-3.5-11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLock(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconMail(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBuilding(props: SVGProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="3.5" width="10" height="17" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 9.5h4v11h-4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.5h1M11 7.5h1M8 11h1M11 11h1M8 14.5h1M11 14.5h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
