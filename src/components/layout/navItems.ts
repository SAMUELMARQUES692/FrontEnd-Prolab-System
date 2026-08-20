import {
  IconAgendamento,
  IconCaminhao,
  IconClientes,
  IconDashboard,
  IconDocumento,
  IconPalete,
  IconPosicao,
  IconRecebimento,
  IconResiduo,
  IconUsuarios,
} from "@/components/icons";
import type { SVGProps } from "@/types/svg";
import type { ComponentType } from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps>;
  adminOnly?: boolean;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Painel", icon: IconDashboard, end: true },
  { to: "/clientes", label: "Clientes", icon: IconClientes },
  { to: "/caminhoes", label: "Caminhões", icon: IconCaminhao },
  { to: "/agendamentos", label: "Agendamentos", icon: IconAgendamento },
  { to: "/recebimentos", label: "Recebimentos", icon: IconRecebimento },
  { to: "/paletes", label: "Paletes", icon: IconPalete },
  { to: "/residuos", label: "Resíduos", icon: IconResiduo },
  { to: "/posicoes", label: "Posições de estoque", icon: IconPosicao },
  { to: "/documentos", label: "Documentos", icon: IconDocumento },
  { to: "/usuarios", label: "Usuários", icon: IconUsuarios, adminOnly: true },
];
