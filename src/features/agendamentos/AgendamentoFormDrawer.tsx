import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAtualizarAgendamento, useCadastrarAgendamento } from "./useAgendamentos";
import { useClientes } from "@/features/clientes/useClientes";
import { entries, TIPO_DESTRUICAO } from "@/lib/enums";
import { fromDateTimeLocalInput, toDateTimeLocalInput } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";
import type { AgendamentoResponse, TipoDeDestruicao } from "@/types/domain";

const schema = z.object({
  clienteId: z.coerce.number({ error: "Selecione um cliente" }).positive("Selecione um cliente"),
  tipoResiduo: z.string().min(1, "Informe o tipo de resíduo"),
  tipoDeDestruicao: z.enum(["PROCESSO_FISCAL", "DESTRUICAO_DIRETA", "LOGISTICA_REVERSA"], {
    error: "Selecione o tipo de destruição",
  }),
  quantidadePaletes: z.coerce.number({ error: "Informe a quantidade" }).int().min(1, "Mínimo de 1 palete"),
  dataHoraPrevista: z
    .string()
    .min(1, "Informe a data e hora")
    .refine((v) => new Date(v).getTime() > Date.now(), "A data prevista precisa ser no futuro"),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function AgendamentoFormDrawer({
  open,
  onClose,
  agendamento,
  defaultClienteId,
}: {
  open: boolean;
  onClose: () => void;
  agendamento?: AgendamentoResponse | null;
  defaultClienteId?: number;
}) {
  const toast = useToast();
  const { data: clientes } = useClientes();
  const cadastrar = useCadastrarAgendamento();
  const atualizar = useAtualizarAgendamento();
  const isEdit = !!agendamento;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        clienteId: agendamento?.clienteId ?? defaultClienteId ?? 0,
        tipoResiduo: agendamento?.tipoResiduo ?? "",
        tipoDeDestruicao: (agendamento?.tipoDeDestruicao as TipoDeDestruicao) ?? "PROCESSO_FISCAL",
        quantidadePaletes: agendamento?.quantidadePaletes ?? 1,
        dataHoraPrevista: toDateTimeLocalInput(agendamento?.dataHoraPrevista),
      });
    }
  }, [open, agendamento, defaultClienteId, reset]);

  const onSubmit = async (values: FormOutput) => {
    try {
      const payload = {
        clienteId: values.clienteId,
        tipoResiduo: values.tipoResiduo,
        tipoDeDestruicao: values.tipoDeDestruicao,
        quantidadePaletes: values.quantidadePaletes,
        dataHoraPrevista: fromDateTimeLocalInput(values.dataHoraPrevista),
      };
      if (isEdit && agendamento) {
        await atualizar.mutateAsync({ id: agendamento.id, data: payload });
        toast.success("Agendamento atualizado");
      } else {
        await cadastrar.mutateAsync(payload);
        toast.success("Agendamento criado", "Status inicial: Agendado");
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
      title={isEdit ? "Editar agendamento" : "Novo agendamento"}
      subtitle={isEdit ? `#${agendamento?.id}` : "Programar recebimento de carga"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="agendamento-form" type="submit" loading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Criar agendamento"}
          </Button>
        </div>
      }
    >
      <form id="agendamento-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Cliente" htmlFor="clienteId" error={errors.clienteId?.message} required>
          <Select id="clienteId" defaultValue="" {...register("clienteId")}>
            <option value="" disabled>
              Selecione o cliente
            </option>
            {clientes
              ?.filter((c) => c.ativo)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razaoSocial}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Tipo de resíduo" htmlFor="tipoResiduo" error={errors.tipoResiduo?.message} required>
          <Input id="tipoResiduo" placeholder="Ex.: Papel, plástico, eletrônico..." {...register("tipoResiduo")} />
        </Field>
        <Field label="Tipo de destruição" htmlFor="tipoDeDestruicao" error={errors.tipoDeDestruicao?.message} required>
          <Select id="tipoDeDestruicao" {...register("tipoDeDestruicao")}>
            {entries(TIPO_DESTRUICAO).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Quantidade de paletes" htmlFor="quantidadePaletes" error={errors.quantidadePaletes?.message} required>
          <Input id="quantidadePaletes" type="number" min={1} {...register("quantidadePaletes")} />
        </Field>
        <Field
          label="Data e hora prevista"
          htmlFor="dataHoraPrevista"
          error={errors.dataHoraPrevista?.message}
          hint="Precisa ser um horário futuro"
          required
        >
          <Input id="dataHoraPrevista" type="datetime-local" {...register("dataHoraPrevista")} />
        </Field>
      </form>
    </Drawer>
  );
}
