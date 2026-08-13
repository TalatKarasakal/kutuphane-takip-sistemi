import {
  test,
  expect,
  _electron as electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import { mkdir } from "node:fs/promises";

let app: ElectronApplication;
let page: Page;

// Playwright hooks require fixture-object destructuring even when no browser fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(async ({}, testInfo) => {
  const userData = testInfo.outputPath("user-data");
  await mkdir(userData, { recursive: true });
  app = await electron.launch({
    args: ["."],
    env: { ...process.env, KUTUPHANEM_E2E_USER_DATA: userData },
  });
  page = await app.firstWindow();
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByText("Henüz kitap yok")).toBeVisible();
});

test.afterEach(async () => {
  await app?.close();
});

/** İçe/dışa aktarma ve ayarlar artık dişli butonun menüsünde. */
async function openSettingsMenuItem(name: string) {
  await page.getByTitle("Ayarlar", { exact: true }).click();
  await page.getByRole("menuitem", { name, exact: true }).click();
}

async function addBook(title: string, author = "") {
  await page.getByRole("button", { name: "Kitap Ekle", exact: true }).click();
  await page.getByLabel("Başlık *").fill(title);
  if (author) await page.getByLabel("Yazar").fill(author);
  await page.locator('button[form="book-form"]').click();
  await expect(
    page.getByRole("row", { name: new RegExp(title) }),
  ).toBeVisible();
}

test("book CRUD, active loan lifecycle and command palette", async () => {
  test.setTimeout(60_000);
  await page.getByRole("button", { name: "Kitap Ekle", exact: true }).click();
  await page.getByLabel("Başlık *").fill("Korunan taslak");
  await page.getByRole("button", { name: "Vazgeç" }).focus();
  await page.keyboard.press("2");
  await expect(page.getByRole("dialog", { name: "Yeni Kitap" })).toBeVisible();
  await expect(page.getByLabel("Başlık *")).toHaveValue("Korunan taslak");
  page.once("dialog", (dialog) => dialog.accept());
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Yeni Kitap" })).toHaveCount(0);
  await page.keyboard.press("2");
  await expect(page.getByTitle("Film Ekle", { exact: true })).toBeVisible();
  await page.keyboard.press("1");
  await expect(page.getByTitle("Kitap Ekle", { exact: true })).toBeVisible();

  await addBook("Uçtan Uca Kitap");
  await page.getByRole("row", { name: /Uçtan Uca Kitap/ }).click();
  await expect(
    page
      .getByRole("dialog", { name: "Uçtan Uca Kitap" })
      .getByText("Bilinmiyor"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Düzenle" }).click();
  await page.getByLabel("Notlar").fill("E2E düzenleme notu");
  await page.locator('button[form="book-form"]').click();
  await page.getByRole("row", { name: /Uçtan Uca Kitap/ }).click();
  await expect(page.getByText("E2E düzenleme notu")).toBeVisible();
  await page.getByRole("button", { name: "Ödünç Ver" }).click();
  await page.getByLabel("Ödünç alan kişi *").fill("Deneme Kişisi");
  await page
    .getByRole("button", { name: /Ödünç Verildi Olarak İşaretle/ })
    .click();
  await expect(page.getByText("Ödünç Verilenler")).toBeVisible();
  await page.getByRole("button", { name: "İade Al" }).click();
  await expect(page.getByText("Ödünç Verilenler")).toHaveCount(0);
  await page
    .getByRole("dialog", { name: "Uçtan Uca Kitap" })
    .getByRole("button", { name: "Kapat" })
    .click();

  await page.keyboard.press(
    process.platform === "darwin" ? "Meta+K" : "Control+K",
  );
  await page.getByPlaceholder("Kayıt veya komut ara…").fill("Filmlere geç");
  await expect(
    page.getByRole("option", { name: "Filmlere geç", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByTitle("Film Ekle", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Film Ekle", exact: true }).click();
  await page.getByLabel("Başlık *").fill("Uçtan Uca Film");
  await page.locator('button[form="media-form"]').click();
  await expect(page.getByRole("row", { name: /Uçtan Uca Film/ })).toBeVisible();
  await page.getByRole("row", { name: /Uçtan Uca Film/ }).click();
  await page.getByRole("button", { name: "Düzenle" }).click();
  await page.getByLabel("Notlar").fill("Film güncellendi");
  await page.locator('button[form="media-form"]').click();
  await page.getByRole("row", { name: /Uçtan Uca Film/ }).click();
  await expect(page.getByText("Film güncellendi")).toBeVisible();
  await page.getByRole("button", { name: "Sil" }).click();
  await expect(page.getByRole("row", { name: /Uçtan Uca Film/ })).toHaveCount(
    0,
  );

  await page.getByTitle("Kitaplar").click();
  await page.getByRole("row", { name: /Uçtan Uca Kitap/ }).click();
  await page.getByRole("button", { name: "Sil" }).click();
  await expect(page.getByRole("row", { name: /Uçtan Uca Kitap/ })).toHaveCount(
    0,
  );

  await page.keyboard.press(
    process.platform === "darwin" ? "Meta+K" : "Control+K",
  );
  await page
    .getByPlaceholder("Kayıt veya komut ara…")
    .fill("Hakkında ve güncelleme bilgisi");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Ayarlar" })).toBeVisible();
  await expect(page.getByText("Hakkında", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Güncelleme denetle" }),
  ).toBeFocused();
});

test("file import, duplicate merge and backup restore preview", async () => {
  await addBook("Mükerrer Kitap", "Yazar");
  await openSettingsMenuItem("İçe Aktar");
  await page.locator('input[type="file"][accept*=".csv"]').setInputFiles({
    name: "kitaplar.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "Başlık,Yazar,Durum,Etiketler\nMükerrer Kitap,Yazar,Mevcut,Favori\nİçe Aktarılan,Yazar,Okunacak,Araştırma",
    ),
  });
  await page.getByRole("button", { name: "Önizle" }).click();
  await expect(page.getByText("2 geçerli")).toBeVisible();
  await page.getByRole("button", { name: "İçe Aktar" }).click();
  await expect(page.getByText("Tekrar Edenler")).toBeVisible();
  await page.getByRole("button", { name: "Alan Seçerek Birleştir" }).click();
  await page.getByRole("button", { name: "Seçili Grubu Birleştir" }).click();
  await expect(page.getByText("Tekrar Edenler")).toHaveCount(0);
  await page.getByRole("button", { name: "Etikete göre grupla" }).click();
  await expect(
    page.locator("tbody").getByText("Araştırma", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Etikete göre grupla" }).click();

  await openSettingsMenuItem("Ayarları Aç");
  await page.getByRole("button", { name: "Şimdi Yedekle" }).click();
  await expect(page.getByText("Yedek geçmişi")).toBeVisible();
  await expect(page.getByText(/2 kitap · 0 medya/)).toBeVisible();
  await page.getByRole("button", { name: "Tamam" }).click();

  await addBook("Yedekten Sonra", "Yazar");
  await openSettingsMenuItem("Ayarları Aç");
  await page
    .getByRole("button", { name: "Geri Yükle", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "Yedek Önizleme" }),
  ).toContainText("2 kitap");
  await page.getByRole("button", { name: "Geri Yüklemeyi Başlat" }).click();
  await expect(page.getByText(/Geri yüklendi: 2 kitap/)).toBeVisible();
  await page.getByRole("button", { name: "Tamam" }).click();
  await expect(page.getByText("Yedekten Sonra")).toHaveCount(0);
});

test("virtualizes the 10,000-record library below the DOM limit", async () => {
  test.setTimeout(60_000);
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("kutuphanem");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("books", "readwrite");
      const store = transaction.objectStore("books");
      const now = "2026-08-11T00:00:00.000Z";
      for (let index = 0; index < 10_000; index += 1) {
        store.put({
          id: `fixture-${index}`,
          title: `Kitap ${String(index).padStart(5, "0")}`,
          author: index % 2 ? "İlker" : "Işık",
          status: index % 2 ? "okundu" : "mevcut",
          genre: `Tür ${index % 20}`,
          addedAt: now,
          updatedAt: now,
        });
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
  });
  await page.reload();
  await expect(page.getByText("10000 kitap", { exact: true })).toBeVisible();
  const renderedRows = await page
    .locator('tbody tr:not([aria-hidden="true"])')
    .count();
  expect(renderedRows).toBeLessThanOrEqual(200);
});
