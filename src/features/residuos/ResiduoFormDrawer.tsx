import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCadastrarResiduo, useAtualizarResiduo } from "./useResiduos";
import { usePosicoes } from "@/features/posicoes/usePosicoes";
import { usePaletes } from "@/features/paletes/usePaletes";
import { TIPO_RESIDUO } from "@/lib/enums";
import { formatNumber } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";
import type { ResiduoResponse } from "@/types/domain";

const schema = z.object({
  paleteId: z.coerce.number({ error: "Selecione o palete" }).positive("Selecione o palete"),
  posicaoId: z.coerce.number({ error: "Selecione a posição" }).positive("Selecione a posição"),
  mtrVinculado: z.string().optional(),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function ResiduoFormDrawer({
  open,
  onClose,
  residuo,
  defaultPaleteId,
}: {
  open: boolean;
  onClose: () => void;
  residuo?: ResiduoResponse | null;
  defaultPaleteId?: number;
}) {
  const toast = useToast();
  const { data: posicoes } = usePosicoes();
  const { data: todosPaletes } = usePaletes();
  const cadastrar = useCadastrarResiduo();
  const atualizar = useAtualizarResiduo();
  const isEdit = !!residuo;

  // Só paletes ainda não armazenados podem ser alocados; ao editar, o palete
  // já vinculado a este resíduo continua na lista mesmo estando armazenado.
  const paletes = useMemo(
    () => (todosPaletes ?? []).filter((p) => !p.armazenado || p.id === residuo?.paleteId),
    [todosPaletes, residuo]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        paleteId: residuo?.paleteId ?? defaultPaleteId ?? 0,
        posicaoId: residuo?.posicaoId ?? 0,
        mtrVinculado: residuo?.mtrVinculado ?? "",
      });
    }
  }, [open, residuo, defaultPaleteId, reset]);

  const onSubmit = async (values: FormOutput) => {
    try {
      const payload = {
        paleteId: values.paleteId,
        posicaoId: values.posicaoId,
        mtrVinculado: values.mtrVinculado || null,
      };
      if (isEdit && residuo) {
        await atualizar.mutateAsync({ id: residuo.id, data: payload });
        toast.success("Resíduo atualizado");
      } else {
        await cadastrar.mutateAsync(payload);
        toast.success("Resíduo alocado", "Status inicial: Armazenado");
      }
      onClose();
    } catch (err) {
      toast.error("Não foi possível salvar", toApiError(err).message);
    }
  };

  const editingPaleteNaoListado = isEdit && residuo && !!todosPaletes && !todosPaletes.some((p) => p.id === residuo.paleteId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar resíduo" : "Alocar resíduo"}
      subtitle={isEdit ? `#${residuo?.id}` : "Vincular um palete a uma posição de estoque"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="residuo-form" type="submit" loading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Alocar resíduo"}
          </Button>
        </div>
      }
    >
      <form id="residuo-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field
          label="Palete"
          htmlFor="paleteId"
          error={errors.paleteId?.message}
          hint={paletes.length === 0 ? "Nenhum palete disponível para alocação — cadastre um na tela de Paletes" : undefined}
          required
        >
          <Select id="paleteId" defaultValue="" {...register("paleteId")}>
            <option value="" disabled>
              Selecione o palete
            </option>
            {editingPaleteNaoListado && <option value={residuo!.paleteId}>Palete #{residuo!.paleteId}</option>}
            {paletes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.ticket} · {TIPO_RESIDUO[p.tipo as keyof typeof TIPO_RESIDUO]?.codigo ?? p.tipo} ·{" "}
                {formatNumber(p.peso, "kg")}
              </option>
            ))}
          </Select>
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
