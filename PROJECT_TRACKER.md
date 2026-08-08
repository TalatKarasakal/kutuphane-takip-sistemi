# 📋 Proje ve Geliştirme Takibi

> Bu dosya projenin kısa kontrol paneli ve iş sırasıdır. Ayrıntı için yalnızca ilgili kaydın bağlantılı belgesini okuyun.

## 0. 📊 Durum Paneli

| Alan | Durum |
|---|---|
| Son güncelleme | 2026-08-08 |
| Sıradaki iş | [ISS-001](docs/project-tracker/ISSUES.md#iss-001--macos-paketi-doğrulanamıyor-ve-uygulama-ikonu-pakete-girmiyor) |
| Açık sorun | 13 |
| P0 / P1 / P2 | 3 / 8 / 2 |
| Önerilen çözüm | 12 |
| Kontrol bekleyen çözüm | 0 |
| Geliştirme fikri | 17 |
| Reddedilen öneri | 0 |

### Ayrıntı Belgeleri

- [Aktif sorunlar, kabul kriterleri ve doğrulama adımları](docs/project-tracker/ISSUES.md)
- [Sorunlara önerilen çözümler](docs/project-tracker/SOLUTIONS.md)
- [Ürün ve mimari geliştirme fikirleri](docs/project-tracker/IMPROVEMENTS.md)
- [Tamamlanan/reddedilen kayıt geçmişi](PROJECT_HISTORY.md)

### Son İnceleme Özeti

- `npm run typecheck` ve `npm run build` başarılı.
- Üretim JavaScript çıktısı **880,58 KB**; Vite kod bölme uyarısı veriyor.
- Arayüz 1360×860 ve Electron minimumu 1024×640 boyutlarında taşma olmadan açıldı; tarayıcı konsolunda hata görülmedi.
- Mevcut macOS `.app` çıktısı 348 MB, DMG 134 MB; kopyalanan `node_modules` yaklaşık 84 MB.
- İnceleme sorunları henüz uygulanmadı; tamamlanan kayıt yok.

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
| ISS-001 | P0 | Kritik | Açık | Atanmadı | macOS paket/imza/ikon hatası | SOL-001 |
| ISS-002 | P0 | Kritik | Açık | Atanmadı | Yedek şeması doğrulanmıyor | SOL-002, SOL-010 |
| ISS-003 | P1 | Yüksek | Açık | Atanmadı | Async kayıt hatalarında form kapanıyor | SOL-003, SOL-012 |
| ISS-004 | P1 | Yüksek | Açık | Atanmadı | İçe aktarma yanlış varsayımlar yapıyor | SOL-004, SOL-010 |
| ISS-005 | P1 | Yüksek | Açık | Atanmadı | Modal açıkken kısayollar arka planı değiştiriyor | SOL-005 |
| ISS-006 | P1 | Orta/Yüksek | Açık | Atanmadı | Erişilebilirlik eksikleri | SOL-005 |
| ISS-007 | P1 | Orta | Açık | Atanmadı | Ortak medya filtresi ve Türkçe arama hatası | SOL-006 |
| ISS-008 | P0 | Kritik/Yüksek | Açık | Atanmadı | Bağımlılık güvenlik uyarıları | SOL-001, SOL-007 |
| ISS-009 | P1 | Yüksek | Açık | Atanmadı | Electron ve gizli anahtar güvenliği | SOL-008, SOL-012 |
| ISS-010 | P2 | Orta | Açık | Atanmadı | Büyük bundle ve masaüstü paketi | SOL-001, SOL-009 |
| ISS-011 | P1 | Orta | Açık | Atanmadı | Girdi ve dosya sınırları eksik | SOL-004, SOL-010 |
| ISS-012 | P2 | Orta | Açık | Atanmadı | Test, lint ve CI yok | SOL-007, SOL-012 |
| ISS-013 | P1 | Orta | Açık | Atanmadı | Gizlilik metni ağ trafiğini açıklamıyor | SOL-011 |

Tüm bulgular ve kabul kriterleri: [ISSUES.md](docs/project-tracker/ISSUES.md)

---

## 3. 💡 Sorunlara Çözüm Önerileri

12 önerinin tamamı model etiketi ve ilgili sorun bağlantılarıyla [SOLUTIONS.md](docs/project-tracker/SOLUTIONS.md) içinde tutulur.

---

## 4. 🧪 Kontrol Edilecek Çözümler

- *(Henüz onay bekleyen çözüm bulunmuyor.)*

Bir kayıt buraya taşınırken şu bilgiler zorunludur:

- Kimlik ve başlık
- Uygulayan kişi/agent ve model
- Commit kimliği
- Çalıştırılan doğrulamalar ve sonuçları
- Kullanıcının kontrol etmesi gereken kısa senaryo

---

## 5. 🚀 Geliştirme Önerileri

12 geliştirme fikri öncelik ve model etiketleriyle [IMPROVEMENTS.md](docs/project-tracker/IMPROVEMENTS.md) içinde tutulur. Bu bölüm yalnızca kullanıcı açıkça geliştirme tavsiyesi istediğinde güncellenir.

---

## 6. 🚫 Reddedilen Öneriler

- *(Henüz reddedilen öneri bulunmuyor.)*

Reddedilen kayıtlar gerekçesi ve karar tarihiyle [PROJECT_HISTORY.md](PROJECT_HISTORY.md) içine arşivlenir.
