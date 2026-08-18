import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

let externalOpen: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  if (!externalOpen) return Promise.resolve(window.confirm(options.title));
  return externalOpen(options);
}

export function ConfirmDialogHost() {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [loading, setLoading] = useState(false);

  externalOpen = (options) =>
    new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });

  const close = (value: boolean) => {
    state?.resolve(value);
    setState(null);
    setLoading(false);
  };

  return (
    <Modal open={!!state} onClose={() => close(false)} title={state?.title ?? ""} description={state?.description}>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => close(false)}>
          Cancelar
        </Button>
        <Button
          variant={state?.danger ? "danger" : "primary"}
          loading={loading}
          onClick={() => {
            setLoading(true);
            close(true);
          }}
        >
          {state?.confirmLabel ?? "Confirmar"}
        </Button>
      </div>
    </Modal>
  );
}
