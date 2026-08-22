import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconPalete } from "@/components/icons";
import { useCadastrarPalete, usePaletes } from "./usePaletes";
import { useRecebimentos } from "@/features/recebimentos/useRecebimentos";
import { getPaletesLocais, getRecebimentosLocais, type PaleteLocal } from "@/lib/storage";
import { entries, ESTADO_FISICO, TIPO_RESIDUO } from "@/lib/enums";
import { formatNumber } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/api/http";

const iniciarSchema = z.object({
  recebimentoId: z.coerce.number({ error: "Informe o ID do recebimento" }).positive("Informe um ID válido"),
});
type IniciarInput = z.input<typeof iniciarSchema>;
type IniciarOutput = z.output<typeof iniciarSchema>;

const paleteSchema = z.object({
  tipo: z.enum(
    ["CODIGO_16_05_08", "CODIGO_15_02_02", "CODIGO_15_01_10", "CODIGO_20_01_35", "CODIGO_07_05_13"],
    { error: "Selecione o tipo de resíduo" }
  ),
  peso: z.coerce.number({ error: "Informe o peso" }).positive("Deve ser maior que zero"),
  estadoFisico: z.enum(["SOLIDO", "LIQUIDO"], { error: "Selecione o estado físico" }),
});
type PaleteInput = z.input<typeof paleteSchema>;
type PaleteOutput = z.output<typeof paleteSchema>;

// Tela de pesagem contínua: fica aberta enquanto os paletes de um mesmo
// recebimento (PRIME) vão sendo pesados um a um — cada "Registrar pesagem"
// já cadastra o palete de verdade (o backend numera e soma o peso ao
// recebimento). A tela só fecha quando o operador aperta "Finalizar pesagem".
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
  const { data: todosPaletes } = usePaletes();
  const { data: todosRecebimentos } = useRecebimentos();

  const [recebimentoId, setRecebimentoId] = useState<number | null>(null);
  const [prime, setPrime] = useState<string | null>(null);
  const [sessao, setSessao] = useState<PaleteLocal[]>([]);

  const iniciarForm = useForm<IniciarInput, unknown, IniciarOutput>({ resolver: zodResolver(iniciarSchema) });
  const paleteForm = useForm<PaleteInput, unknown, PaleteOutput>({
    resolver: zodResolver(paleteSchema),
    defaultValues: { tipo: "CODIGO_16_05_08", estadoFisico: "SOLIDO" },
  });

  // Prioriza os dados reais do servidor (listagem de paletes/recebimentos)
  // para retomar uma sessão já iniciada em outro dispositivo/navegador; cai
  // para o espelho local só quando ainda não temos esses dados carregados.
  const iniciarSessao = (id: number) => {
    setRecebimentoId(id);
    const recebimentoServidor = todosRecebimentos?.find((r) => r.id === id);
    const paletesServidor = todosPaletes?.filter((p) => p.recebimentoId === id) ?? [];

    if (recebimentoServidor || paletesServidor.length > 0) {
      setPrime(recebimentoServidor?.prime ?? paletesServidor[0]?.prime ?? null);
      setSessao(
        [...paletesServidor]
          .sort((a, b) => a.numeroPalete - b.numeroPalete)
          .map((p) => ({
            id: p.id,
            ticket: p.ticket,
            recebimentoId: p.recebimentoId,
            prime: p.prime,
            numeroPalete: p.numeroPalete,
            tipo: p.tipo,
            peso: p.peso,
            estadoFisico: p.estadoFisico,
            armazenado: p.armazenado,
            createdAt: p.createdAt,
          }))
      );
    } else {
      setPrime(getRecebimentosLocais().find((r) => r.id === id)?.prime ?? null);
      setSessao(getPaletesLocais().filter((p) => p.recebimentoId === id).sort((a, b) => a.numeroPalete - b.numeroPalete));
    }
  };

  useEffect(() => {
    if (open) {
      iniciarForm.reset({ recebimentoId: defaultRecebimentoId ?? 0 });
      paleteForm.reset({ tipo: "CODIGO_16_05_08", estadoFisico: "SOLIDO", peso: undefined });
      if (defaultRecebimentoId) {
        iniciarSessao(defaultRecebimentoId);
      } else {
        setRecebimentoId(null);
        setPrime(null);
        setSessao([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultRecebimentoId]);

  const totalPeso = sessao.reduce((acc, p) => acc + p.peso, 0);

  const onIniciar = (values: IniciarOutput) => iniciarSessao(values.recebimentoId);

  const onRegistrarPalete = async (values: PaleteOutput) => {
    if (!recebimentoId) return;
    try {
      const res = await cadastrar.mutateAsync({ recebimentoId, ...values });
      setSessao((prev) => [
        ...prev,
        {
          id: res.id,
          ticket: res.ticket,
          recebimentoId: res.recebimentoId,
          prime: res.prime,
          numeroPalete: res.numeroPalete,
          tipo: res.tipo,
          peso: res.peso,
          estadoFisico: res.estadoFisico,
          armazenado: res.armazenado,
          createdAt: res.createdAt,
        },
      ]);
      toast.success(`Palete nº ${res.numeroPalete} pesado`, `Ticket ${res.ticket} · ${formatNumber(res.peso, "kg")}`);
      paleteForm.reset({ tipo: values.tipo, estadoFisico: values.estadoFisico, peso: undefined });
    } catch (err) {
      toast.error("Não foi possível registrar o palete", toApiError(err).message);
    }
  };

  const finalizarPesagem = () => {
    if (sessao.length > 0) {
      toast.success("Pesagem finalizada", `${sessao.length} palete(s) · ${formatNumber(totalPeso, "kg")} no total`);
    }
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={finalizarPesagem}
      title="Pesagem de paletes"
      subtitle={
        recebimentoId
          ? `${prime ? `${prime} · ` : ""}Recebimento #${recebimentoId}`
          : "Informe o recebimento (PRIME) para começar a pesagem"
      }
      footer={
        recebimentoId ? (
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted">
              <span className="font-medium text-ink">{sessao.length}</span> palete(s) · {formatNumber(totalPeso, "kg")}
            </div>
            <Button onClick={finalizarPesagem}>Finalizar pesagem</Button>
          </div>
        ) : undefined
      }
    >
      {!recebimentoId ? (
        <form onSubmit={iniciarForm.handleSubmit(onIniciar)} className="flex flex-col gap-4">
          <Field
            label="ID do recebimento"
            htmlFor="recebimentoId"
            error={iniciarForm.formState.errors.recebimentoId?.message}
            hint="Consulte o código PRIME na tela de Recebimentos para localizar o ID"
            required
          >
            <Input id="recebimentoId" type="number" min={1} {...iniciarForm.register("recebimentoId")} />
          </Field>
          <Button type="submit">Iniciar pesagem</Button>
        </form>
      ) : (
        <div className="flex flex-col gap-6">
          <form
            onSubmit={paleteForm.handleSubmit(onRegistrarPalete)}
            className="flex flex-col gap-4 rounded-lg border border-border bg-canvas-2/40 p-4"
          >
            <p className="text-sm font-medium text-ink">Próximo palete · nº {sessao.length + 1}</p>
            <Field label="Tipo de resíduo" htmlFor="tipo" error={paleteForm.formState.errors.tipo?.message} required>
              <Select id="tipo" {...paleteForm.register("tipo")}>
                {entries(TIPO_RESIDUO).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.codigo} · {meta.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Peso (kg)" htmlFor="peso" error={paleteForm.formState.errors.peso?.message} required>
              <Input id="peso" type="number" step="0.01" min={0} autoFocus {...paleteForm.register("peso")} />
            </Field>
            <Field label="Estado físico" htmlFor="estadoFisico" error={paleteForm.formState.errors.estadoFisico?.message} required>
              <Select id="estadoFisico" {...paleteForm.register("estadoFisico")}>
                {entries(ESTADO_FISICO).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" loading={paleteForm.formState.isSubmitting}>
              Registrar pesagem
            </Button>
          </form>

          <div>
            <p className="mb-2 text-xs font-medium text-muted">Paletes pesados nesta sessão</p>
            {sessao.length === 0 ? (
              <EmptyState icon={<IconPalete className="h-5 w-5" />} title="Nenhum palete pesado ainda" />
            ) : (
              <ul className="flex flex-col gap-2">
                {sessao.map((p) => {
                  const tipoMeta = TIPO_RESIDUO[p.tipo as keyof typeof TIPO_RESIDUO];
                  const estadoMeta = ESTADO_FISICO[p.estadoFisico as keyof typeof ESTADO_FISICO];
                  return (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-canvas-2/40 p-3.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          Nº {p.numeroPalete} · {p.ticket}
                        </p>
                        <p className="truncate text-xs text-muted">{tipoMeta?.label ?? p.tipo}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm text-ink">{formatNumber(p.peso, "kg")}</span>
                        {estadoMeta && <Badge tone={estadoMeta.tone}>{estadoMeta.label}</Badge>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
