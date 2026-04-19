import { ArrowDownToLine, ArrowUpFromLine, LayoutGrid, Moon, Plus, Search, Settings, Sun, Table } from 'lucide-react';
import { useBooks } from '../../store/booksStore';
import { useSettings } from '../../store/settingsStore';

interface Props {
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
}

export function Topbar({ onAdd, onImport, onExport, onSettings }: Props) {
  const { search, setSearch } = useBooks();
  const { theme, view, set } = useSettings();
  const isDark = theme === 'dark';

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur px-5 flex items-center gap-3">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Başlık, yazar, ISBN, not içinde ara…"
          className="input pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center border border-border rounded-lg bg-surface overflow-hidden">
          <button
            onClick={() => set('view', 'table')}
            className={`px-2.5 py-2 text-sm ${view === 'table' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface2'}`}
            title="Tablo"
          >
            <Table size={16} />
          </button>
          <button
            onClick={() => set('view', 'card')}
            className={`px-2.5 py-2 text-sm ${view === 'card' ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface2'}`}
            title="Kart"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        <button className="btn btn-ghost" onClick={() => set('theme', isDark ? 'light' : 'dark')} title="Tema">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="btn btn-outline" onClick={onImport}><ArrowDownToLine size={16} /> İçe Aktar</button>
        <button className="btn btn-outline" onClick={onExport}><ArrowUpFromLine size={16} /> Dışa Aktar</button>
        <button className="btn btn-ghost" onClick={onSettings} title="Ayarlar"><Settings size={16} /></button>
        <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> Kitap Ekle</button>
      </div>
    </header>
  );
}
