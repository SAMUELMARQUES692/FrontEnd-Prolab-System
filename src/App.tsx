import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, AdminRoute } from "@/components/layout/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { CadastroPage } from "@/features/auth/CadastroPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ClientesPage } from "@/features/clientes/ClientesPage";
import { CaminhoesPage } from "@/features/caminhoes/CaminhoesPage";
import { AgendamentosPage } from "@/features/agendamentos/AgendamentosPage";
import { RecebimentosPage } from "@/features/recebimentos/RecebimentosPage";
import { ResiduosPage } from "@/features/residuos/ResiduosPage";
import { PosicoesPage } from "@/features/posicoes/PosicoesPage";
import { DocumentosPage } from "@/features/documentos/DocumentosPage";
import { UsuariosPage } from "@/features/usuarios/UsuariosPage";
import { NotFoundPage } from "@/features/misc/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/caminhoes" element={<CaminhoesPage />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
          <Route path="/recebimentos" element={<RecebimentosPage />} />
          <Route path="/residuos" element={<ResiduosPage />} />
          <Route path="/posicoes" element={<PosicoesPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
