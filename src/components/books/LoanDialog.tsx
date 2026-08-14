import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useLoans } from "../../store/loansStore";
import type { Book } from "../../types/book";

export function LoanDialog({
  book,
  open,
  onClose,
}: {
  book: Book | null;
  open: boolean;
  onClose: () => void;
}) {
  const lend = useLoans((state) => state.lend);
  const [borrower, setBorrower] = useState("");
  const [loanedAt, setLoanedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setBorrower("");
    setLoanedAt(new Date().toISOString().slice(0, 10));
    setDueAt("");
    setError("");
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!book) return;
    setSaving(true);
    setError("");
    try {
      await lend({
        bookId: book.id,
        borrower,
        loanedAt,
        dueAt: dueAt || undefined,
      });
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Ödünç kaydı oluşturulamadı.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Ödünç Ver · ${book?.title ?? ""}`}
      footer={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Vazgeç
          </button>
          <button
            type="submit"
            form="loan-form"
            className="btn btn-primary"
            disabled={saving || !borrower.trim()}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}Ödünç
            Verildi Olarak İşaretle
          </button>
        </>
      }
    >
      <form id="loan-form" onSubmit={submit} className="space-y-3">
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-accent-soft border border-accent/30 px-3 py-2 text-sm text-accent"
          >
            {error}
          </div>
        )}
        <label className="block">
          <span className="label">Ödünç alan kişi *</span>
          <input
            className="input"
            maxLength={200}
            value={borrower}
            onChange={(event) => setBorrower(event.target.value)}
            autoFocus
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Veriliş tarihi *</span>
            <input
              type="date"
              className="input"
              value={loanedAt}
              onChange={(event) => setLoanedAt(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="label">Planlanan iade</span>
            <input
              type="date"
              min={loanedAt}
              className="input"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </label>
        </div>
        <p className="text-xs text-mute">
          İade alındığında bu aktif kayıt silinir; ödünç geçmişi tutulmaz.
        </p>
      </form>
    </Modal>
  );
}
