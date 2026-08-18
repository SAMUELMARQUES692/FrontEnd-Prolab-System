import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCadastrarDocumento, useAtualizarDocumento } from "./useDocumentos";
import { useClientes } from "@/features/clientes/useClientes";
import { documentosApi } from "@/api/documentos";
import { entries, TIPO_DOCUMENTO } from "@/lib/enums";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";

const schema = z.object({
  clienteId: z.coerce.number({ error: "Selecione o cliente" }).positive("Selecione o cliente"),
  recebimentoId: z.string().optional(),
  tipo: z.enum(["MTR", "DECLARACAO", "NOTA_FISCAL"], { error: "Selecione o tipo" }),
  numero: z.string().optional(),
  arquivoUrl: z.string().optional(),
  dataEmissao: z.string().optional(),
  observacoes: z.string().optional(),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function DocumentoFormDrawer({
  open,
  onClose,
  documentoId,
  defaultClienteId,
  defaultRecebimentoId,
}: {
  open: boolean;
  onClose: () => void;
  documentoId?: number | null;
  defaultClienteId?: number;
  defaultRecebimentoId?: number;
}) {
  const toast = useToast();
  const { data: clientes } = useClientes();
  const cadastrar = useCadastrarDocumento();
  const atualizar = useAtualizarDocumento();
  const isEdit = !!documentoId;

  const { data: existente, isLoading: loadingExistente } = useQuery({
    queryKey: ["documentos", documentoId],
    queryFn: () => documentosApi.buscarPorId(documentoId!),
    enabled: open && !!documentoId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open && (!isEdit || existente)) {
      reset({
        clienteId: existente?.clienteId ?? defaultClienteId ?? 0,
        recebimentoId: existente?.recebimentoId != null ? String(existente.recebimentoId) : defaultRecebimentoId ? String(defaultRecebimentoId) : "",
        tipo: existente?.tipo ?? "MTR",
        numero: existente?.numero ?? "",
        arquivoUrl: existente?.arquivoUrl ?? "",
        dataEmissao: existente?.dataEmissao ?? "",
        observacoes: existente?.observacoes ?? "",
      });
    }
  }, [open, isEdit, existente, defaultClienteId, defaultRecebimentoId, reset]);

  const onSubmit = async (values: FormOutput) => {
    try {
      const payload = {
        clienteId: values.clienteId,
        recebimentoId: values.recebimentoId ? Number(values.recebimentoId) : null,
        tipo: values.tipo,
        numero: values.numero || null,
        arquivoUrl: values.arquivoUrl || null,
        dataEmissao: values.dataEmissao || null,
        observacoes: values.observacoes || null,
      };
      if (isEdit && documentoId) {
        await atualizar.mutateAsync({ id: documentoId, data: payload });
        toast.success("Documento atualizado");
      } else {
        await cadastrar.mutateAsync(payload);
        toast.success("Documento cadastrado");
      }
      onClose();
    } catch (err) {
      toast.error("Não foi possível salvar", toApiError(err).message);
    }
  };

  const loading = isEdit && loadingExistente;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar documento" : "Novo documento"}
      subtitle={isEdit ? `#${documentoId}` : "MTR, declaração ou nota fiscal do cliente"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="documento-form" type="submit" loading={isSubmitting} disabled={loading}>
            {isEdit ? "Salvar alterações" : "Cadastrar documento"}
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <form id="documento-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Cliente" htmlFor="clienteId" error={errors.clienteId?.message} required>
            <Select id="clienteId" defaultValue="" {...register("clienteId")}>
              <option value="" disabled>
                Selecione o cliente
              </option>
              {clientes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razaoSocial}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo de documento" htmlFor="tipo" error={errors.tipo?.message} required>
            <Select id="tipo" {...register("tipo")}>
              {entries(TIPO_DOCUMENTO).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="ID do recebimento vinculado"
            htmlFor="recebimentoId"
            error={errors.recebimentoId?.message}
            hint="Opcional — consulte na tela de Recebimentos"
          >
            <Input id="recebimentoId" type="number" min={1} {...register("recebimentoId")} />
          </Field>
          <Field label="Número" htmlFor="numero" error={errors.numero?.message}>
            <Input id="numero" placeholder="Número do documento" {...register("numero")} />
          </Field>
          <Field label="URL do arquivo" htmlFor="arquivoUrl" error={errors.arquivoUrl?.message} hint="Opcional">
            <Input id="arquivoUrl" placeholder="https://..." {...register("arquivoUrl")} />
          </Field>
          <Field label="Data de emissão" htmlFor="dataEmissao" error={errors.dataEmissao?.message}>
            <Input id="dataEmissao" type="date" {...register("dataEmissao")} />
          </Field>
          <Field label="Observações" htmlFor="observacoes" error={errors.observacoes?.message}>
            <Textarea id="observacoes" placeholder="Notas sobre o documento..." {...register("observacoes")} />
          </Field>
        </form>
      )}
    </Drawer>
  );
}
