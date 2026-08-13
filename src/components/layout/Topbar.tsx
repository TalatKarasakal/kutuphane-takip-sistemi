import {
  BookMarked,
  Film,
  Tv2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Camera,
  ChevronDown,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Table,
  type LucideProps,
} from "lucide-react";
import { useBooks } from "../../store/booksStore";
import { useMedia } from "../../store/mediaStore";
import { useSettings } from "../../store/settingsStore";
import { ColumnManager } from "../ui/ColumnManager";
import { MenuButton } from "../ui/MenuButton";
import {
  BOOK_COLUMN_LABELS,
  FILM_COLUMN_LABELS,
  TV_COLUMN_LABELS,
} from "../../constants/columns";
import { cn } from "../../lib/utils";
import type { Section } from "./AppShell";

interface Props {
  section: Section;
  onSection: (s: Section) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
  onPhotoImport: () => void;
}

const SECTIONS: {
  value: Section;
  icon: React.ComponentType<LucideProps>;
  title: string;
}[] = [
  { value: "books", icon: BookMarked, title: "Kitaplar" },
  { value: "movies", icon: Film, title: "Filmler" },
  { value: "tv", icon: Tv2, title: "Diziler" },
];

const ADD_LABEL: Record<Section, string> = {
  books: "Kitap Ekle",
  movies: "Film Ekle",
  tv: "Dizi Ekle",
};

const SEARCH_PLACEHOLDER: Record<Section, string> = {
  books: "Başlık, yazar, ISBN, not içinde ara…",
  movies: "Başlık, yönetmen, not içinde ara…",
  tv: "Başlık, yönetmen, not içinde ara…",
};

const PHOTO_LABEL: Record<Section, string> = {
  books: "Fotoğraftan Kitap Ekle",
  movies: "Fotoğraftan Film Ekle",
  tv: "Fotoğraftan Dizi Ekle",
};

export function Topbar({
  section,
  onSection,
  searchRef,
  onAdd,
  onImport,
  onExport,
  onSettings,
  onPhotoImport,
}: Props) {
  const books = useBooks();
  const media = useMedia();
  const { view, set, setColumns, bookColumns, filmColumns, tvColumns } =
    useSettings();

  const mediaType = section === "movies" ? "film" : "dizi";
  const search =
    section === "books" ? books.search : media.filters[mediaType].search;
  const setSearch = (value: string) =>
    section === "books"
      ? books.setSearch(value)
      : media.setSearch(mediaType, value);

  const colConfig =
    section === "books"
      ? bookColumns
      : section === "movies"
        ? filmColumns
        : tvColumns;
  const colLabels =
    section === "books"
      ? BOOK_COLUMN_LABELS
      : section === "movies"
        ? FILM_COLUMN_LABELS
        : TV_COLUMN_LABELS;
  const colSection =
    section === "books" ? "book" : section === "movies" ? "film" : "tv";

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur px-5 flex items-center shrink-0">
      {/* Sol — arama */}
      <div className="flex-1 flex items-center min-w-0">
        <div className="relative w-full max-w-96 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={15}
          />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={SEARCH_PLACEHOLDER[section]}
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      {/* Orta — sekmeler, görünüm, sütunlar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
          {SECTIONS.map(({ value, icon: Icon, title }) => (
            <button
              key={value}
              onClick={() => onSection(value)}
              title={title}
              className={cn(
                "px-3 py-2",
                section === value
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-surface2",
              )}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
          <button
            onClick={() => set("view", "table")}
            className={cn(
              "px-3 py-2",
              view === "table"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-surface2",
            )}
            title="Tablo"
          >
            <Table size={15} />
          </button>
          <button
            onClick={() => set("view", "card")}
            className={cn(
              "px-3 py-2",
              view === "card"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-surface2",
            )}
            title="Kart"
          >
            <LayoutGrid size={15} />
          </button>
        </div>

        {view === "table" && (
          <ColumnManager
            columns={colConfig}
            labels={colLabels}
            onChange={(cols) => setColumns(colSection, cols)}
          />
        )}
      </div>

      {/* Sağ — ayarlar ve ekleme. İçe/dışa aktarma ayarlar menüsünde,
          fotoğraftan ekleme ise ekleme menüsünde gömülüdür; ana sayfada
          yalnızca iki denetim görünür. Ekle butonunun yazısı dar (pencere)
          ekranlarda gizlenir, geniş ekranda görünür. */}
      <div className="flex items-center justify-end gap-2 shrink-0 ml-2">
        <MenuButton
          title="Ayarlar"
          triggerClassName="btn btn-ghost shrink-0 data-[open=true]:bg-surface2"
          trigger={<Settings size={15} />}
          items={[
            {
              id: "import",
              label: "İçe Aktar",
              icon: ArrowDownToLine,
              onSelect: onImport,
            },
            {
              id: "export",
              label: "Dışa Aktar",
              icon: ArrowUpFromLine,
              onSelect: onExport,
            },
            {
              id: "settings",
              label: "Ayarları Aç",
              icon: SlidersHorizontal,
              onSelect: onSettings,
              separatorBefore: true,
            },
          ]}
        />

        <div className="flex items-stretch shrink-0">
          <button
            className="btn btn-primary whitespace-nowrap rounded-r-none"
            onClick={onAdd}
            title={ADD_LABEL[section]}
          >
            <Plus size={15} />{" "}
            <span className="hidden lg:inline">{ADD_LABEL[section]}</span>
          </button>
          <MenuButton
            title={`${ADD_LABEL[section]} seçenekleri`}
            triggerClassName="btn btn-primary h-full rounded-l-none border-l border-primary-foreground/25 px-2"
            trigger={<ChevronDown size={15} />}
            items={[
              {
                id: "manual",
                label: ADD_LABEL[section],
                icon: Pencil,
                onSelect: onAdd,
              },
              {
                id: "photo",
                label: PHOTO_LABEL[section],
                icon: Camera,
                onSelect: onPhotoImport,
                separatorBefore: true,
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
