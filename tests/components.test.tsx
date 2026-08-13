import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
vi.mock("../src/lib/artwork", () => ({
  useArtwork: () => ({ url: "blob:cached-cover", loading: false }),
}));
import { Modal } from "../src/components/ui/Modal";
import { BookFormDialog } from "../src/components/books/BookFormDialog";
import { BookCard } from "../src/components/books/BookCard";
import { Sidebar } from "../src/components/layout/Sidebar";
import { Topbar } from "../src/components/layout/Topbar";
import { SettingsDialog } from "../src/components/settings/SettingsDialog";
import { ImportDialog } from "../src/components/import/ImportDialog";
import { useBooks } from "../src/store/booksStore";
import { useLoans } from "../src/store/loansStore";
import { useTags } from "../src/store/tagsStore";
import { useSettings } from "../src/store/settingsStore";
import { DEFAULT_SETTINGS } from "../src/types/book";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  useBooks.setState({
    books: [],
    statusFilter: [],
    genreFilter: [],
    tagFilter: [],
    groupByTags: false,
    duplicatesOnly: false,
    loansOnly: false,
    selectedIds: new Set(),
  });
  useLoans.setState({ loans: [] });
  useTags.setState({ tags: [] });
  useSettings.setState({ ...DEFAULT_SETTINGS });
});

describe("forms and overlays", () => {
  it("keeps an async book form open and shows the save failure", async () => {
    const onClose = vi.fn();
    render(
      <BookFormDialog
        open
        onClose={onClose}
        onSave={vi.fn().mockRejectedValue(new Error("Disk dolu"))}
      />,
    );
    await userEvent.type(screen.getByLabelText("Başlık *"), "Deneme");
    await userEvent.click(
      screen
        .getByRole("dialog")
        .querySelector<HTMLButtonElement>('button[form="book-form"]')!,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Disk dolu");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("warns before closing a dirty form", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const onClose = vi.fn();
    render(<BookFormDialog open onClose={onClose} onSave={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Başlık *"), "Değişiklik");
    await userEvent.click(screen.getByRole("button", { name: "Vazgeç" }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("links validation feedback to the invalid field", async () => {
    render(<BookFormDialog open onClose={() => undefined} onSave={vi.fn()} />);
    await userEvent.click(
      screen
        .getByRole("dialog")
        .querySelector<HTMLButtonElement>('button[form="book-form"]')!,
    );
    const title = screen.getByLabelText("Başlık *");
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAccessibleDescription("Başlık zorunludur.");
    await waitFor(() => expect(title).toHaveFocus());
  });

  it("exposes an accessible modal and removes it from the DOM when closed", async () => {
    const { container, rerender } = render(
      <Modal open onClose={() => undefined} title="Test">
        <button>İşlem</button>
        <input data-initial-focus aria-label="İlk alan" />
      </Modal>,
    );
    expect(screen.getByRole("dialog", { name: "Test" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(await axe(container)).toHaveNoViolations();
    await waitFor(() =>
      expect(screen.getByLabelText("İlk alan")).toHaveFocus(),
    );
    rerender(
      <Modal open={false} onClose={() => undefined} title="Test">
        <button>İşlem</button>
        <input data-initial-focus aria-label="İlk alan" />
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("conditional and optional UI", () => {
  it("shows the loan section only while an active loan exists", () => {
    useBooks.setState({
      books: [
        {
          id: "b1",
          title: "Kitap",
          author: "Yazar",
          status: "mevcut",
          addedAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
    });
    const { rerender } = render(<Sidebar />);
    expect(screen.queryByText("Ödünç Verilenler")).not.toBeInTheDocument();
    act(() =>
      useLoans.setState({
        loans: [{ bookId: "b1", borrower: "Kişi", loanedAt: "2026-08-08" }],
      }),
    );
    rerender(<Sidebar />);
    expect(screen.getByText("Ödünç Verilenler")).toBeInTheDocument();
    act(() => useLoans.setState({ loans: [] }));
    rerender(<Sidebar />);
    expect(screen.queryByText("Ödünç Verilenler")).not.toBeInTheDocument();
  });

  it("offers optional tag grouping from the sidebar", async () => {
    useTags.setState({
      tags: [
        {
          id: "tag-1",
          name: "Favori",
          color: "#ef4444",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    render(<Sidebar />);
    const grouping = screen.getByRole("button", {
      name: "Etikete göre grupla",
    });
    expect(grouping).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(grouping);
    expect(grouping).toHaveAttribute("aria-pressed", "true");
    expect(useBooks.getState().groupByTags).toBe(true);
  });

  it("keeps classic visuals by default and lets settings enable enriched mode", async () => {
    render(<SettingsDialog open onClose={() => undefined} />);
    expect(useSettings.getState().visualMode).toBe("classic");
    fireEvent.click(screen.getByRole("button", { name: "Zengin" }));
    await waitFor(() =>
      expect(useSettings.getState().visualMode).toBe("enriched"),
    );
  });

  it("shows cached book covers only in enriched mode", async () => {
    const book = {
      id: "b1",
      title: "Kapaklı Kitap",
      author: "Yazar",
      status: "mevcut" as const,
      coverUrl: "https://example.com/cover.jpg",
      addedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    render(
      <BookCard
        book={book}
        onClick={() => undefined}
        selected={false}
        onToggleSelect={() => undefined}
      />,
    );
    expect(screen.queryByRole("img", { name: /Kapaklı Kitap/ })).toBeNull();
    act(() => useSettings.getState().set("visualMode", "enriched"));
    expect(
      await screen.findByRole("img", { name: /Kapaklı Kitap/ }),
    ).toBeInTheDocument();
  });

  it("keeps photo import and file transfer out of the topbar surface", async () => {
    const handlers = {
      onAdd: vi.fn(),
      onImport: vi.fn(),
      onExport: vi.fn(),
      onSettings: vi.fn(),
      onPhotoImport: vi.fn(),
    };
    render(
      <Topbar section="movies" onSection={() => undefined} {...handlers} />,
    );

    expect(screen.queryByText("Fotoğraftan Film Ekle")).not.toBeInTheDocument();
    expect(screen.queryByText("İçe Aktar")).not.toBeInTheDocument();
    expect(screen.queryByText("Dışa Aktar")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Film Ekle seçenekleri" }),
    );
    await userEvent.click(
      screen.getByRole("menuitem", { name: "Fotoğraftan Film Ekle" }),
    );
    expect(handlers.onPhotoImport).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Ayarlar" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "İçe Aktar" }));
    expect(handlers.onImport).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole("button", { name: "Ayarlar" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Dışa Aktar" }));
    expect(handlers.onExport).toHaveBeenCalledOnce();
  });

  it("reports invalid import rows without hiding valid rows", async () => {
    render(<ImportDialog open onClose={() => undefined} section="books" />);
    const input = document.querySelector<HTMLInputElement>(
      'input[type="file"][accept*=".csv"]',
    )!;
    await userEvent.upload(
      input,
      new File(
        ["Başlık,Yazar\nGeçerli Kitap,Yazar\n,Yazarı Var"],
        "kitaplar.csv",
        { type: "text/csv" },
      ),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Önizle" }),
    );
    expect(screen.getByText("1 geçerli")).toBeInTheDocument();
    expect(screen.getByText("1 hatalı")).toBeInTheDocument();
    expect(screen.getByText(/Satır 3: Başlık zorunludur/)).toBeInTheDocument();
  });
});
