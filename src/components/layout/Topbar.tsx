import {
  BookMarked,
  Film,
  Tv2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Camera,
  ChevronDown,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
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
import { usePhotoImport } from "../../store/photoImportStore";
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

const BRAND_TITLE: Record<Section, string> = {
  books: "Kütüphanem",
  movies: "Filmlerim",
  tv: "Dizilerim",
};

const PHOTO_LABEL: Record<Section, string> = {
  books: "Fotoğraftan Kitap Ekle",
  movies: "Fotoğraftan Film Ekle",
  tv: "Fotoğraftan Dizi Ekle",
};

export function Topbar({
  section,
  onSection,
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
  const BrandIcon = SECTIONS.find((s) => s.value === section)!.icon;
  const brandCount =
    section === "books"
      ? `${books.books.length} kitap`
      : `${media.media.filter((m) => m.type === mediaType).length} ${mediaType}`;

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
    <header className="relative z-30 h-14 shrink-0 border-b border-line bg-topbar pr-5 flex items-center">
      {/* Sol — uygulama kimliği. Genişliği kenar çubuğuyla hizalıdır. */}
      <div className="w-64 shrink-0 flex items-center gap-3 pl-5 pr-4 min-w-0">
        {/* Aydınlıkta lacivert zemin/beyaz ikon; karanlıkta vurgu tonunda
            yumuşak dolgu, kenarlık ve bordo ikon. */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent bg-navy text-white shadow-elev1 dark:border-accent-line dark:bg-accent-soft dark:text-accent dark:shadow-none">
          <BrandIcon size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight truncate">
            {BRAND_TITLE[section]}
          </div>
          <div className="text-xs text-mute truncate">{brandCount}</div>
        </div>
      </div>
      <div className="flex-1 min-w-0" />

      {/* Orta — sekmeler, görünüm, sütunlar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-line rounded-lg bg-panel overflow-hidden">
          {SECTIONS.map(({ value, icon: Icon, title }) => (
            <button
              key={value}
              onClick={() => onSection(value)}
              title={title}
              className={cn(
                "px-3 py-2",
                section === value
                  ? "bg-accent-soft text-accent-mark"
                  : "text-mute hover:bg-hover",
              )}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center border border-line rounded-lg bg-panel overflow-hidden">
          <button
            onClick={() => set("view", "table")}
            className={cn(
              "px-3 py-2",
              view === "table"
                ? "bg-accent-soft text-accent-mark"
                : "text-mute hover:bg-hover",
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
                ? "bg-accent-soft text-accent-mark"
                : "text-mute hover:bg-hover",
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
        <PhotoImportIndicator onOpen={onPhotoImport} />
        <MenuButton
          title="Ayarlar"
          triggerClassName="btn btn-ghost shrink-0 data-[open=true]:bg-hover"
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
            triggerClassName="btn btn-primary h-full rounded-l-none border-l border-accent-foreground/25 px-2"
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

/**
 * Arka planda süren fotoğraf algılamasını gösterir: iş çalışırken dönen
 * simge, sonuç beklerken vurgulu bir işaret. Tıklanınca diyalog açılır.
 */
function PhotoImportIndicator({ onOpen }: { onOpen: () => void }) {
  const step = usePhotoImport((state) => state.step);
  const unseen = usePhotoImport((state) => state.unseen);
  const open = usePhotoImport((state) => state.open);

  const running = step === "detecting";
  const ready = unseen && !open;
  if (!running && !ready) return null;

  const title = running
    ? "Fotoğraf arka planda inceleniyor"
    : "Fotoğraf sonucu hazır — gözden geçir";

  return (
    <button
      className={cn(
        "btn shrink-0",
        ready ? "btn-primary" : "btn-ghost text-accent",
      )}
      onClick={onOpen}
      title={title}
      aria-label={title}
      aria-busy={running}
    >
      {running ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Camera size={15} />
      )}
      <span className="hidden xl:inline">
        {running ? "İnceleniyor…" : "Sonuç hazır"}
      </span>
    </button>
  );
}
