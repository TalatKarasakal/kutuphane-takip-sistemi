import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BookList } from '../books/BookList';
import { BookFormDialog } from '../books/BookFormDialog';
import { BookDetailDrawer } from '../books/BookDetailDrawer';
import { ImportDialog } from '../import/ImportDialog';
import { ExportDialog } from '../export/ExportDialog';
import { SettingsDialog } from '../settings/SettingsDialog';
import { useBooks } from '../../store/booksStore';
import { useSettings } from '../../store/settingsStore';
import { applyTheme } from '../../lib/theme';
import type { Book } from '../../types/book';

export function AppShell() {
  const { load, add, update, remove } = useBooks();
  const settings = useSettings();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | undefined>();
  const [detail, setDetail] = useState<Book | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { applyTheme(settings); }, [settings.theme, settings.accent, settings.fontFamily, settings.fontSize, settings.density, settings]);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const h = () => applyTheme(settings);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [settings]);

  return (
    <div className="h-screen flex bg-bg text-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onAdd={() => { setEditing(undefined); setFormOpen(true); }}
          onImport={() => setImportOpen(true)}
          onExport={() => setExportOpen(true)}
          onSettings={() => setSettingsOpen(true)}
        />
        <BookList onOpen={setDetail} />
      </div>

      <BookFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={async (b) => {
          if (editing) await update(editing.id, b);
          else await add(b);
        }}
      />

      <BookDetailDrawer
        book={detail}
        onClose={() => setDetail(null)}
        onEdit={(b) => { setEditing(b); setFormOpen(true); setDetail(null); }}
        onDelete={(id) => remove([id])}
      />

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
