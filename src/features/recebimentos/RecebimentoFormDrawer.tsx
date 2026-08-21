import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAtualizarRecebimento, useCadastrarRecebimento } from "./useRecebimentos";
import { useCaminhoes } from "@/features/caminhoes/useCaminhoes";
import { fromDateTimeLocalInput, toDateTimeLocalInput } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";
import type { RecebimentoResponse } from "@/types/domain";

const schema = z.object({
  placaCaminhao: z.string().min(1, "Informe a placa"),
  modeloCaminhao: z.string().optional(),
  motoristaCaminhao: z.string().min(1, "Informe o motorista"),
  dataHoraRecebimento: z.string().min(1, "Informe a data e hora"),
  observacoes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function RecebimentoFormDrawer({
  open,
  onClose,
  agendamentoId: agendamentoIdProp,
  agendamentoLabel,
  recebimento,
}: {
  open: boolean;
  onClose: () => void;
  agendamentoId?: number | null;
  agendamentoLabel?: string;
  recebimento?: RecebimentoResponse | null;
}) {
  const toast = useToast();
  const cadastrar = useCadastrarRecebimento();
  const atualizar = useAtualizarRecebimento();
  const { data: caminhoes } = useCaminhoes();
  const isEdit = !!recebimento;
  const agendamentoId = agendamentoIdProp ?? recebimento?.agendamentoId;
  const caminhaoAtual = recebimento ? caminhoes?.find((c) => c.id === recebimento.caminhaoId) : undefined;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        placaCaminhao: caminhaoAtual?.placa ?? "",
        modeloCaminhao: caminhaoAtual?.modelo ?? "",
        motoristaCaminhao: caminhaoAtual?.motorista ?? "",
        dataHoraRecebimento: recebimento
          ? toDateTimeLocalInput(recebimento.dataHoraRecebimento)
          : toDateTimeLocalInput(new Date().toISOString()),
        observacoes: recebimento?.observacoes ?? "",
      });
    }
  }, [open, recebimento, caminhaoAtual, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!agendamentoId) return;
    try {
      const payload = {
        agendamentoId,
        placaCaminhao: values.placaCaminhao.toUpperCase(),
        modeloCaminhao: values.modeloCaminhao || null,
        motoristaCaminhao: values.motoristaCaminhao,
        dataHoraRecebimento: fromDateTimeLocalInput(values.dataHoraRecebimento),
        observacoes: values.observacoes || null,
      };
      if (isEdit && recebimento) {
        await atualizar.mutateAsync({ id: recebimento.id, data: payload });
        toast.success("Recebimento atualizado");
      } else {
        const res = await cadastrar.mutateAsync(payload);
        toast.success("Recebimento registrado", `Código PRIME: ${res.prime}`);
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
      title={isEdit ? "Editar recebimento" : "Registrar recebimento"}
      subtitle={
        isEdit
          ? `Recebimento #${recebimento?.id} · ${recebimento?.prime}`
          : agendamentoLabel
          ? `${agendamentoLabel} · agendamento #${agendamentoId}`
          : agendamentoId
          ? `Agendamento #${agendamentoId}`
          : undefined
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="recebimento-form" type="submit" loading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Registrar recebimento"}
          </Button>
        </div>
      }
    >
      <form id="recebimento-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {isEdit && !caminhaoAtual && (
          <div className="rounded-md border border-warning/30 bg-warning-soft px-3.5 py-3 text-xs leading-relaxed text-warning">
            Não foi possível localizar o caminhão vinculado a este recebimento na listagem atual — confira placa,
            modelo e motorista antes de salvar. Ao salvar, todos os campos abaixo substituem os valores atuais no
            servidor.
          </div>
        )}
        <Field label="Placa do caminhão" htmlFor="placaCaminhao" error={errors.placaCaminhao?.message} required>
          <Input id="placaCaminhao" placeholder="ABC1D23" className="uppercase" {...register("placaCaminhao")} />
        </Field>
        <Field label="Modelo do caminhão" htmlFor="modeloCaminhao" error={errors.modeloCaminhao?.message}>
          <Input id="modeloCaminhao" placeholder="Ex.: Mercedes-Benz Atego" {...register("modeloCaminhao")} />
        </Field>
        <Field label="Motorista" htmlFor="motoristaCaminhao" error={errors.motoristaCaminhao?.message} required>
          <Input id="motoristaCaminhao" placeholder="Nome do motorista" {...register("motoristaCaminhao")} />
        </Field>
        <Field label="Data e hora do recebimento" htmlFor="dataHoraRecebimento" error={errors.dataHoraRecebimento?.message} required>
          <Input id="dataHoraRecebimento" type="datetime-local" {...register("dataHoraRecebimento")} />
        </Field>
        <Field label="Observações" htmlFor="observacoes" error={errors.observacoes?.message}>
          <Textarea id="observacoes" placeholder="Notas sobre o recebimento..." {...register("observacoes")} />
        </Field>
        {!isEdit && (
          <p className="text-xs leading-relaxed text-muted-2">
            O peso conferido não é informado aqui — ele é somado automaticamente pelo servidor conforme os paletes
            forem cadastrados na tela de Paletes.
          </p>
        )}
      </form>
    </Drawer>
  );
}
