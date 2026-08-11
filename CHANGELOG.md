# Değişiklik Günlüğü

Bu proje [Semantic Versioning](https://semver.org/) kullanır.

## 0.2.0 — 2026-08-08

### Eklendi

- Puanlama, ortak renkli etiketler, aktif ödünç takibi ve alan bazlı mükerrer birleştirme.
- Sürümlü yedek formatı, son 20 yedek geçmişi, önizleme ve güvenlik yedekli geri yükleme.
- Kullanıcı tetiklemeli ISBN/barkod araması, isteğe bağlı güvenli kapak/poster önbelleği ve klasik/zengin görünüm seçimi.
- Komut paleti, sanallaştırılmış koleksiyon listeleri ve erişilebilir modal/drawer altyapısı.
- Vitest, React Testing Library, axe, Playwright/Electron, ESLint, Prettier ve GitHub Actions kalite kapıları.
- Universal macOS DMG, Windows x64 NSIS ve Linux x64 AppImage/deb paket hedefleri.

### Değişti

- Gemini anahtarı tarayıcı depolamasından Electron `safeStorage` alanına taşındı.
- İçe aktarma, manuel form, fotoğraf, ISBN ve yedek akışları ortak doğrulama kurallarını kullanıyor.
- Film ve dizi filtre durumları ayrıldı; Türkçe arama davranışı ortaklaştırıldı.
- Harici font istekleri kaldırıldı; font dosyaları uygulama içinde paketleniyor.

### Güvenlik

- CSP, IPC sender/argüman/boyut doğrulaması, dış bağlantı allowlist'i ve özel ağ adreslerini engelleyen HTTPS görsel indirme katmanı eklendi.
- CSV formül hücreleri kaçırılıyor; toplu IndexedDB yazımları atomik transaction içinde çalışıyor.

### Bilinen dış bağımlılık

- Developer ID/notarization ve Windows Authenticode doğrulaması, gerçek imza sertifikaları sağlandığında etkinleştirilecek.
