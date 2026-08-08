import { create } from "zustand";
import { db } from "../db/database";
import { normalizeActiveLoan, validationMessage } from "../lib/validation";
import type { ActiveLoan } from "../types/library";
import { useToast } from "./toastStore";

interface LoansState {
  loaded: boolean;
  loans: ActiveLoan[];
  load: () => Promise<void>;
  lend: (loan: ActiveLoan) => Promise<void>;
  returnBook: (bookId: string) => Promise<void>;
}

export const useLoans = create<LoansState>((set, get) => ({
  loaded: false,
  loans: [],
  load: async () => {
    try {
      set({ loans: await db.activeLoans.toArray(), loaded: true });
    } catch (error) {
      useToast
        .getState()
        .show(
          `Ödünç kayıtları yüklenemedi: ${validationMessage(error)}`,
          "error",
        );
      throw error;
    }
  },
  lend: async (input) => {
    const loan = normalizeActiveLoan(input);
    if (!(await db.books.get(loan.bookId)))
      throw new Error("Ödünç verilecek kitap bulunamadı.");
    try {
      await db.activeLoans.put(loan);
      set({
        loans: [
          ...get().loans.filter((item) => item.bookId !== loan.bookId),
          loan,
        ],
      });
      useToast.getState().show("Kitap ödünç verildi");
    } catch (error) {
      useToast
        .getState()
        .show(
          `Ödünç kaydı oluşturulamadı: ${validationMessage(error)}`,
          "error",
        );
      throw error;
    }
  },
  returnBook: async (bookId) => {
    try {
      await db.activeLoans.delete(bookId);
      set({ loans: get().loans.filter((loan) => loan.bookId !== bookId) });
      useToast.getState().show("Kitap iade alındı");
    } catch (error) {
      useToast
        .getState()
        .show(`İade kaydedilemedi: ${validationMessage(error)}`, "error");
      throw error;
    }
  },
}));
