import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconAlert, IconLock, IconMail, IconUsuarios } from "@/components/icons";
import { toApiError } from "@/api/http";
import { useToast } from "@/context/ToastContext";

const schema = z
  .object({
    nome: z.string().min(2, "Informe seu nome completo"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    senha: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });
type FormValues = z.infer<typeof schema>;

export function CadastroPage() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await cadastrar({ nome: values.nome, email: values.email, senha: values.senha });
      toast.success("Conta criada", "Agora faça login para continuar.");
      navigate("/login", { replace: true });
    } catch (err) {
      setServerError(toApiError(err).message);
    }
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para acessar o painel Prolab."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      {serverError && (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3.5 py-3 text-xs text-danger">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Nome completo" htmlFor="nome" error={errors.nome?.message} required>
          <Input id="nome" placeholder="Seu nome" leftIcon={<IconUsuarios className="h-4 w-4" />} {...register("nome")} />
        </Field>
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
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            leftIcon={<IconLock className="h-4 w-4" />}
            {...register("senha")}
          />
        </Field>
        <Field label="Confirmar senha" htmlFor="confirmarSenha" error={errors.confirmarSenha?.message} required>
          <Input
            id="confirmarSenha"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            leftIcon={<IconLock className="h-4 w-4" />}
            {...register("confirmarSenha")}
          />
        </Field>

        <Button type="submit" size="lg" className="mt-2 w-full" loading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}
