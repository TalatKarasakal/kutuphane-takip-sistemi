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
import { Modal } from "../src/components/ui/Modal";
import { BookFormDialog } from "../src/components/books/BookFormDialog";
import { Sidebar } from "../src/components/layout/Sidebar";
import { SettingsDialog } from "../src/components/settings/SettingsDialog";
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

  it("keeps classic visuals by default and lets settings enable enriched mode", async () => {
    render(<SettingsDialog open onClose={() => undefined} />);
    expect(useSettings.getState().visualMode).toBe("classic");
    fireEvent.click(screen.getByRole("button", { name: "Zengin" }));
    await waitFor(() =>
      expect(useSettings.getState().visualMode).toBe("enriched"),
    );
  });
});
