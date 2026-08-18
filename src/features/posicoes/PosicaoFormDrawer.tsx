import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCadastrarPosicao, useAtualizarPosicao } from "./usePosicoes";
import { entries, STATUS_POSICAO } from "@/lib/enums";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";
import type { PosicaoEstoqueResponse, StatusPosicao } from "@/types/domain";

const schema = z.object({
  codigo: z.string().min(1, "Informe o código"),
  capacidade: z.string().optional(),
  status: z.enum(["DISPONIVEL", "OCUPADA", "INATIVA", "RESERVADA"], { error: "Selecione o status" }),
});
type FormValues = z.infer<typeof schema>;

export function PosicaoFormDrawer({
  open,
  onClose,
  posicao,
}: {
  open: boolean;
  onClose: () => void;
  posicao?: PosicaoEstoqueResponse | null;
}) {
  const toast = useToast();
  const cadastrar = useCadastrarPosicao();
  const atualizar = useAtualizarPosicao();
  const isEdit = !!posicao;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        codigo: posicao?.codigo ?? "",
        capacidade: posicao?.capacidade != null ? String(posicao.capacidade) : "",
        status: (posicao?.status as StatusPosicao) ?? "DISPONIVEL",
      });
    }
  }, [open, posicao, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        codigo: values.codigo,
        capacidade: values.capacidade ? Number(values.capacidade) : null,
        status: values.status,
      };
      if (isEdit && posicao) {
        await atualizar.mutateAsync({ id: posicao.id, data: payload });
        toast.success("Posição atualizada");
      } else {
        await cadastrar.mutateAsync(payload);
        toast.success("Posição cadastrada");
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
      title={isEdit ? "Editar posição" : "Nova posição de estoque"}
      subtitle={isEdit ? `#${posicao?.id}` : "Cadastrar espaço físico no pátio"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="posicao-form" type="submit" loading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Cadastrar posição"}
          </Button>
        </div>
      }
    >
      <form id="posicao-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Código" htmlFor="codigo" error={errors.codigo?.message} required>
          <Input id="codigo" placeholder="Ex.: A-01" className="uppercase" {...register("codigo")} />
        </Field>
        <Field label="Capacidade (kg)" htmlFor="capacidade" error={errors.capacidade?.message} hint="Opcional">
          <Input id="capacidade" type="number" step="0.01" min={0} {...register("capacidade")} />
        </Field>
        <Field label="Status" htmlFor="status" error={errors.status?.message} required>
          <Select id="status" {...register("status")}>
            {entries(STATUS_POSICAO).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Drawer>
  );
}
