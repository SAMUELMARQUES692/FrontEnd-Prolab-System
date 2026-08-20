import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCadastrarPalete } from "./usePaletes";
import { entries, ESTADO_FISICO, TIPO_RESIDUO } from "@/lib/enums";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";

const schema = z.object({
  recebimentoId: z.coerce.number({ error: "Informe o ID do recebimento" }).positive("Informe um ID válido"),
  tipo: z.enum(
    ["CODIGO_16_05_08", "CODIGO_15_02_02", "CODIGO_15_01_10", "CODIGO_20_01_35", "CODIGO_07_05_13"],
    { error: "Selecione o tipo de resíduo" }
  ),
  peso: z.coerce.number({ error: "Informe o peso" }).positive("Deve ser maior que zero"),
  estadoFisico: z.enum(["SOLIDO", "LIQUIDO"], { error: "Selecione o estado físico" }),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function PaleteFormDrawer({
  open,
  onClose,
  defaultRecebimentoId,
}: {
  open: boolean;
  onClose: () => void;
  defaultRecebimentoId?: number;
}) {
  const toast = useToast();
  const cadastrar = useCadastrarPalete();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        recebimentoId: defaultRecebimentoId ?? 0,
        tipo: "CODIGO_16_05_08",
        peso: 0,
        estadoFisico: "SOLIDO",
      });
    }
  }, [open, defaultRecebimentoId, reset]);

  const onSubmit = async (values: FormOutput) => {
    try {
      const res = await cadastrar.mutateAsync(values);
      toast.success("Palete cadastrado", `Ticket: ${res.ticket} · Palete nº ${res.numeroPalete}`);
      onClose();
    } catch (err) {
      toast.error("Não foi possível salvar", toApiError(err).message);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Novo palete"
      subtitle="Lote físico vinculado a um recebimento — gera ticket e número sequencial"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="palete-form" type="submit" loading={isSubmitting}>
            Cadastrar palete
          </Button>
        </div>
      }
    >
      <form id="palete-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field
          label="ID do recebimento"
          htmlFor="recebimentoId"
          error={errors.recebimentoId?.message}
          hint="Consulte o código PRIME na tela de Recebimentos para localizar o ID"
          required
        >
          <Input id="recebimentoId" type="number" min={1} {...register("recebimentoId")} />
        </Field>
        <Field label="Tipo de resíduo" htmlFor="tipo" error={errors.tipo?.message} required>
          <Select id="tipo" {...register("tipo")}>
            {entries(TIPO_RESIDUO).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.codigo} · {meta.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Peso (kg)" htmlFor="peso" error={errors.peso?.message} required>
          <Input id="peso" type="number" step="0.01" min={0} {...register("peso")} />
        </Field>
        <Field label="Estado físico" htmlFor="estadoFisico" error={errors.estadoFisico?.message} required>
          <Select id="estadoFisico" {...register("estadoFisico")}>
            {entries(ESTADO_FISICO).map(([value, meta]) => (
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
