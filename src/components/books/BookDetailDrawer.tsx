import { useState } from "react";
import { Drawer } from "../ui/Drawer";
import { StatusBadge } from "../ui/Badge";
import { Pencil, RotateCcw, Star, Trash2, UserRound } from "lucide-react";
import type { Book } from "../../types/book";
import { useLoans } from "../../store/loansStore";
import { useTags } from "../../store/tagsStore";
import { useSettings } from "../../store/settingsStore";
import { useArtwork } from "../../lib/artwork";
import { LoanDialog } from "./LoanDialog";

interface Props {
  book: Book | null;
  onClose: () => void;
  onEdit: (b: Book) => void;
  onDelete: (id: string) => void;
}

export function BookDetailDrawer({ book, onClose, onEdit, onDelete }: Props) {
  const [loanOpen, setLoanOpen] = useState(false);
  const loans = useLoans((state) => state.loans);
  const returnBook = useLoans((state) => state.returnBook);
  const tags = useTags((state) => state.tags);
  const visualMode = useSettings((state) => state.visualMode);
  const artwork = useArtwork("book", book?.id ?? "", book?.coverUrl);
  const loan = book ? loans.find((item) => item.bookId === book.id) : undefined;
  const selectedTags = book
    ? tags.filter((tag) => book.tagIds?.includes(tag.id))
    : [];

  return (
    <>
      <Drawer
        open={!!book}
        onClose={onClose}
        title={book?.title ?? ""}
        footer={
          book && (
            <>
              <button
                className="btn btn-ghost text-secondary"
                onClick={() => {
                  onDelete(book.id);
                  onClose();
                }}
              >
                <Trash2 size={16} /> Sil
              </button>
              {loan ? (
                <button
                  className="btn btn-outline"
                  onClick={() => void returnBook(book.id)}
                >
                  <RotateCcw size={16} /> İade Al
                </button>
              ) : (
                <button
                  className="btn btn-outline"
                  onClick={() => setLoanOpen(true)}
                >
                  <UserRound size={16} /> Ödünç Ver
                </button>
              )}
              <button className="btn btn-primary" onClick={() => onEdit(book)}>
                <Pencil size={16} /> Düzenle
              </button>
            </>
          )
        }
      >
        {book && (
          <div className="space-y-4">
            {visualMode === "enriched" && artwork.url && (
              <div className="mx-auto aspect-[2/3] max-h-72 overflow-hidden rounded-xl bg-surface2">
                <img
                  src={artwork.url}
                  alt={`${book.title} kapağı`}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{book.title}</div>
                <div className="text-muted">{book.author}</div>
              </div>
              <StatusBadge status={book.status} />
            </div>

            {book.rating && (
              <div
                className="flex items-center gap-1"
                aria-label={`${book.rating} yıldız`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    size={17}
                    className={
                      index < book.rating!
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    }
                  />
                ))}
              </div>
            )}

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="chip"
                    style={{ borderColor: tag.color }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {loan && (
              <div className="rounded-xl border border-primary/25 bg-primary/10 p-3 text-sm">
                <div className="font-semibold">
                  {loan.borrower} kişisine ödünç verildi
                </div>
                <div className="mt-1 text-xs text-muted">
                  {loan.loanedAt}
                  {loan.dueAt ? ` · Planlanan iade: ${loan.dueAt}` : ""}
                </div>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Yayınevi" value={book.publisher} />
              <Info label="Tür" value={book.genre} />
              <Info label="Sayfa" value={book.pageCount} />
              <Info label="Yayın Yılı" value={book.publicationYear} />
              <Info label="ISBN" value={book.isbn} />
              <Info label="Dil" value={book.language} />
              <Info label="Çevirmen" value={book.translator} />
              <Info
                label="Okuma"
                value={[book.readStartDate, book.readEndDate]
                  .filter(Boolean)
                  .join(" → ")}
              />
            </dl>

            {book.notes && (
              <div>
                <div className="label">Notlar</div>
                <div className="whitespace-pre-wrap rounded-lg bg-surface2 p-3 text-sm">
                  {book.notes}
                </div>
              </div>
            )}

            <div className="text-xs text-muted pt-2 border-t border-border">
              Eklendi: {new Date(book.addedAt).toLocaleString("tr-TR")}
              {book.updatedAt !== book.addedAt &&
                ` · Güncellendi: ${new Date(book.updatedAt).toLocaleString("tr-TR")}`}
            </div>
          </div>
        )}
      </Drawer>
      <LoanDialog
        book={book}
        open={loanOpen && Boolean(book)}
        onClose={() => setLoanOpen(false)}
      />
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <div className="label">{label}</div>
      <div>{value}</div>
    </div>
  );
}
