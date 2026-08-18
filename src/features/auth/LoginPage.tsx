import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconLock, IconMail, IconAlert } from "@/components/icons";
import { toApiError } from "@/api/http";

const schema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const expired = new URLSearchParams(location.search).get("expirado") === "1";
  const from = (location.state as { from?: string })?.from ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.senha);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(toApiError(err).message);
    }
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse o painel de gestão de resíduos e cargas."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-medium text-accent hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      {expired && (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-warning/30 bg-warning-soft px-3.5 py-3 text-xs text-warning">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Sua sessão expirou. Faça login novamente.
        </div>
      )}
      {serverError && (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3.5 py-3 text-xs text-danger">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="E-mail" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            leftIcon={<IconMail className="h-4 w-4" />}
            {...register("email")}
          />
        </Field>
        <Field label="Senha" htmlFor="senha" error={errors.senha?.message} required>
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            leftIcon={<IconLock className="h-4 w-4" />}
            {...register("senha")}
          />
        </Field>

        <Button type="submit" size="lg" className="mt-2 w-full" loading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
