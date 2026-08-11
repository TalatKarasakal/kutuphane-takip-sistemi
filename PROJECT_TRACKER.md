# 📋 Proje ve Geliştirme Takibi

> Bu dosya projenin kısa kontrol paneli ve iş sırasıdır. Ayrıntı için yalnızca ilgili kaydın bağlantılı belgesini okuyun.

## 0. 📊 Durum Paneli

| Alan | Durum |
|---|---|
| Son güncelleme | 2026-08-11 |
| Sıradaki iş | ISS-001 için Developer ID/notarization ve Windows imza anahtarlarıyla dış doğrulama |
| Açık sorun | 13 |
| P0 / P1 / P2 | 3 / 8 / 2 |
| Önerilen çözüm | 12 |
| Kontrol bekleyen çözüm | 26 |
| Geliştirme fikri | 17 |
| Reddedilen öneri | 3 |

### Ayrıntı Belgeleri

- [Aktif sorunlar, kabul kriterleri ve doğrulama adımları](docs/project-tracker/ISSUES.md)
- [Sorunlara önerilen çözümler](docs/project-tracker/SOLUTIONS.md)
- [Ürün ve mimari geliştirme fikirleri](docs/project-tracker/IMPROVEMENTS.md)
- [Tamamlanan/reddedilen kayıt geçmişi](PROJECT_HISTORY.md)

### Son İnceleme Özeti

- `tracker:check`, Prettier, typecheck, ESLint, 23 unit/component testi, 3 Electron E2E senaryosu, build ve npm audit başarılı.
- Ana JavaScript chunk'ı **392,90 KB**; barkod (**477,93 KB**) ve xlsx (**493,28 KB**) başlangıçtan ayrıldı.
- 10.000 kayıt fixture'ında filtre/sıralama 300 ms hedefinin altında; sanallaştırılmış listeler DOM'u 200 öğenin altında tutuyor.
- macOS Universal `.app` 490 MB, DMG 211 MB; `codesign --verify --deep --strict`, Universal mimari, yeni koyu zeminli ikon/Plist, varsayılan açık DMG arka planı ve pakette yinelenen `node_modules` bulunmaması doğrulandı.
- Özgün logo korunarak yalnız uygulama simgesinin dış zemini koyulaştırıldı; 1024×1024 PNG, macOS ICNS ve Windows ICO üretildi, 64 px okunabilirliği ile paketlenen ICNS dosyasının kaynakla aynı olduğu doğrulandı.
- Tarayıcı ve Electron kontrollerinde kitap/medya CRUD, boş yazarın `Bilinmiyor` olması, mükerrer birleştirme, ödünç/iade, komut paleti ve yedek geri yükleme doğrulandı.
- Gerçek Developer ID/notarization ve Windows imzası, imza anahtarları bekleyen tek dış doğrulama olarak açık.

---

## 📌 Agent ve Geliştirici Çalışma Kuralları

1. **Önce bu kısa dosyayı okuyun.** Ayrıntı belgesini yalnızca ele alınacak kimlik için açın; bütün takip belgelerini her görevde baştan sona okumayın.
2. **Kimlikleri koruyun.** Sorunlar `ISS-NNN`, çözümler `SOL-NNN`, geliştirme fikirleri `IMP-NNN` biçimindedir. Bir kimliği yeniden kullanmayın.
3. **Öneriyi etiketleyin.** Her çözüm ve geliştirme fikrinde `[Model: ...]` etiketi bulunmalıdır.
4. **Sorun kaydı zorunlu alanları:** öncelik, önem, durum, sorumlu, oluşturma/son güncelleme tarihi, bağımlılıklar, kabul kriterleri ve doğrulama adımları.
5. **İş bitince:** ilgili backlog kutusunu işaretleyin; kaydı “Kontrol Edilecek Çözümler” bölümüne taşıyın ve commit/doğrulama bilgilerini yazın.
6. **Kullanıcı onaylayınca:** kaydı aktif belgelerden kaldırıp [PROJECT_HISTORY.md](PROJECT_HISTORY.md) içine taşıyın.
7. **Reddedilince:** gerekçesiyle “Reddedilen Öneriler” bölümüne ve geçmiş belgesine ekleyin.
8. **Sayaçları güncelleyin.** Durum paneli, backlog ve ayrıntı belgeleri aynı değişiklikte güncellenmelidir.
9. **Commit öncesi:** `npm run tracker:check` çalıştırılmalıdır.
10. Kullanıcı “Sıradaki sorunu çöz” dediğinde durum panelindeki sıradaki açık iş ele alınır.

---

## 1. 📝 Yapılacaklar

### P0 — Yayın Öncesi Zorunlu

- [ ] **ISS-001:** macOS paketleme, ikon, imzalama ve notarization akışını düzelt.
- [ ] **ISS-002:** Yedek geri yüklemeye şema doğrulaması ve güvenli geri dönüş ekle.
- [ ] **ISS-008:** Electron ve doğrudan üretim bağımlılıklarındaki güvenlik açıklarını gider.

### P1 — Veri Güvenilirliği ve Temel Kalite

- [ ] **ISS-003:** Kalıcı kayıt işlemlerinde `await`, yükleniyor durumu ve hata geri bildirimi kullan.
- [ ] **ISS-004:** İçe aktarmadaki yanlış durum varsayımlarını ve eşleme sorunlarını düzelt.
- [ ] **ISS-005:** Modal açıkken arka planda çalışan global kısayolları engelle.
- [ ] **ISS-006:** Modal, drawer, tablo ve bildirim erişilebilirliğini düzelt.
- [ ] **ISS-007:** Film/dizi filtrelerini ayır ve Türkçe medya aramasını düzelt.
- [ ] **ISS-009:** Electron güvenliğini ve gizli anahtar saklamayı güçlendir.
- [ ] **ISS-011:** Form, dosya ve IPC girdilerine doğrulama/boyut sınırları ekle.
- [ ] **ISS-013:** Gizlilik açıklamasını gerçek ağ trafiğine göre güncelle.

### P2 — Performans ve Sürdürülebilirlik

- [ ] **ISS-010:** Paket/bundle boyutlarını küçült; kullanılmayan bağımlılıkları kaldır.
- [ ] **ISS-012:** Test, lint ve CI altyapısı kur.

---

## 2. 🐛 Sorunlar ve Hatalar

| Kimlik | Öncelik | Önem | Durum | Sorumlu | Başlık | Çözüm |
|---|---|---|---|---|---|---|
| ISS-001 | P0 | Kritik | Dış doğrulama bekliyor | Codex | macOS paket/imza/ikon hatası | SOL-001 |
| ISS-002 | P0 | Kritik | Kontrol bekliyor | Codex | Yedek şeması doğrulanmıyor | SOL-002, SOL-010 |
| ISS-003 | P1 | Yüksek | Kontrol bekliyor | Codex | Async kayıt hatalarında form kapanıyor | SOL-003, SOL-012 |
| ISS-004 | P1 | Yüksek | Kontrol bekliyor | Codex | İçe aktarma yanlış varsayımlar yapıyor | SOL-004, SOL-010 |
| ISS-005 | P1 | Yüksek | Kontrol bekliyor | Codex | Modal açıkken kısayollar arka planı değiştiriyor | SOL-005 |
| ISS-006 | P1 | Orta/Yüksek | Kontrol bekliyor | Codex | Erişilebilirlik eksikleri | SOL-005 |
| ISS-007 | P1 | Orta | Kontrol bekliyor | Codex | Ortak medya filtresi ve Türkçe arama hatası | SOL-006 |
| ISS-008 | P0 | Kritik/Yüksek | Kontrol bekliyor | Codex | Bağımlılık güvenlik uyarıları | SOL-001, SOL-007 |
| ISS-009 | P1 | Yüksek | Kontrol bekliyor | Codex | Electron ve gizli anahtar güvenliği | SOL-008, SOL-012 |
| ISS-010 | P2 | Orta | Kontrol bekliyor | Codex | Büyük bundle ve masaüstü paketi | SOL-001, SOL-009 |
| ISS-011 | P1 | Orta | Kontrol bekliyor | Codex | Girdi ve dosya sınırları eksik | SOL-004, SOL-010 |
| ISS-012 | P2 | Orta | Kontrol bekliyor | Codex | Test, lint ve CI yok | SOL-007, SOL-012 |
| ISS-013 | P1 | Orta | Kontrol bekliyor | Codex | Gizlilik metni ağ trafiğini açıklamıyor | SOL-011 |

Tüm bulgular ve kabul kriterleri: [ISSUES.md](docs/project-tracker/ISSUES.md)

---

## 3. 💡 Sorunlara Çözüm Önerileri

12 önerinin tamamı model etiketi ve ilgili sorun bağlantılarıyla [SOLUTIONS.md](docs/project-tracker/SOLUTIONS.md) içinde tutulur.

---

## 4. 🧪 Kontrol Edilecek Çözümler

- **SOL-001–SOL-012 — Kapsamlı sorun çözüm paketi**
  - **Uygulayan:** Codex `[Model: GPT-5 Codex]`
  - **Commitler:** `5fab877`, `0a104b1`, `79e3f39`, `409c917`, `f26f768`, `616181e`, `8822f79`, `5be79cc`, `db1e8ce`, `f0c0d9a`, `b1aa2f1`, `fcbf62c`, `65a8f71`, `3654247`, `7a4d09d`.
  - **Doğrulama:** format, typecheck, lint, 23 unit/component testi, 3 Electron E2E, build, audit, koyu zeminli PNG/ICNS/ICO, varsayılan açık DMG görünümü ve macOS Universal paket smoke kontrolleri başarılı.
  - **Kullanıcı kontrolü:** Ayarlar/yedek, import/mükerrer, form hata/dirty, klavye-overlay, Türkçe filtre, güvenli anahtar ve çevrimdışı mod akışlarını kontrol edin.
- **IMP-002/003/004/005/007/008/009/010/011/012/013/014/016/017 — Seçilen geliştirmeler**
  - **Uygulayan:** Codex `[Model: GPT-5 Codex]`
  - **Commitler:** `79e3f39`, `f26f768`, `616181e`, `8822f79`, `5be79cc`, `db1e8ce`, `f0c0d9a`, `b1aa2f1`, `fcbf62c`, `65a8f71`.
  - **Doğrulama:** puan/etiket, aktif ödünç, ISBN/barkod, klasik-zengin görünüm, sanallaştırma, komut paleti, tema ve dağıtım senaryoları otomatik veya manuel olarak doğrulandı.
  - **Kullanıcı kontrolü:** Klasik görünümün varsayılan kalmasını, Zengin görünüm geçişini ve ödünç bölümünün yalnız aktif kayıt varken görünmesini kontrol edin.
- **ISS-001 dış bağımlılık notu:** Ad-hoc macOS imzası ve paket yapısı doğrulandı. Gerçek Developer ID/notarization ile Windows imza doğrulaması anahtar bekliyor.

Bir kayıt buraya taşınırken şu bilgiler zorunludur:

- Kimlik ve başlık
- Uygulayan kişi/agent ve model
- Commit kimliği
- Çalıştırılan doğrulamalar ve sonuçları
- Kullanıcının kontrol etmesi gereken kısa senaryo

---

## 5. 🚀 Geliştirme Önerileri

17 geliştirme fikri öncelik ve model etiketleriyle [IMPROVEMENTS.md](docs/project-tracker/IMPROVEMENTS.md) içinde tutulur. Bunların 14'ü uygulanmış ve kontrol bekliyor, 3'ü kullanıcı kararıyla reddedilmiştir.

---

## 6. 🚫 Reddedilen Öneriler

- **IMP-001 — Kitap durum modelini iki eksene ayır:** Kullanıcı mevcut durum modelini korumayı seçti. Karar: 2026-08-08.
- **IMP-006 — Okuma takibi ve istatistikler:** Kullanıcı bu kapsamın eklenmemesini istedi. Karar: 2026-08-08.
- **IMP-015 — Çoklu dil ve yerelleştirme:** Kullanıcı i18n katmanına gerek olmadığını belirtti. Karar: 2026-08-08.

Reddedilen kayıtlar gerekçesi ve karar tarihiyle [PROJECT_HISTORY.md](PROJECT_HISTORY.md) içine arşivlenir.
