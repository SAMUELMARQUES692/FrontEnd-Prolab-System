import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCadastrarCliente, useAtualizarCliente } from "./useClientes";
import { formatCnpj, onlyDigits } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";
import type { ClienteResponse } from "@/types/domain";

const schema = z.object({
  razaoSocial: z.string().min(2, "Informe a razão social"),
  cnpj: z
    .string()
    .transform(onlyDigits)
    .refine((v) => v.length === 14, "CNPJ deve conter 14 dígitos"),
  contato: z.string().optional(),
  endereco: z.string().optional(),
});
type FormValues = z.input<typeof schema>;

export function ClienteFormDrawer({
  open,
  onClose,
  cliente,
}: {
  open: boolean;
  onClose: () => void;
  cliente?: ClienteResponse | null;
}) {
  const toast = useToast();
  const cadastrar = useCadastrarCliente();
  const atualizar = useAtualizarCliente();
  const isEdit = !!cliente;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        razaoSocial: cliente?.razaoSocial ?? "",
        cnpj: cliente?.cnpj ?? "",
        contato: cliente?.contato ?? "",
        endereco: cliente?.endereco ?? "",
      });
    }
  }, [open, cliente, reset]);

  const cnpjValue = watch("cnpj") ?? "";

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        razaoSocial: values.razaoSocial,
        cnpj: onlyDigits(values.cnpj),
        contato: values.contato || null,
        endereco: values.endereco || null,
      };
      if (isEdit && cliente) {
        await atualizar.mutateAsync({ id: cliente.id, data: payload });
        toast.success("Cliente atualizado");
      } else {
        await cadastrar.mutateAsync(payload);
        toast.success("Cliente cadastrado");
      }
      onClose();
    } catch (err) {
      toast.error("Não foi possível salvar", toApiError(err).message);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar cliente" : "Novo cliente"}
      subtitle={isEdit ? `#${cliente?.id} · ${cliente?.cnpj}` : "Cadastrar empresa cliente"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="cliente-form" type="submit" loading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
        </div>
      }
    >
      <form id="cliente-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Razão social" htmlFor="razaoSocial" error={errors.razaoSocial?.message} required>
          <Input id="razaoSocial" placeholder="Empresa LTDA" {...register("razaoSocial")} />
        </Field>
        <Field label="CNPJ" htmlFor="cnpj" error={errors.cnpj?.message} required>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            value={formatCnpj(cnpjValue)}
            onChange={(e) => setValue("cnpj", onlyDigits(e.target.value), { shouldValidate: true })}
          />
        </Field>
        <Field label="Contato" htmlFor="contato" error={errors.contato?.message}>
          <Input id="contato" placeholder="(00) 00000-0000" {...register("contato")} />
        </Field>
        <Field label="Endereço" htmlFor="endereco" error={errors.endereco?.message}>
          <Textarea id="endereco" placeholder="Rua, número, bairro, cidade - UF" {...register("endereco")} />
        </Field>
      </form>
    </Drawer>
  );
}
