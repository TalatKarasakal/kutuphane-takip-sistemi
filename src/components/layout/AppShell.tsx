import { useEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BookList } from '../books/BookList';
import { BookFormDialog } from '../books/BookFormDialog';
import { BookDetailDrawer } from '../books/BookDetailDrawer';
import { MediaList } from '../media/MediaList';
import { MediaFormDialog } from '../media/MediaFormDialog';
import { MediaDetailDrawer } from '../media/MediaDetailDrawer';
import { MediaSidebar } from '../media/MediaSidebar';
import { ImportDialog } from '../import/ImportDialog';
import { ExportDialog } from '../export/ExportDialog';
import { SettingsDialog } from '../settings/SettingsDialog';
import { ToastContainer } from '../ui/Toast';
import { useBooks } from '../../store/booksStore';
import { useMedia } from '../../store/mediaStore';
import { useSettings } from '../../store/settingsStore';
import { applyTheme } from '../../lib/theme';
import type { Book } from '../../types/book';
import type { Media } from '../../types/media';

export type Section = 'books' | 'movies' | 'tv';

export function AppShell() {
  const { load: loadBooks, add: addBook, update: updateBook, remove: removeBook } = useBooks();
  const { load: loadMedia, add: addMedia, update: updateMedia, remove: removeMedia } = useMedia();
  const settings = useSettings();

  const [section, setSection] = useState<Section>('books');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | undefined>();
  const [detail, setDetail] = useState<Book | null>(null);

  const [mediaFormOpen, setMediaFormOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | undefined>();
  const [mediaDetail, setMediaDetail] = useState<Media | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const sectionRef = useRef(section);
  sectionRef.current = section;

  useEffect(() => { loadBooks(); }, [loadBooks]);
  useEffect(() => { loadMedia(); }, [loadMedia]);
  useEffect(() => { applyTheme(settings); }, [settings.theme, settings.accent, settings.fontFamily, settings.fontSize, settings.density, settings]);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const h = () => applyTheme(settings);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [settings]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditable = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);

      if (e.key === '1' && !isEditable) { setSection('books'); return; }
      if (e.key === '2' && !isEditable) { setSection('movies'); return; }
      if (e.key === '3' && !isEditable) { setSection('tv'); return; }

      if (e.key === 'n' && !isEditable && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (sectionRef.current === 'books') { setEditing(undefined); setFormOpen(true); }
        else { setEditingMedia(undefined); setMediaFormOpen(true); }
        return;
      }

      if (e.key === '/' && !isEditable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const mediaType = section === 'movies' ? 'film' as const : 'dizi' as const;

  return (
    <div className="h-screen flex flex-col bg-bg text-text">
      <Topbar
        section={section}
        onSection={setSection}
        searchRef={searchRef}
        onAdd={() => {
          if (section === 'books') { setEditing(undefined); setFormOpen(true); }
          else { setEditingMedia(undefined); setMediaFormOpen(true); }
        }}
        onImport={() => setImportOpen(true)}
        onExport={() => setExportOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex min-h-0">
        {section === 'books' ? <Sidebar /> : <MediaSidebar type={mediaType} />}
        <div className="flex-1 flex flex-col min-w-0">
          {section === 'books'
            ? <BookList onOpen={setDetail} />
            : <MediaList type={mediaType} onOpen={setMediaDetail} />}
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
        onEdit={(b) => { setEditing(b); setFormOpen(true); setDetail(null); }}
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
        onEdit={(m) => { setEditingMedia(m); setMediaFormOpen(true); setMediaDetail(null); }}
        onDelete={(id) => removeMedia([id])}
      />

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <ToastContainer />
    </div>
  );
}
