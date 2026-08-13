import { useMemo, useState } from "react";
import {
  BookOpen,
  Camera,
  DatabaseBackup,
  Film,
  Import,
  Info,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Share,
  Tv2,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { useBooks } from "../../store/booksStore";
import { useMedia } from "../../store/mediaStore";
import { createBackup } from "../../lib/backup";
import { useToast } from "../../store/toastStore";
import type { Book } from "../../types/book";
import type { Media } from "../../types/media";
import type { Section } from "../layout/AppShell";

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void | Promise<void>;
}

export function CommandPalette({
  open,
  onClose,
  section,
  onSection,
  onAdd,
  onPhotoImport,
  onImport,
  onExport,
  onSettings,
  onAbout,
  onOpenBook,
  onOpenMedia,
}: {
  open: boolean;
  onClose: () => void;
  section: Section;
  onSection: (section: Section) => void;
  onAdd: () => void;
  onPhotoImport: () => void;
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onOpenBook: (book: Book) => void;
  onOpenMedia: (item: Media) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const books = useBooks((state) => state.books);
  const clearBookFilters = useBooks((state) => state.clearFilters);
  const media = useMedia((state) => state.media);
  const clearMediaFilters = useMedia((state) => state.clearFilters);
  const normalized = query.trim().toLocaleLowerCase("tr");

  const commands = useMemo<Command[]>(() => {
    const fixed: Command[] = [
      {
        id: "books",
        label: "Kitaplara geç",
        icon: BookOpen,
        run: () => onSection("books"),
      },
      {
        id: "movies",
        label: "Filmlere geç",
        icon: Film,
        run: () => onSection("movies"),
      },
      {
        id: "tv",
        label: "Dizilere geç",
        icon: Tv2,
        run: () => onSection("tv"),
      },
      {
        id: "add",
        label:
          section === "books"
            ? "Kitap ekle"
            : section === "movies"
              ? "Film ekle"
              : "Dizi ekle",
        icon: Plus,
        run: onAdd,
      },
      {
        id: "photo",
        label:
          section === "books"
            ? "Fotoğraftan kitap ekle"
            : section === "movies"
              ? "Fotoğraftan film ekle"
              : "Fotoğraftan dizi ekle",
        icon: Camera,
        run: onPhotoImport,
      },
      {
        id: "import",
        label: "Dosyadan içe aktar",
        icon: Import,
        run: onImport,
      },
      {
        id: "export",
        label: "Dosyaya dışa aktar",
        icon: Share,
        run: onExport,
      },
      {
        id: "filters",
        label: "Filtreleri sıfırla",
        icon: RotateCcw,
        run: () =>
          section === "books"
            ? clearBookFilters()
            : clearMediaFilters(section === "movies" ? "film" : "dizi"),
      },
      {
        id: "backup",
        label: "Şimdi yedekle",
        icon: DatabaseBackup,
        run: async () => {
          const result = await createBackup();
          useToast
            .getState()
            .show(
              result.ok
                ? "Yedek oluşturuldu"
                : (result.error ?? "Yedek oluşturulamadı"),
              result.ok ? "success" : "error",
            );
        },
      },
      { id: "settings", label: "Ayarları aç", icon: Settings, run: onSettings },
      {
        id: "about",
        label: "Hakkında ve güncelleme bilgisi",
        icon: Info,
        run: onAbout,
      },
    ];
    const records: Command[] = [
      ...books.map((book) => ({
        id: `book:${book.id}`,
        label: book.title,
        hint: `Kitap · ${book.author}`,
        icon: BookOpen,
        run: () => onOpenBook(book),
      })),
      ...media.map((item) => ({
        id: `media:${item.id}`,
        label: item.title,
        hint: item.type === "film" ? "Film" : "Dizi",
        icon: item.type === "film" ? Film : Tv2,
        run: () => onOpenMedia(item),
      })),
    ];
    return [...fixed, ...records];
  }, [
    books,
    clearBookFilters,
    clearMediaFilters,
    media,
    onAdd,
    onAbout,
    onExport,
    onImport,
    onPhotoImport,
    onOpenBook,
    onOpenMedia,
    onSection,
    onSettings,
    section,
  ]);

  const visible = commands
    .filter(
      (command) =>
        !normalized ||
        `${command.label} ${command.hint ?? ""}`
          .toLocaleLowerCase("tr")
          .includes(normalized),
    )
    .slice(0, 30);
  const run = async (command: Command | undefined) => {
    if (!command) return;
    const pending = command.run();
    onClose();
    setQuery("");
    setActive(0);
    await pending;
  };

  return (
    <Modal open={open} onClose={onClose} title="Komut Paleti" size="lg">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          autoFocus
          data-initial-focus
          className="input pl-9"
          placeholder="Kayıt veya komut ara…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((value) => Math.min(value + 1, visible.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => Math.max(value - 1, 0));
            }
            if (event.key === "Enter") {
              event.preventDefault();
              void run(visible[active]);
            }
          }}
        />
      </div>
      <div
        className="mt-3 max-h-[55vh] overflow-auto rounded-xl border border-border p-1"
        role="listbox"
        aria-label="Komut sonuçları"
      >
        {visible.map((command, index) => {
          const Icon = command.icon;
          return (
            <button
              key={command.id}
              role="option"
              aria-selected={index === active}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${index === active ? "bg-primary/15 text-primary" : "hover:bg-surface2"}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => void run(command)}
            >
              <Icon size={16} />
              <span className="flex-1 truncate">{command.label}</span>
              {command.hint && (
                <span className="text-xs text-muted">{command.hint}</span>
              )}
            </button>
          );
        })}
        {visible.length === 0 && (
          <p className="p-4 text-center text-sm text-muted">
            Eşleşme bulunamadı.
          </p>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">
        ↑↓ ile seç · Enter ile çalıştır · Esc ile kapat
      </p>
    </Modal>
  );
}
