import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const detectBooksFromImage = vi.fn();
const detectMediaFromImage = vi.fn();
vi.mock("../src/lib/ai/detectBooks", () => ({ detectBooksFromImage }));
vi.mock("../src/lib/ai/detectMedia", () => ({ detectMediaFromImage }));

const { usePhotoImport } = await import("../src/store/photoImportStore");
const { useToast } = await import("../src/store/toastStore");
const { useBooks } = await import("../src/store/booksStore");

const file = () => new File(["x"], "raf.jpg", { type: "image/jpeg" });

/** Sonucu testin istediği anda veren, elle çözülen bir söz. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

beforeEach(() => {
  usePhotoImport.getState().reset();
  usePhotoImport.setState({ open: false, section: "books" });
  useToast.setState({ toasts: [] });
  useBooks.setState({ books: [] });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("arka planda fotoğraf algılama", () => {
  it("diyalog kapatılsa da işi sürdürür ve bitince işaret bırakır", async () => {
    const job = deferred<{
      ok: true;
      books: { title: string; author: string }[];
    }>();
    detectBooksFromImage.mockReturnValue(job.promise);

    const running = usePhotoImport.getState().start(file(), "books");
    expect(usePhotoImport.getState().step).toBe("detecting");
    expect(usePhotoImport.getState().fileName).toBe("raf.jpg");

    // Kullanıcı diyaloğu kapatıp uygulamayı kullanmaya devam ediyor.
    usePhotoImport.getState().closeDialog();
    job.resolve({
      ok: true,
      books: [{ title: "Kürk Mantolu Madonna", author: "Sabahattin Ali" }],
    });
    await running;

    const state = usePhotoImport.getState();
    expect(state.step).toBe("review");
    expect(state.bookRows).toHaveLength(1);
    expect(state.unseen).toBe(true);
    expect(useToast.getState().toasts[0]?.message).toContain("1 kayıt bulundu");
  });

  it("diyalog açıkken işaret bırakmaz ve bildirim göstermez", async () => {
    detectBooksFromImage.mockResolvedValue({
      ok: true,
      books: [{ title: "Tutunamayanlar", author: "Oğuz Atay" }],
    });
    usePhotoImport.setState({ open: true });

    await usePhotoImport.getState().start(file(), "books");

    expect(usePhotoImport.getState().step).toBe("review");
    expect(usePhotoImport.getState().unseen).toBe(false);
    expect(useToast.getState().toasts).toHaveLength(0);
  });

  it("bırakılan işin geç gelen sonucunu yazmaz", async () => {
    const abandoned = deferred<{
      ok: true;
      books: { title: string; author: string }[];
    }>();
    detectBooksFromImage.mockReturnValue(abandoned.promise);

    const running = usePhotoImport.getState().start(file(), "books");
    usePhotoImport.getState().reset();
    abandoned.resolve({
      ok: true,
      books: [{ title: "Geç Gelen", author: "Yazar" }],
    });
    await running;

    expect(usePhotoImport.getState().step).toBe("pick");
    expect(usePhotoImport.getState().bookRows).toHaveLength(0);
  });

  it("film işini kendi bölümüyle çalıştırır ve hatayı bildirir", async () => {
    detectMediaFromImage.mockResolvedValue({
      ok: false,
      error: "Model yanıt vermedi.",
    });

    await usePhotoImport.getState().start(file(), "movies");

    expect(detectMediaFromImage).toHaveBeenCalledWith(expect.any(File), "film");
    const state = usePhotoImport.getState();
    expect(state.step).toBe("pick");
    expect(state.error).toBe("Model yanıt vermedi.");
    expect(state.unseen).toBe(true);
    expect(useToast.getState().toasts[0]?.type).toBe("error");
  });

  it("listede zaten olan kaydı işaretler ve seçili getirmez", async () => {
    useBooks.setState({
      books: [
        {
          id: "b1",
          title: "Tutunamayanlar",
          author: "Oğuz Atay",
          status: "mevcut",
          addedAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    detectBooksFromImage.mockResolvedValue({
      ok: true,
      books: [{ title: "Tutunamayanlar", author: "Oğuz Atay" }],
    });

    await usePhotoImport.getState().start(file(), "books");

    const [row] = usePhotoImport.getState().bookRows;
    expect(row.duplicate).toBe(true);
    expect(row.include).toBe(false);
  });
});
