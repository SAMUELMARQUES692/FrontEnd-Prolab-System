import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmDialogHost } from "@/components/ui/ConfirmDialog";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <App />
            <ConfirmDialogHost />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
