import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAtualizarCaminhao, useCadastrarCaminhao } from "./useCaminhoes";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";
import type { CaminhaoResponse } from "@/types/domain";

const schema = z.object({
  placa: z.string().min(1, "Informe a placa"),
  modelo: z.string().optional(),
  motorista: z.string().min(1, "Informe o motorista"),
});
type FormValues = z.infer<typeof schema>;

export function CaminhaoFormDrawer({
  open,
  onClose,
  caminhao,
}: {
  open: boolean;
  onClose: () => void;
  caminhao?: CaminhaoResponse | null;
}) {
  const toast = useToast();
  const cadastrar = useCadastrarCaminhao();
  const atualizar = useAtualizarCaminhao();
  const isEdit = !!caminhao;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        placa: caminhao?.placa ?? "",
        modelo: caminhao?.modelo ?? "",
        motorista: caminhao?.motorista ?? "",
      });
    }
  }, [open, caminhao, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = { placa: values.placa.toUpperCase(), modelo: values.modelo || null, motorista: values.motorista };
      if (isEdit && caminhao) {
        await atualizar.mutateAsync({ id: caminhao.id, data: payload });
        toast.success("Caminhão atualizado");
      } else {
        await cadastrar.mutateAsync(payload);
        toast.success("Caminhão cadastrado");
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
      title={isEdit ? "Editar caminhão" : "Novo caminhão"}
      subtitle={isEdit ? `#${caminhao?.id}` : "Cadastrar veículo da frota"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="caminhao-form" type="submit" loading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Cadastrar caminhão"}
          </Button>
        </div>
      }
    >
      <form id="caminhao-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Placa" htmlFor="placa" error={errors.placa?.message} required>
          <Input id="placa" placeholder="ABC1D23" className="uppercase" {...register("placa")} />
        </Field>
        <Field label="Modelo" htmlFor="modelo" error={errors.modelo?.message}>
          <Input id="modelo" placeholder="Ex.: Mercedes-Benz Atego" {...register("modelo")} />
        </Field>
        <Field label="Motorista" htmlFor="motorista" error={errors.motorista?.message} required>
          <Input id="motorista" placeholder="Nome do motorista" {...register("motorista")} />
        </Field>
      </form>
    </Drawer>
  );
}
