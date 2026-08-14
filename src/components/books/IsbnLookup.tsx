import { useRef, useState } from "react";
import { Barcode, ImagePlus, Loader2, Search } from "lucide-react";
import { useSettings } from "../../store/settingsStore";
import { useToast } from "../../store/toastStore";
import { assertFileLimit, normalizeIsbn } from "../../lib/validation";
import type { DetectedBook } from "../../lib/ai/detectBooks";

export function IsbnLookup({
  isbn,
  onIsbn,
  onApply,
}: {
  isbn?: string;
  onIsbn: (isbn: string) => void;
  onApply: (book: DetectedBook) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<DetectedBook[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const networkMode = useSettings((state) => state.networkMode);

  const lookup = async (value = isbn) => {
    if (networkMode === "offline")
      return toast.show("Çevrimdışı mod açık.", "info");
    if (!window.kutuphanem)
      return toast.show("ISBN araması masaüstü uygulamasında çalışır.", "info");
    setBusy(true);
    try {
      const result = await window.kutuphanem.metadata.lookupIsbn(value ?? "");
      if (!result.ok)
        return toast.show(result.error ?? "ISBN aranamadı.", "error");
      setResults(result.books ?? []);
      if (!result.books?.length)
        toast.show("Bu ISBN için künye bulunamadı.", "info");
    } catch (error) {
      toast.show(
        error instanceof Error ? error.message : "ISBN aranamadı.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const scan = async (file: File) => {
    setBusy(true);
    try {
      assertFileLimit(file, "image");
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const url = URL.createObjectURL(file);
      try {
        const result = await reader.decodeFromImageUrl(url);
        const value = normalizeIsbn(result.getText());
        if (!value) throw new Error("Barkodda ISBN bulunamadı.");
        onIsbn(value);
        await lookup(value);
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.show(
        error instanceof Error ? error.message : "Barkod okunamadı.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sm:col-span-2 rounded-xl border border-line p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => lookup()}
          disabled={busy || !isbn}
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}{" "}
          ISBN Ara
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Barcode size={14} /> Barkod Görseli
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void scan(file);
            event.target.value = "";
          }}
        />
        <span className="text-xs text-mute">
          <ImagePlus size={12} className="inline mr-1" />
          Aramada yalnız ISBN, Google Books/OpenLibrary servislerine gönderilir.
        </span>
      </div>
      {results.length > 0 && (
        <div className="grid gap-2">
          {results.map((result, index) => (
            <button
              type="button"
              key={`${result.isbn}-${index}`}
              className="rounded-lg border border-line p-2 text-left hover:bg-hover"
              onClick={() => {
                onApply(result);
                setResults([]);
              }}
            >
              <div className="font-medium text-sm">{result.title}</div>
              <div className="text-xs text-mute">
                {result.author || "Bilinmiyor"}
                {result.publisher ? ` · ${result.publisher}` : ""}
                {result.publicationYear ? ` · ${result.publicationYear}` : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
