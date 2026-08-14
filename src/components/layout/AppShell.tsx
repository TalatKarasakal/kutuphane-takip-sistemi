import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BookList } from "../books/BookList";
import { BookFormDialog } from "../books/BookFormDialog";
import { BookDetailDrawer } from "../books/BookDetailDrawer";
import { MediaList } from "../media/MediaList";
import { MediaFormDialog } from "../media/MediaFormDialog";
import { MediaDetailDrawer } from "../media/MediaDetailDrawer";
import { MediaSidebar } from "../media/MediaSidebar";
import { CommandPalette } from "../commands/CommandPalette";
import { ToastContainer } from "../ui/Toast";
import { useBooks } from "../../store/booksStore";
import { useMedia } from "../../store/mediaStore";
import { useSettings } from "../../store/settingsStore";
import { useTags } from "../../store/tagsStore";
import { useLoans } from "../../store/loansStore";
import { useToast } from "../../store/toastStore";
import { applyTheme, subscribeNativeTheme } from "../../lib/theme";
import { maybeAutoBackup } from "../../lib/backup";
import { usePhotoImport } from "../../store/photoImportStore";
import type { Book } from "../../types/book";
import type { Media } from "../../types/media";
import type { Section } from "../../types/library";

const PhotoImportDialog = lazy(() =>
  import("../import/PhotoImportDialog").then((module) => ({
    default: module.PhotoImportDialog,
  })),
);
const ImportDialog = lazy(() =>
  import("../import/ImportDialog").then((module) => ({
    default: module.ImportDialog,
  })),
);
const ExportDialog = lazy(() =>
  import("../export/ExportDialog").then((module) => ({
    default: module.ExportDialog,
  })),
);
const SettingsDialog = lazy(() =>
  import("../settings/SettingsDialog").then((module) => ({
    default: module.SettingsDialog,
  })),
);

export type { Section } from "../../types/library";

export function AppShell() {
  const {
    load: loadBooks,
    add: addBook,
    update: updateBook,
    remove: removeBook,
    clearSelection: clearBookSelection,
  } = useBooks();
  const {
    load: loadMedia,
    add: addMedia,
    update: updateMedia,
    remove: removeMedia,
    clearSelection: clearMediaSelection,
  } = useMedia();
  const booksLoaded = useBooks((s) => s.loaded);
  const mediaLoaded = useMedia((s) => s.loaded);
  const booksError = useBooks((s) => s.error);
  const mediaError = useMedia((s) => s.error);
  const loadTags = useTags((s) => s.load);
  const tagsLoaded = useTags((s) => s.loaded);
  const loadLoans = useLoans((s) => s.load);
  const loansLoaded = useLoans((s) => s.loaded);
  const settings = useSettings();

  const [section, setSection] = useState<Section>("books");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | undefined>();
  const [detail, setDetail] = useState<Book | null>(null);

  const [mediaFormOpen, setMediaFormOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | undefined>();
  const [mediaDetail, setMediaDetail] = useState<Media | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTarget, setSettingsTarget] = useState<"general" | "about">(
    "general",
  );
  const [commandOpen, setCommandOpen] = useState(false);

  // Fotoğraf algılaması diyalogdan bağımsız sürer; durumu mağaza tutar.
  const photoOpen = usePhotoImport((s) => s.open);
  const photoStep = usePhotoImport((s) => s.step);
  const photoSection = usePhotoImport((s) => s.section);
  const openPhotoDialog = usePhotoImport((s) => s.openDialog);

  const searchRef = useRef<HTMLInputElement>(
    null,
  ) as React.RefObject<HTMLInputElement>;
  const sectionRef = useRef(section);
  sectionRef.current = section;

  useEffect(() => {
    void loadBooks().catch(() => undefined);
  }, [loadBooks]);
  useEffect(() => {
    void loadMedia().catch(() => undefined);
  }, [loadMedia]);
  useEffect(() => {
    void loadTags().catch(() => undefined);
  }, [loadTags]);
  useEffect(() => {
    void loadLoans().catch(() => undefined);
  }, [loadLoans]);

  // Bölüm değişince seçimleri ve açık detay panellerini bırak: film seçiliyken
  // Diziler'e geçildiğinde toplu işlem çubuğu yanlış kayıtlara işlem yapmasın.
  useEffect(() => {
    clearBookSelection();
    clearMediaSelection();
    setDetail(null);
    setMediaDetail(null);
  }, [section, clearBookSelection, clearMediaSelection]);

  useEffect(() => {
    if (booksLoaded && mediaLoaded)
      void maybeAutoBackup().catch((error) => {
        useToast
          .getState()
          .show(
            error instanceof Error
              ? error.message
              : "Otomatik yedek alınamadı.",
            "error",
          );
      });
  }, [booksLoaded, mediaLoaded]);
  useEffect(() => {
    applyTheme(settings);
  }, [settings]);
  useEffect(() => subscribeNativeTheme(settings), [settings]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const h = () => applyTheme(settings);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [settings]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const isEditable =
        ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
        el.isContentEditable;
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;

      if ((e.metaKey || e.ctrlKey) && e.key.toLocaleLowerCase("tr") === "k") {
        if (Number(document.body.dataset.overlayCount ?? "0") === 0) {
          e.preventDefault();
          setCommandOpen(true);
        }
        return;
      }
      if (Number(document.body.dataset.overlayCount ?? "0") > 0) return;

      if (e.key === "1" && !isEditable && !hasModifier) {
        setSection("books");
        return;
      }
      if (e.key === "2" && !isEditable && !hasModifier) {
        setSection("movies");
        return;
      }
      if (e.key === "3" && !isEditable && !hasModifier) {
        setSection("tv");
        return;
      }

      if (e.key === "n" && !isEditable && !hasModifier) {
        e.preventDefault();
        if (sectionRef.current === "books") {
          setEditing(undefined);
          setFormOpen(true);
        } else {
          setEditingMedia(undefined);
          setMediaFormOpen(true);
        }
        return;
      }

      if (e.key === "/" && !isEditable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const mediaType =
    section === "movies" ? ("film" as const) : ("dizi" as const);

  // Sonuç başka bir bölümde başlatılmış olabilir; diyaloğu açarken o bölüme
  // geçilir ki gözden geçirilen kayıtlar görünen listeyle aynı yeri anlatsın.
  const openPhotoImport = () => {
    const target = photoStep === "pick" ? section : photoSection;
    if (target !== section) setSection(target);
    openPhotoDialog(target);
  };

  if (booksError || mediaError) {
    return (
      <div className="h-screen grid place-items-center bg-bg text-text p-8">
        <div className="card max-w-md p-6 text-center">
          <h1 className="font-semibold">Yerel veriler yüklenemedi</h1>
          <p className="mt-2 text-sm text-muted">{booksError ?? mediaError}</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!booksLoaded || !mediaLoaded || !tagsLoaded || !loansLoaded) {
    return (
      <div className="h-screen grid place-items-center bg-bg text-text">
        <div className="text-sm text-muted">Kütüphaneniz yükleniyor…</div>
      </div>
    );
  }

  return (
    <div className="bg-bg text-text">
      <div className="h-screen flex flex-col" data-app-content>
        <Topbar
          section={section}
          onSection={setSection}
          onAdd={() => {
            if (section === "books") {
              setEditing(undefined);
              setFormOpen(true);
            } else {
              setEditingMedia(undefined);
              setMediaFormOpen(true);
            }
          }}
          onImport={() => setImportOpen(true)}
          onExport={() => setExportOpen(true)}
          onSettings={() => {
            setSettingsTarget("general");
            setSettingsOpen(true);
          }}
          onPhotoImport={openPhotoImport}
        />

        <div className="flex-1 flex min-h-0">
          {section === "books" ? (
            <Sidebar searchRef={searchRef} />
          ) : (
            <MediaSidebar type={mediaType} searchRef={searchRef} />
          )}
          <div className="flex-1 flex flex-col min-w-0">
            {section === "books" ? (
              <BookList onOpen={setDetail} />
            ) : (
              <MediaList type={mediaType} onOpen={setMediaDetail} />
            )}
          </div>
        </div>
      </div>

      <BookFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={async (b) => {
          if (editing) await updateBook(editing.id, b);
          else await addBook(b);
        }}
      />
      <BookDetailDrawer
        book={detail}
        onClose={() => setDetail(null)}
        onEdit={(b) => {
          setEditing(b);
          setFormOpen(true);
          setDetail(null);
        }}
        onDelete={(id) => removeBook([id])}
      />

      <MediaFormDialog
        open={mediaFormOpen}
        onClose={() => setMediaFormOpen(false)}
        initial={editingMedia}
        type={mediaType}
        onSave={async (m) => {
          if (editingMedia) await updateMedia(editingMedia.id, m);
          else await addMedia(m);
        }}
      />
      <MediaDetailDrawer
        item={mediaDetail}
        onClose={() => setMediaDetail(null)}
        onEdit={(m) => {
          setEditingMedia(m);
          setMediaFormOpen(true);
          setMediaDetail(null);
        }}
        onDelete={(id) => removeMedia([id])}
      />

      <Suspense fallback={null}>
        {(photoOpen || photoStep === "detecting") && (
          <PhotoImportDialog
            onOpenSettings={() => {
              setSettingsTarget("general");
              setSettingsOpen(true);
            }}
          />
        )}
        {importOpen && (
          <ImportDialog
            open
            onClose={() => setImportOpen(false)}
            section={section}
          />
        )}
        {exportOpen && (
          <ExportDialog
            open
            onClose={() => setExportOpen(false)}
            section={section}
          />
        )}
        {settingsOpen && (
          <SettingsDialog
            open
            initialSection={settingsTarget}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </Suspense>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        section={section}
        onSection={setSection}
        onAdd={() => {
          if (section === "books") {
            setEditing(undefined);
            setFormOpen(true);
          } else {
            setEditingMedia(undefined);
            setMediaFormOpen(true);
          }
        }}
        onPhotoImport={openPhotoImport}
        onImport={() => setImportOpen(true)}
        onExport={() => setExportOpen(true)}
        onSettings={() => {
          setSettingsTarget("general");
          setSettingsOpen(true);
        }}
        onAbout={() => {
          setSettingsTarget("about");
          setSettingsOpen(true);
        }}
        onOpenBook={(book) => {
          setSection("books");
          requestAnimationFrame(() => setDetail(book));
        }}
        onOpenMedia={(item) => {
          setSection(item.type === "film" ? "movies" : "tv");
          requestAnimationFrame(() => setMediaDetail(item));
        }}
      />

      <ToastContainer />
    </div>
  );
}
