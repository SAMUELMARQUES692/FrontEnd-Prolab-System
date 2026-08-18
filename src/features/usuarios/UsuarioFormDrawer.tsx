import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAtualizarUsuario } from "./useUsuarios";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";
import type { UsuarioResponse } from "@/types/domain";

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo de 6 caracteres"),
});
type FormValues = z.infer<typeof schema>;

export function UsuarioFormDrawer({
  open,
  onClose,
  usuario,
}: {
  open: boolean;
  onClose: () => void;
  usuario: UsuarioResponse | null;
}) {
  const toast = useToast();
  const atualizar = useAtualizarUsuario();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({ nome: usuario?.nome ?? "", email: usuario?.email ?? "", senha: "" });
    }
  }, [open, usuario, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!usuario) return;
    try {
      await atualizar.mutateAsync({ id: usuario.id, data: values });
      toast.success("Usuário atualizado");
      onClose();
    } catch (err) {
      toast.error("Não foi possível salvar", toApiError(err).message);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Editar usuário"
      subtitle={usuario ? `#${usuario.id}` : undefined}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="usuario-form" type="submit" loading={isSubmitting}>
            Salvar alterações
          </Button>
        </div>
      }
    >
      <div className="mb-4 rounded-md border border-warning/30 bg-warning-soft px-3.5 py-3 text-xs leading-relaxed text-warning">
        A API exige uma senha em toda atualização de usuário — informe a senha atual (sem alterá-la) ou uma nova.
      </div>
      <form id="usuario-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Nome" htmlFor="nome" error={errors.nome?.message} required>
          <Input id="nome" {...register("nome")} />
        </Field>
        <Field label="E-mail" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" {...register("email")} />
        </Field>
        <Field label="Senha" htmlFor="senha" error={errors.senha?.message} required>
          <Input id="senha" type="password" placeholder="Mínimo 6 caracteres" {...register("senha")} />
        </Field>
      </form>
    </Drawer>
  );
}
