import { useCallback, useEffect, useRef, useState } from "react";
import {
  DatabaseBackup,
  FolderOpen,
  RotateCcw,
  Save,
  Sparkles,
  ExternalLink,
  KeyRound,
  Trash2,
  RefreshCw,
  Info,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { useSettings } from "../../store/settingsStore";
import { useToast } from "../../store/toastStore";
import { FONT_OPTIONS } from "../../lib/theme";
import {
  createBackup,
  restoreSnapshot,
  isElectron,
  listBackupPreviews,
  readBackup,
  parseSnapshot,
  type BackupPreview,
  type Snapshot,
} from "../../lib/backup";
import { assertFileLimit, validationMessage } from "../../lib/validation";
import { TagManager } from "../tags/TagManager";

export function SettingsDialog({
  open,
  onClose,
  initialSection = "general",
}: {
  open: boolean;
  onClose: () => void;
  initialSection?: "general" | "about";
}) {
  const {
    theme,
    fontFamily,
    fontSize,
    density,
    view,
    visualMode,
    networkMode,
    remoteArtwork,
    set,
    reset,
  } = useSettings();
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || initialSection !== "about") return;
    const frame = requestAnimationFrame(() => {
      aboutRef.current?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialSection, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ayarlar"
      size="lg"
      footer={
        <>
          <button className="btn btn-ghost" onClick={reset}>
            Sıfırla
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Tamam
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title="Tema">
          <Segmented
            value={theme}
            onChange={(v) => set("theme", v as typeof theme)}
            options={[
              { value: "light", label: "Açık" },
              { value: "dark", label: "Koyu" },
              { value: "system", label: "Sistem" },
            ]}
          />
        </Section>

        <Section title="Yazı Tipi">
          <select
            className="input"
            value={fontFamily}
            onChange={(e) => set("fontFamily", e.target.value)}
          >
            {FONT_OPTIONS.map((f) => (
              <option
                key={f.value}
                value={f.value}
                style={{ fontFamily: f.stack }}
              >
                {f.value}
              </option>
            ))}
          </select>
        </Section>

        <Section title={`Punto · ${fontSize}px`}>
          <input
            type="range"
            min={12}
            max={22}
            step={1}
            value={fontSize}
            onChange={(e) => set("fontSize", Number(e.target.value))}
            className="w-full accent-[rgb(var(--primary))]"
          />
          <div className="flex justify-between text-[11px] text-muted mt-1">
            <span>12</span>
            <span>17</span>
            <span>22</span>
          </div>
        </Section>

        <Section title="Yoğunluk">
          <Segmented
            value={density}
            onChange={(v) => set("density", v as typeof density)}
            options={[
              { value: "comfortable", label: "Konforlu" },
              { value: "compact", label: "Sıkışık" },
            ]}
          />
        </Section>

        <Section title="Varsayılan Görünüm">
          <Segmented
            value={view}
            onChange={(v) => set("view", v as typeof view)}
            options={[
              { value: "table", label: "Tablo" },
              { value: "card", label: "Kart" },
            ]}
          />
        </Section>

        <Section title="Görsel Sunum">
          <Segmented
            value={visualMode}
            onChange={(value) => set("visualMode", value)}
            options={[
              { value: "classic", label: "Klasik" },
              { value: "enriched", label: "Zengin" },
            ]}
          />
          <div className="text-xs text-muted mt-2">
            Zengin görünüm kapakları, portre kartlarını ve medya posterlerini
            gösterir.
          </div>
        </Section>

        <Section title="Ağ ve Gizlilik">
          <Segmented
            value={networkMode}
            onChange={(value) => set("networkMode", value)}
            options={[
              { value: "on-demand", label: "İsteğe bağlı" },
              { value: "offline", label: "Çevrimdışı" },
            ]}
          />
          <label className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span>
              Eksik kapak/posterleri kullanıcı tercihiyle indir ve önbellekle
            </span>
            <input
              type="checkbox"
              checked={remoteArtwork}
              disabled={networkMode === "offline"}
              onChange={(event) => set("remoteArtwork", event.target.checked)}
            />
          </label>
          <div className="text-xs text-muted mt-2">
            Çevrimdışı mod Gemini, ISBN, görsel ve güncelleme isteklerini
            engeller.
          </div>
        </Section>

        <AiSection />

        <Section title="Etiket Yönetimi">
          <TagManager />
        </Section>

        <BackupSection active={open} />

        <div ref={aboutRef}>
          <AboutSection initialFocus={initialSection === "about"} />
        </div>
      </div>
    </Modal>
  );
}

function AiSection() {
  const { aiProvider, set } = useSettings();
  return (
    <Section title="Yapay Zekâ · Fotoğraftan Ekle">
      <div className="space-y-3">
        <Segmented
          value={aiProvider}
          onChange={(value) => set("aiProvider", value)}
          options={[
            { value: "gemini", label: "Gemini (bulut)" },
            { value: "local", label: "Bu bilgisayar" },
          ]}
        />
        {aiProvider === "gemini" ? <GeminiKeyFields /> : <LocalAiFields />}
      </div>
    </Section>
  );
}

function LocalAiFields() {
  const { localAiUrl, localAiModel, set } = useSettings();
  const [models, setModels] = useState<
    { name: string; vision: boolean }[] | null
  >(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const refresh = async () => {
    if (!window.kutuphanem) return;
    setBusy(true);
    setError("");
    const result = await window.kutuphanem.metadata.localModels(localAiUrl);
    setBusy(false);
    if (!result.ok) {
      setModels(null);
      setError(result.error ?? "Modeller alınamadı.");
      return;
    }
    setModels(result.models ?? []);
    if (!result.models?.length) {
      setError("Sunucuya ulaşıldı ama kurulu model bulunamadı.");
      return;
    }
    toast.show(`${result.models.length} yerel model bulundu`);
  };

  const selected = models?.find((model) => model.name === localAiModel);

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted">
        Fotoğraf bu bilgisayarda çalışan bir modele gönderilir; internete çıkmaz
        ve çevrimdışı modda da çalışır. Ollama gibi bir sunucunun açık olması ve{" "}
        <strong>görsel destekli</strong> bir modelin kurulu olması gerekir.
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          value={localAiUrl}
          spellCheck={false}
          autoComplete="off"
          aria-label="Yerel model sunucu adresi"
          placeholder="http://localhost:11434"
          onChange={(event) => set("localAiUrl", event.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline whitespace-nowrap"
          onClick={() => void refresh()}
          disabled={busy || !window.kutuphanem}
        >
          <RefreshCw size={15} className={busy ? "animate-spin" : ""} />
          Modelleri Getir
        </button>
      </div>

      {models?.length ? (
        <select
          className="input"
          aria-label="Yerel model"
          value={localAiModel}
          onChange={(event) => set("localAiModel", event.target.value)}
        >
          <option value="">Model seç…</option>
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
              {model.vision ? "" : " — görsel desteği yok"}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="input"
          value={localAiModel}
          spellCheck={false}
          autoComplete="off"
          aria-label="Yerel model"
          placeholder="Model adı (örn. qwen3.5:9b)"
          onChange={(event) => set("localAiModel", event.target.value)}
        />
      )}

      {error && <div className="text-xs text-secondary">{error}</div>}
      {selected && !selected.vision && (
        <div className="text-xs text-kemik-700">
          Bu model görseli okuyamaz; fotoğraftan ekleme çalışmaz. Görsel
          destekli bir model seç.
        </div>
      )}
      {!window.kutuphanem && (
        <div className="text-xs text-kemik-700">
          Yerel model yalnız masaüstü uygulamasında kullanılabilir.
        </div>
      )}
    </div>
  );
}

function GeminiKeyFields() {
  const [draft, setDraft] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    void window.kutuphanem?.secrets
      .status()
      .then((status) => setHasKey(status.gemini));
  }, []);

  const save = async () => {
    const value = draft.trim();
    if (!value || !window.kutuphanem) return;
    setBusy(true);
    const result = await window.kutuphanem.secrets.setGemini(value);
    setBusy(false);
    if (!result.ok)
      return toast.show(result.error ?? "Anahtar kaydedilemedi.", "error");
    setDraft("");
    setHasKey(true);
    toast.show("Gemini anahtarı güvenli depoya kaydedildi");
  };

  const clear = async () => {
    if (!window.kutuphanem) return;
    const result = await window.kutuphanem.secrets.clearGemini();
    if (!result.ok)
      return toast.show(result.error ?? "Anahtar silinemedi.", "error");
    setHasKey(false);
    setDraft("");
    toast.show("Gemini anahtarı silindi");
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted">
        Fotoğraftan otomatik ekleme için Google'ın ücretsiz Gemini servisini
        kullanır. Anahtar işletim sisteminin güvenli deposunda tutulur;
        yedeklere veya dışa aktarımlara dâhil edilmez.
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          className="input"
          placeholder={
            hasKey
              ? "Güvenli anahtar kayıtlı · değiştirmek için yaz…"
              : "Gemini API anahtarını yapıştır…"
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn btn-outline"
          onClick={save}
          disabled={busy || !draft.trim()}
        >
          <KeyRound size={15} /> Kaydet
        </button>
        {hasKey && (
          <button
            type="button"
            className="btn btn-ghost text-secondary"
            onClick={clear}
            aria-label="Gemini anahtarını sil"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      {!window.kutuphanem && (
        <div className="text-xs text-kemik-700">
          Güvenli anahtar yönetimi yalnız masaüstü uygulamasında kullanılabilir.
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          window.kutuphanem?.appInfo.openExternal(
            "https://aistudio.google.com/apikey",
          )
        }
        className="inline-flex items-center gap-1.5 text-xs text-primary-ink hover:underline"
      >
        <Sparkles size={13} /> Ücretsiz anahtar al (Google AI Studio){" "}
        <ExternalLink size={12} />
      </button>
    </div>
  );
}

function BackupSection({ active }: { active: boolean }) {
  const { autoBackup, backupFrequency, lastBackupAt, set } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<BackupPreview[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [pendingRestore, setPendingRestore] = useState<{
    text: string;
    preview: Snapshot;
  } | null>(null);
  const electron = isElectron();

  const refresh = useCallback(async () => {
    if (!electron) return;
    try {
      setHistory(await listBackupPreviews());
      setHistoryError("");
    } catch (error) {
      setHistoryError(validationMessage(error));
    }
  }, [electron]);

  useEffect(() => {
    if (active) void refresh();
  }, [active, refresh]);

  const onBackupNow = async () => {
    setBusy(true);
    try {
      const res = await createBackup();
      if (res.ok) {
        useToast
          .getState()
          .show(
            res.mode === "electron"
              ? "Yedek diske kaydedildi"
              : "Yedek dosyası indirildi",
          );
        await refresh();
      } else {
        useToast.getState().show(res.error ?? "Yedek alınamadı", "error");
      }
    } finally {
      setBusy(false);
    }
  };

  const onReveal = async () => {
    await window.kutuphanem?.backup.reveal();
  };

  const onRestoreFile = async (file: File) => {
    try {
      assertFileLimit(file, "backup");
    } catch (error) {
      useToast.getState().show(validationMessage(error), "error");
      return;
    }
    previewRestore(await file.text());
  };

  const previewRestore = (text: string) => {
    try {
      setPendingRestore({ text, preview: parseSnapshot(text) });
    } catch (error) {
      useToast.getState().show(validationMessage(error), "error");
    }
  };

  const confirmRestore = async () => {
    if (!pendingRestore) return;
    const { text } = pendingRestore;
    setBusy(true);
    try {
      const res = await restoreSnapshot(text);
      if (res.ok) {
        setPendingRestore(null);
        useToast
          .getState()
          .show(
            `Geri yüklendi: ${res.books} kitap, ${res.media} film/dizi, ${res.tags} etiket`,
          );
        await refresh();
      } else {
        useToast
          .getState()
          .show(res.error ?? "Geri yükleme başarısız", "error");
      }
    } finally {
      setBusy(false);
    }
  };

  const restoreHistory = async (preview: BackupPreview) => {
    setBusy(true);
    try {
      previewRestore(await readBackup(preview.info.path));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Section title="Yedekleme">
        <div className="space-y-3">
          <div className="text-xs text-muted">
            {lastBackupAt
              ? `Son yedek: ${new Date(lastBackupAt).toLocaleString("tr-TR")}`
              : "Henüz yedek alınmadı."}
            {!electron &&
              " · Tarayıcıda yedek dosya olarak indirilir; otomatik yedek yalnızca masaüstü uygulamasında çalışır."}
          </div>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">Otomatik yedekle</span>
            <input
              type="checkbox"
              className="accent-[rgb(var(--primary))] w-4 h-4"
              checked={autoBackup}
              onChange={(e) => set("autoBackup", e.target.checked)}
            />
          </label>

          {autoBackup && (
            <Segmented
              value={backupFrequency}
              onChange={(v) => set("backupFrequency", v)}
              options={[
                { value: "launch", label: "Her açılış" },
                { value: "daily", label: "Günlük" },
                { value: "weekly", label: "Haftalık" },
              ]}
            />
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              className="btn btn-outline"
              onClick={onBackupNow}
              disabled={busy}
            >
              <Save size={15} /> Şimdi Yedekle
            </button>
            {electron && (
              <button className="btn btn-ghost" onClick={onReveal}>
                <FolderOpen size={15} /> Klasörü Aç
              </button>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              <RotateCcw size={15} /> Dosyadan Geri Yükle
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onRestoreFile(f);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-muted">
            <DatabaseBackup size={14} className="mt-0.5 shrink-0" />
            <span>
              Yedekler kitap, film/dizi, etiket ve aktif ödünç verilerini
              içerir; secret ve görsel önbelleği içermez.
              {electron &&
                ' Uygulama içinde, kullanıcı verisi klasöründeki "backups" altında son 20 yedek saklanır.'}
            </span>
          </div>

          {electron && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-3 py-2 flex items-center justify-between bg-surface2 text-xs font-semibold">
                <span>Yedek geçmişi</span>
                <button
                  className="text-primary-ink"
                  onClick={refresh}
                  aria-label="Yedek geçmişini yenile"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
              {historyError ? (
                <div className="p-3 text-xs text-secondary">{historyError}</div>
              ) : history.length === 0 ? (
                <div className="p-3 text-xs text-muted">
                  Henüz uygulama içi yedek yok.
                </div>
              ) : (
                <div className="max-h-56 overflow-auto divide-y divide-border">
                  {history.map((preview) => (
                    <div
                      key={preview.info.path}
                      className="p-3 flex items-center gap-3 text-xs"
                    >
                      <DatabaseBackup
                        size={15}
                        className="text-primary-ink shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">
                          {new Date(preview.exportedAt).toLocaleString("tr-TR")}
                        </div>
                        <div className="text-muted">
                          {preview.books < 0
                            ? "Geçersiz yedek"
                            : `${preview.books} kitap · ${preview.media} medya · ${preview.tags} etiket · ${preview.activeLoans} ödünç`}
                          {" · "}
                          {formatBytes(preview.info.size)}
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost"
                        disabled={busy || preview.books < 0}
                        onClick={() => restoreHistory(preview)}
                      >
                        <RotateCcw size={13} /> Geri Yükle
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Section>
      <Modal
        open={pendingRestore != null}
        onClose={() => !busy && setPendingRestore(null)}
        title="Yedek Önizleme"
        size="sm"
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setPendingRestore(null)}
              disabled={busy}
            >
              Vazgeç
            </button>
            <button
              className="btn btn-primary"
              onClick={() => void confirmRestore()}
              disabled={busy}
            >
              {busy ? "Geri Yükleniyor…" : "Geri Yüklemeyi Başlat"}
            </button>
          </>
        }
      >
        {pendingRestore && (
          <div className="space-y-3 text-sm">
            <p>
              <strong>{pendingRestore.preview.books.length}</strong> kitap,{" "}
              <strong>{pendingRestore.preview.media.length}</strong> medya,{" "}
              <strong>{pendingRestore.preview.tags.length}</strong> etiket ve{" "}
              <strong>{pendingRestore.preview.activeLoans.length}</strong> aktif
              ödünç kaydı geri yüklenecek.
            </p>
            <p className="rounded-lg bg-secondary/10 p-3 text-secondary">
              Bu işlem mevcut tüm veriyi değiştirecek.
              {electron &&
                " Değişiklikten önce otomatik bir güvenlik yedeği alınacak."}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

function AboutSection({ initialFocus }: { initialFocus: boolean }) {
  const [version, setVersion] = useState("0.2.0");
  const [checking, setChecking] = useState(false);
  const [releaseUrl, setReleaseUrl] = useState("");
  const toast = useToast();

  useEffect(() => {
    void window.kutuphanem?.appInfo
      .get()
      .then((info) => setVersion(info.version));
  }, []);

  const check = async () => {
    if (!window.kutuphanem)
      return toast.show(
        "Güncelleme kontrolü yalnız masaüstü uygulamasında çalışır.",
        "info",
      );
    if (useSettings.getState().networkMode === "offline")
      return toast.show("Çevrimdışı mod açık.", "info");
    setChecking(true);
    const result = await window.kutuphanem.appInfo.checkUpdate();
    setChecking(false);
    if (!result.ok)
      return toast.show(
        result.error ?? "Güncelleme kontrol edilemedi.",
        "error",
      );
    if (result.latest && result.updateAvailable) {
      toast.show(`Yeni sürüm bulundu: ${result.latest}`, "info");
      setReleaseUrl(result.url ?? "");
    } else {
      setReleaseUrl("");
      toast.show("Kütüphanem güncel");
    }
  };

  return (
    <Section title="Hakkında">
      <div className="rounded-xl border border-border p-3 flex items-center gap-3">
        <Info size={18} className="text-primary-ink" />
        <div className="flex-1">
          <div className="font-medium">Kütüphanem {version}</div>
          <div className="text-xs text-muted">
            Veriler cihazınızda saklanır; ağ özellikleri yalnız isteğinizle
            çalışır.
          </div>
        </div>
        <button
          data-initial-focus={initialFocus || undefined}
          className="btn btn-outline"
          onClick={check}
          disabled={checking}
        >
          <RefreshCw size={14} className={checking ? "animate-spin" : ""} />{" "}
          Güncelleme denetle
        </button>
        {releaseUrl && (
          <button
            className="btn btn-ghost"
            onClick={() => window.kutuphanem?.appInfo.openExternal(releaseUrl)}
          >
            <ExternalLink size={14} /> Sürüm Sayfası
          </button>
        )}
      </div>
    </Section>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="label">{title}</div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex border border-border rounded-lg bg-surface overflow-hidden">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-sm ${value === o.value ? "bg-primary text-primary-foreground" : "hover:bg-surface2"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
