import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCadastrarResiduo, useAtualizarResiduo } from "./useResiduos";
import { usePosicoes } from "@/features/posicoes/usePosicoes";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";
import type { ResiduoResponse } from "@/types/domain";

const schema = z.object({
  recebimentoId: z.coerce.number({ error: "Informe o ID do recebimento" }).positive("Informe um ID válido"),
  tipoResiduo: z.string().min(1, "Informe o tipo de resíduo"),
  quantidade: z.coerce.number({ error: "Informe a quantidade" }).positive("Deve ser maior que zero"),
  posicaoId: z.coerce.number({ error: "Selecione a posição" }).positive("Selecione a posição"),
  mtrVinculado: z.string().optional(),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function ResiduoFormDrawer({
  open,
  onClose,
  residuo,
  defaultRecebimentoId,
}: {
  open: boolean;
  onClose: () => void;
  residuo?: ResiduoResponse | null;
  defaultRecebimentoId?: number;
}) {
  const toast = useToast();
  const { data: posicoes } = usePosicoes();
  const cadastrar = useCadastrarResiduo();
  const atualizar = useAtualizarResiduo();
  const isEdit = !!residuo;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        recebimentoId: residuo?.recebimentoId ?? defaultRecebimentoId ?? 0,
        tipoResiduo: residuo?.tipoResiduo ?? "",
        quantidade: residuo?.quantidade ?? 0,
        posicaoId: residuo?.posicaoId ?? 0,
        mtrVinculado: residuo?.mtrVinculado ?? "",
      });
    }
  }, [open, residuo, defaultRecebimentoId, reset]);

  const onSubmit = async (values: FormOutput) => {
    try {
      const payload = {
        recebimentoId: values.recebimentoId,
        tipoResiduo: values.tipoResiduo,
        quantidade: values.quantidade,
        posicaoId: values.posicaoId,
        mtrVinculado: values.mtrVinculado || null,
      };
      if (isEdit && residuo) {
        await atualizar.mutateAsync({ id: residuo.id, data: payload });
        toast.success("Resíduo atualizado");
      } else {
        await cadastrar.mutateAsync(payload);
        toast.success("Resíduo cadastrado", "Status inicial: Armazenado");
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
      title={isEdit ? "Editar resíduo" : "Novo resíduo"}
      subtitle={isEdit ? `#${residuo?.id}` : "Registrar item armazenado em estoque"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="residuo-form" type="submit" loading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Cadastrar resíduo"}
          </Button>
        </div>
      }
    >
      <form id="residuo-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field
          label="ID do recebimento"
          htmlFor="recebimentoId"
          error={errors.recebimentoId?.message}
          hint="Consulte o código PRIME na tela de Recebimentos para localizar o ID"
          required
        >
          <Input id="recebimentoId" type="number" min={1} {...register("recebimentoId")} />
        </Field>
        <Field label="Tipo de resíduo" htmlFor="tipoResiduo" error={errors.tipoResiduo?.message} required>
          <Input id="tipoResiduo" placeholder="Ex.: Papel, plástico, eletrônico..." {...register("tipoResiduo")} />
        </Field>
        <Field label="Quantidade (kg)" htmlFor="quantidade" error={errors.quantidade?.message} required>
          <Input id="quantidade" type="number" step="0.01" min={0} {...register("quantidade")} />
        </Field>
        <Field label="Posição de estoque" htmlFor="posicaoId" error={errors.posicaoId?.message} required>
          <Select id="posicaoId" defaultValue="" {...register("posicaoId")}>
            <option value="" disabled>
              Selecione a posição
            </option>
            {posicoes?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} {p.capacidade ? `· cap. ${p.capacidade}kg` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="MTR vinculado" htmlFor="mtrVinculado" error={errors.mtrVinculado?.message} hint="Opcional">
          <Input id="mtrVinculado" placeholder="Número do MTR" {...register("mtrVinculado")} />
        </Field>
      </form>
    </Drawer>
  );
}
