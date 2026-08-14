import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const detectBooksFromImage = vi.fn();
const detectMediaFromImage = vi.fn();
vi.mock("../src/lib/ai/detectBooks", () => ({ detectBooksFromImage }));
vi.mock("../src/lib/ai/detectMedia", () => ({ detectMediaFromImage }));

const { usePhotoImport } = await import("../src/store/photoImportStore");
const { useToast } = await import("../src/store/toastStore");
const { useBooks } = await import("../src/store/booksStore");

const file = (name = "raf.jpg") =>
  new File(["x"], name, { type: "image/jpeg" });

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

    const running = usePhotoImport.getState().start([file()], "books");
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

    await usePhotoImport.getState().start([file()], "books");

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

    const running = usePhotoImport.getState().start([file()], "books");
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

    await usePhotoImport.getState().start([file()], "movies");

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

    await usePhotoImport.getState().start([file()], "books");

    const [row] = usePhotoImport.getState().bookRows;
    expect(row.duplicate).toBe(true);
    expect(row.include).toBe(false);
  });
});

describe("fotoğraf sırası", () => {
  it("fotoğrafları sırayla işler ve sonuçları tek listede toplar", async () => {
    detectBooksFromImage
      .mockResolvedValueOnce({
        ok: true,
        books: [{ title: "Devlet", author: "Platon" }],
      })
      .mockResolvedValueOnce({
        ok: true,
        books: [{ title: "Hamlet", author: "Shakespeare" }],
      });

    await usePhotoImport
      .getState()
      .start([file("raf1.jpg"), file("raf2.jpg")], "books");

    const state = usePhotoImport.getState();
    expect(detectBooksFromImage).toHaveBeenCalledTimes(2);
    expect(state.step).toBe("review");
    expect(state.queueTotal).toBe(2);
    expect(state.queueDone).toBe(2);
    expect(state.bookRows.map((r) => r.title)).toEqual(["Devlet", "Hamlet"]);
    expect(state.bookRows.map((r) => r.source)).toEqual([
      "raf1.jpg",
      "raf2.jpg",
    ]);
  });

  it("iki fotoğrafta çıkan aynı kitabı ikinci kez mükerrer işaretler", async () => {
    detectBooksFromImage.mockResolvedValue({
      ok: true,
      books: [{ title: "Devlet", author: "Platon" }],
    });

    await usePhotoImport
      .getState()
      .start([file("raf1.jpg"), file("raf2.jpg")], "books");

    const rows = usePhotoImport.getState().bookRows;
    expect(rows).toHaveLength(2);
    expect(rows[0].duplicate).toBe(false);
    expect(rows[0].include).toBe(true);
    expect(rows[1].duplicate).toBe(true);
    expect(rows[1].include).toBe(false);
  });

  it("bir fotoğraf düşse de kalanları işler ve düşeni uyarı olarak bildirir", async () => {
    detectBooksFromImage
      .mockResolvedValueOnce({ ok: false, error: "Model yanıt vermedi." })
      .mockResolvedValueOnce({
        ok: true,
        books: [{ title: "Hamlet", author: "Shakespeare" }],
      });

    await usePhotoImport
      .getState()
      .start([file("bozuk.jpg"), file("raf2.jpg")], "books");

    const state = usePhotoImport.getState();
    expect(state.step).toBe("review");
    expect(state.bookRows.map((r) => r.title)).toEqual(["Hamlet"]);
    expect(state.error).toBe("");
    expect(state.notice).toContain("1 fotoğraf işlenemedi");
    expect(state.notice).toContain("bozuk.jpg");
  });

  it("hiçbir fotoğraf işlenemezse hatayı gösterir ve seçime döner", async () => {
    detectBooksFromImage.mockResolvedValue({
      ok: false,
      error: "Model yanıt vermedi.",
    });

    await usePhotoImport
      .getState()
      .start([file("a.jpg"), file("b.jpg")], "books");

    const state = usePhotoImport.getState();
    expect(state.step).toBe("pick");
    expect(state.notice).toBe("");
    expect(state.error).toContain("a.jpg");
    expect(state.error).toContain("b.jpg");
  });

  it("sıra ortasında bırakılan işin kalan fotoğraflarını işlemez", async () => {
    const first = deferred<{
      ok: true;
      books: { title: string; author: string }[];
    }>();
    detectBooksFromImage.mockReturnValueOnce(first.promise).mockResolvedValue({
      ok: true,
      books: [{ title: "İşlenmemeli", author: "Yazar" }],
    });

    const running = usePhotoImport
      .getState()
      .start([file("a.jpg"), file("b.jpg")], "books");
    usePhotoImport.getState().reset();
    first.resolve({ ok: true, books: [{ title: "Devlet", author: "Platon" }] });
    await running;

    expect(detectBooksFromImage).toHaveBeenCalledTimes(1);
    expect(usePhotoImport.getState().step).toBe("pick");
    expect(usePhotoImport.getState().bookRows).toHaveLength(0);
  });
});
