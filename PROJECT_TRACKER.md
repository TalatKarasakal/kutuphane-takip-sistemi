# 📋 Proje ve Geliştirme Takibi

> Bu dosya projenin kısa kontrol paneli ve iş sırasıdır. Ayrıntı için yalnızca ilgili kaydın bağlantılı belgesini okuyun.

## 0. 📊 Durum Paneli

| Alan | Durum |
|---|---|
| Son güncelleme | 2026-08-14 |
| Sıradaki iş | ISS-001 için Developer ID/notarization ve Windows imza anahtarlarıyla dış doğrulama |
| Açık sorun | 13 |
| P0 / P1 / P2 | 3 / 8 / 2 |
| Önerilen çözüm | 12 |
| Kontrol bekleyen çözüm | 29 |
| Geliştirme fikri | 30 |
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
- **Paketlenen uygulama ilk kez açılabiliyor.** Önceki yapıların tamamı (kurulu sürüm dâhil) açılışta SIGTRAP ile ölüyordu; nedenleri ASCII olmayan paket adı ve ad-hoc imzada kitaplık doğrulaması olarak bulundu. Artık paketin içindeki adlar ASCII, klasör adı ve görünen ad Türkçe: `/Applications/Kütüphanem.app`.
- macOS Universal `.app` ve DMG; `codesign --verify --deep --strict`, Universal mimari, koyu/açık Dock simgeleri ve pakette yinelenen `node_modules` bulunmaması doğrulandı.
- Özgün logo korunarak uygulama simgesi macOS 26 ızgarasına oturtuldu: saydam zeminli logo katmanı, Apple'ın kendi köşe yuvarlaklığı, kenar boşluğu ve gölgesiyle koyu ve açık zeminli iki 1024×1024 ana görsele basıldı; ICNS ve ICO bunlardan üretildi.
- Ekleme ve ayarlar butonları açılır menü kazandı; fotoğraftan ekleme ile içe/dışa aktarma ana yüzeyden kaldırılıp bu menülere taşındı, komut paletinden de erişilebilir bırakıldı.
- Fotoğraftan ekleme kitapların yanı sıra film ve dizilerde de çalışıyor; künye modelden gelir ve gözden geçirme tablosunda onaylanır.
- Fotoğraftan ekleme bulut yerine bu bilgisayardaki bir modelle de çalışabiliyor; yerel sağlayıcı çevrimdışı modda da kullanılabiliyor ve yalnız loopback adreslerine bağlanıyor.
- Algılama arka planda sürüyor: diyalog kapatılınca iş devam ediyor, üst çubuktaki gösterge işi izliyor ve sonuç hazır olunca gözden geçirme listesine dönülüyor.
- Arama kenar çubuğunun tepesine, uygulama kimliği üst çubuğa alındı; yüzey kademeleri (zemin/panel/yüzey) ayrıştırıldı ve CSP'nin engellediği barkod worker'ı açıldı.
- Arayüz renkleri kişisel tasarım paletine (Petrol/Turkuaz/Bordo/Elektrik Mavi/Nötr/Kemik) taşındı; vurgu rengi seçimi kaldırıldı, durum renkleri korunup palete oturtuldu.
- Yerel model artık raf fotoğraflarını okuyabiliyor: istek bağlamı büyütüldü, düşünme adımı kapatıldı ve yanıt iki alandan da çözümleniyor; önceden yalnız tek kitabın karşıdan çekildiği kare çalışıyordu. Aynı anda birden çok fotoğraf sıraya alınıp sırayla işlenebiliyor.
- Bütün ekranlar Electron'da açık/koyu tema ve dar pencerede tarandı; konsol hatası yok. Kart başlıklarını örten onay kutusu, koyu temada açık kalan tarayıcı denetimleri ve iki satıra taşan durum rozetleri düzeltildi.
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
- **IMP-021/022/023 — Fotoğraftan medya ekleme, menüye taşınan ikincil eylemler ve macOS simgesi**
  - **Uygulayan:** Claude `[Model: Claude Opus 5]`
  - **Commitler:** `adb3bd5`, `4ce468a`, `123ffce`.
  - **Doğrulama:** Prettier, typecheck, ESLint, 24 unit/component testi, 3 Electron E2E senaryosu ve build başarılı. Üst çubuk menüleri tarayıcı önizlemesinde tıklanarak, üretilen ICNS 256 px'te görsel olarak doğrulandı.
  - **Bilinen sınır:** macOS'un simgeyi görünüme göre kendi değiştirmesi (`.icon` görünüm özelleştirmesi) `actool` 26.6 ile elle yazılan belgede uygulanmıyor; bu yüzden koyu/açık geçişi Dock simgesi çalışma anında değiştirilerek sağlanıyor. Finder ve Launchpad koyu zeminli sabit simgeyi gösterir.
  - **Kullanıcı kontrolü:** Filmler/Diziler bölümünde ekleme menüsünden "Fotoğraftan … Ekle" ile bir afiş fotoğrafı deneyin; ayarlar menüsünden içe/dışa aktarmayı açın; sistem görünümünü koyudan açığa alıp Dock simgesinin zemininin beyazladığını kontrol edin.
- **IMP-024 — Yerel yapay zekâ sağlayıcısı**
  - **Uygulayan:** Claude `[Model: Claude Opus 5]`
  - **Commitler:** `76e6671`.
  - **Doğrulama:** 32 unit/component testi (loopback sınırı ve sağlayıcı hazırlığı dâhil), typecheck, ESLint, build başarılı. Gerçek Electron uygulamasında yerel model uçtan uca denendi: model listeleme `qwen3.5:9b` için `vision: true` döndürdü, makine dışı adres reddedildi, model seçilmemiş durum hata verdi ve çevrimdışı modda üç afişlik bir görselden yönetmen, tür, yıl ve süre alanları doğru dolduruldu (62,7 s).
  - **Bilinen sınır:** Yerel model bulut kadar hızlı değil; ilk çalıştırma model belleğe yüklenirken dakikalar sürebiliyor, istek 240 saniyede zaman aşımına uğruyor.
  - **Kullanıcı kontrolü:** Ayarlar → Yapay Zekâ'da "Bu bilgisayar"ı seçip "Modelleri Getir" ile modelinizi seçin, ardından bir afiş fotoğrafıyla fotoğraftan eklemeyi deneyin. Çevrimdışı modu açıkken de çalıştığını doğrulayın.
- **IMP-025 — Arka planda çalışan fotoğraf algılaması**
  - **Uygulayan:** Claude `[Model: Claude Opus 5]`
  - **Commitler:** `89a2795`.
  - **Doğrulama:** 37 unit/component testi (diyalog kapalıyken biten iş, bırakılan işin geç sonucu, mükerrer işaretleme dâhil), typecheck, ESLint, build ve 3 Electron E2E senaryosu başarılı. Gerçek uygulamada yerel modelle uçtan uca denendi: iş başlatıldı, diyalog kapatıldı, gösterge göründü, iş sürerken yeni film eklenebildi, 147 saniye sonra "sonuç hazır" göstergesine tıklanıp üç kayıt gözden geçirilerek eklendi.
  - **Kullanıcı kontrolü:** Bir fotoğraf seçtikten sonra "Arka Planda Sürdür" ile pencereyi kapatıp uygulamayı kullanmaya devam edin; sağ üstteki gösterge işi izlemeli ve bitince gözden geçirme listesini geri getirmelidir.
- **IMP-026 — Arayüz gözden geçirmesi**
  - **Uygulayan:** Claude `[Model: Claude Opus 5]`
  - **Commitler:** `bdcafe5`.
  - **Doğrulama:** Electron'da 25 ekran görüntüsüyle tarama (kitap/film/dizi, tablo ve kart, detay, formlar, ödünç, içe/dışa aktarma, ayarların üç bölümü, komut paleti, fotoğraftan ekleme, açık/koyu tema, 1024 px dar pencere); konsol hatası yok. 38 unit/component testi, 3 Electron E2E, typecheck, ESLint ve build başarılı. Kart başlığının onay kutusuyla örtüşmediği ve seçimin kartı açmadığı testle korunuyor.
  - **Kullanıcı kontrolü:** Kart görünümünde başlıkların tamamının okunduğunu, koyu temada tarih seçici ve açılır listelerin koyu göründüğünü, tabloda durum rozetlerinin tek satırda kaldığını kontrol edin.
- **IMP-027 — Paketlemenin çalışır hâle getirilmesi**
  - **Uygulayan:** Claude `[Model: Claude Opus 5]`
  - **Commitler:** `237f545` (macOS), Windows paketleme aynı seride.
  - **Doğrulama:** macOS Universal `.app` ve DMG üretildi, açılışı ve `codesign --verify --deep --strict` doğrulandı. Windows NSIS kurulumu macOS üzerinde üretildi; `.exe` kaynakları (ProductName, CompanyName, FileVersion, 7 boyutlu simge) ve `app.asar` içeriği doğrulandı.
  - **Bilinen sınır:** DMG içindeki paket ASCII adla kalır (DMG adımı yeniden adlandırmayı kaldırmıyor); sürükleyip bıraktıktan sonra Finder'da yeniden adlandırmak ya da `scripts/install-mac.sh` kullanmak gerekir. Windows kurulumu gerçek bir Windows makinesinde çalıştırılarak denenmedi; yalnız üretilen dosyanın içeriği doğrulandı. Developer ID/notarization ve Windows kod imzası hâlâ anahtar bekliyor.
  - **Kullanıcı kontrolü:** DMG'den kurup uygulamanın açıldığını ve Dock'ta "Kütüphanem" yazdığını; Windows'ta kurulumun tamamlandığını, kısayolun "Kütüphanem" adıyla ve yeni simgeyle göründüğünü kontrol edin.
- **IMP-028 — Yerel modelin raf fotoğraflarını okuması ve fotoğraf sırası**
  - **Uygulayan:** Claude `[Model: Claude Opus 5]`
  - **Commitler:** çalışma ağacında.
  - **Doğrulama:** 46 unit/component testi (bağlam büyütme, `think` yeteneğine göre gönderim, `thinking` alanından çözümleme, sıra birikimi, fotoğraflar arası mükerrer, düşen fotoğrafın sırayı durdurmaması dâhil), typecheck, ESLint, Prettier ve build başarılı. `electron/ai.cjs` gerçek Ollama ve `~/Documents/Kütüphane` altındaki gerçek fotoğraflarla uçtan uca çalıştırıldı: düzeltmeden önce raf fotoğraflarının tamamı boş yanıt döndürüyordu, sonrasında denenen 9 fotoğrafın 9'u okundu. Ölçüt konulan dört fotoğrafta 37 kitaptan 34'ü doğru, uydurma yok. Sıra akışı tarayıcıda üç fotoğrafla sürülüp doğrulandı: ilerleme çubuğu, kaynak dosya adları, fotoğraflar arası mükerrer işareti ve toplu ekleme sayacı çalışıyor; konsol hatası yok.
  - **Model karşılaştırması:** `qwen3-vl:8b` kurulup aynı ölçütte denendi ve kullanıcının kurulu `qwen3.5:9b` modelinden geride kaldı (Türkçe karakterlerde ve kapsamda). Model değiştirilmedi; `qwen3.5:9b` öneri olarak kalıyor.
  - **Bilinen sınır:** Yerel modelde her fotoğraf yaklaşık 30–100 saniye sürüyor, sıra bu süreleri toplar. OCR hataları (harf sapmaları) sürüyor; gözden geçirme tablosu bunun için var.
  - **Kullanıcı kontrolü:** Fotoğraftan ekleme penceresinden birden çok raf fotoğrafı seçip sıranın ilerlediğini, sonuçların tek listede toplandığını ve satırlarda kaynak fotoğraf adının göründüğünü kontrol edin.
- **IMP-029 — Kişisel palete geçiş ve arayüz cilası**
  - **Uygulayan:** Claude `[Model: Claude Opus 5]`
  - **Commitler:** çalışma ağacında.
  - **Doğrulama:** `tracker:check`, Prettier, typecheck, ESLint, 46 unit/component testi, 3 Electron E2E ve build başarılı. Tarayıcı önizlemesinde 12 kitaplık veriyle açık ve koyu tema, tablo ve kart görünümü, durum filtresi seçili/seçisiz hâli ve ayarlar penceresi kontrol edildi; renk sınıflarının ürettiği değerler hesaplanmış stilden okunarak doğrulandı. Arayüzde Tailwind'in hazır renk adlarından hiçbiri kalmadı.
  - **Bilinen sınır:** Palet A'nın vurgu rolleri bilinçli olarak ters çevrildi ve kontrast için iki kademe sapması yapıldı (bkz. IMP-029 kaydı). Renk körlüğü için durum ayrımı yalnız renge değil, rozetlerdeki simgeye de dayanıyor; ayrıca bir kontrast denetimi (otomatik) kurulmadı.
  - **Kullanıcı kontrolü:** Açık ve koyu temada kitap listesini, kart görünümünü ve kenar çubuğunu gözden geçirin; durum renklerinin (turkuaz/mavi/kemik/bordo) ayırt edilebilir olduğunu ve Ayarlar'da vurgu rengi seçiminin kalkmış olduğunu doğrulayın.
- **IMP-030 — CSP worker engeli, geniş ekran tablosu ve renk ayrımı**
  - **Uygulayan:** Claude `[Model: Claude Opus 5]`
  - **Commitler:** çalışma ağacında.
  - **Doğrulama:** `tracker:check`, Prettier, typecheck, ESLint, 46 unit/component testi, 3 Electron E2E ve build başarılı. CSP düzeltmesi tarayıcıda blob'dan worker açılarak doğrulandı (önce engelleniyordu, sonra çalıştı). Sütun genişlikleri 1500 px pencerede ölçülerek karşılaştırıldı. Arama/kimlik yer değişimi ile yüzey kademeleri açık ve koyu temada gözden geçirildi.
  - **Bilinen sınır:** Satır eylem sütunu, üzerine gelince çıkan "→ Okundu ✓" düğmesi için ~95 px ayırmayı sürdürüyor; bu alan boş değil, düğmenin kendisi için gerekli. Barkod taramasının uçtan uca çalıştığı kamerayla denenmedi; yalnız engelin kalktığı doğrulandı.
  - **Kullanıcı kontrolü:** Kitap ekleme formunda ISBN alanındaki barkod taramasını kamerayla deneyin. Geniş pencerede tablo sütunlarının uzun başlıkları daha iyi taşıdığını, kenar çubuğunun gövdesi ile içindeki kutuların ayrıştığını kontrol edin.
- **ISS-001 dış bağımlılık notu:** Ad-hoc macOS imzası ve paket yapısı doğrulandı. Gerçek Developer ID/notarization ile Windows imza doğrulaması anahtar bekliyor.

Bir kayıt buraya taşınırken şu bilgiler zorunludur:

- Kimlik ve başlık
- Uygulayan kişi/agent ve model
- Commit kimliği
- Çalıştırılan doğrulamalar ve sonuçları
- Kullanıcının kontrol etmesi gereken kısa senaryo

---

## 5. 🚀 Geliştirme Önerileri

27 geliştirme fikri öncelik ve model etiketleriyle [IMPROVEMENTS.md](docs/project-tracker/IMPROVEMENTS.md) içinde tutulur. Bunların 21'i uygulanmış ve kontrol bekliyor, 3'ü yeni önerilmiş (IMP-018, IMP-019, IMP-020), 3'ü kullanıcı kararıyla reddedilmiştir.

---

## 6. 🚫 Reddedilen Öneriler

- **IMP-001 — Kitap durum modelini iki eksene ayır:** Kullanıcı mevcut durum modelini korumayı seçti. Karar: 2026-08-08.
- **IMP-006 — Okuma takibi ve istatistikler:** Kullanıcı bu kapsamın eklenmemesini istedi. Karar: 2026-08-08.
- **IMP-015 — Çoklu dil ve yerelleştirme:** Kullanıcı i18n katmanına gerek olmadığını belirtti. Karar: 2026-08-08.

Reddedilen kayıtlar gerekçesi ve karar tarihiyle [PROJECT_HISTORY.md](PROJECT_HISTORY.md) içine arşivlenir.
