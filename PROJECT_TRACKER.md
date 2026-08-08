# 📋 PROJE VE GELİŞTİRME TAKİP KILAVUZU (PROJECT_TRACKER.md)

> **Amaç:** Bu belge; geliştiricilerin ve Yapay Zekâ (YZ) Agent'larının proje durumunu, aktif sorunları, çözüm önerilerini, kontrol bekleyen işleri ve fikirleri ortak bir hafızada takip edebilmesi için hazırlanmıştır.

---

## 📌 Agent & Geliştirici Çalışma Kuralları

1. **Token Tasarrufu ve Belgeye Erişim:**
   - Bu belge her mesajda veya her proje taramasında baştan sona otomatik okunmamalıdır. Yalnızca kullanıcı talep ettiğinde veya ilgili bir takip işlemi yapılacağında okunmalı ve güncellenmelidir.
   - **Geliştirme Önerileri** bölümü otomatik olarak doldurulmamalıdır. Yalnızca kullanıcı açıkça *"Projeyi inceleyip geliştirme tavsiyelerinde bulun"* dediğinde analiz yapılıp not edilmelidir.

2. **YZ Model Etiketleme (Model Tagging):**
   - Agent'lar bir soruna çözüm önerisi eklediğinde hangi model olduğunu açıkça belirtmelidir: `[Model: Gemini 3.6 Flash]`, `[Model: Claude 3.5 Sonnet]`, `[Model: GPT-4o]` vb.
   - Amaç: Diğer YZ araçlarının veya geliştiricilerin öneriyi doğrudan kabul etmek yerine kendi değerlendirme süzgeçlerinden geçirmesini sağlamaktır.

3. **Tamamlanan İşlerin Kontrol ve Onay Akışı (Pending Verification):**
   - Agent bir sorunu çözdüğünde veya bir geliştirmeyi tamamladığında ilgili işi **"4. Kontrol Edilecek Çözümler"** bölümüne taşır.
   - Agent iş bitiminde kullanıcıya: *"İlgili çözümü tamamladım ve 'Kontrol Edilecek Çözümler' kısmına ekledim. Lütfen kontrol edip test edin, onaylarsanız belgeden kaldırayım."* mesajını iletir.
   - Kullanıcı çözümün doğru çalıştığını teyit ettiğinde ilgili kayıt belgeden kaldırılır.

4. **Reddedilen Önerilerin Takibi:**
   - Kullanıcı sunulan bir öneriyi veya çözümü reddederse, aynı fikirlerin gelecekte tekrar sunulmasını engellemek için **"6. Reddedilen Öneriler"** listesine eklenir.

5. **Soru ve Komutlara Yanıt Vermek:**
   - Kullanıcı belgenin durumunu sorduğunda (örneğin: *"Belgenin durumu nedir?"*, *"Ne var ne yok?"*), Agent doğrudan bu belgedeki aktif başlıkları özetler (yapılacaklar, devam eden sorunlar, onay bekleyen çözümler).
   - Kullanıcı *"Sıradaki sorunu çöz"* dediğinde Agent doğrudan bu belgeye bakarak işlem sırasındaki sorunu ele alır.

---

## 1. 📝 Yapılacaklar (Backlog & Notlar)
*Fikirler, ileride yapılmak istenen işler ve not defteri gibi tutulacak başlıklar.*

### P0 — Yayın öncesi zorunlu

- [ ] **ISS-001:** macOS paketleme, ikon, imzalama ve notarization akışını düzelt.
- [ ] **ISS-002:** Yedek geri yüklemeye şema doğrulaması ve güvenli geri dönüş ekle.
- [ ] **ISS-008:** Electron ve doğrudan üretim bağımlılıklarındaki güvenlik açıklarını gider.

### P1 — Veri güvenilirliği ve temel kalite

- [ ] **ISS-003:** Tüm kalıcı kayıt işlemlerinde `await`, yükleniyor durumu ve hata geri bildirimi kullan.
- [ ] **ISS-004:** İçe aktarmadaki yanlış durum varsayımlarını ve eşleme sorunlarını düzelt.
- [ ] **ISS-005 / ISS-006:** Modal, drawer, klavye ve erişilebilirlik sorunlarını birlikte ele al.
- [ ] **ISS-007:** Film/dizi filtre durumlarını ayır ve Türkçe medya aramasını düzelt.
- [ ] **ISS-009 / ISS-013:** Electron güvenlik sıkılaştırması, anahtar saklama ve gizlilik metnini güncelle.
- [ ] **ISS-011:** Form, dosya ve IPC girdilerine doğrulama/boyut sınırları ekle.

### P2 — Performans ve sürdürülebilirlik

- [ ] **ISS-010:** Paket/bundle boyutlarını küçült; kullanılmayan bağımlılıkları kaldır.
- [ ] **ISS-012:** Test, lint ve CI altyapısı kur.
- [ ] **IMP-001–IMP-012:** Onaylanan ürün geliştirmelerini sırayla planla.

### Son İnceleme Notu — 2026-08-08

- `npm run typecheck` ve `npm run build` başarılı.
- Üretim JavaScript çıktısı **880,58 KB**; Vite kod bölme uyarısı veriyor.
- Arayüz 1360×860 ve Electron minimumu 1024×640 boyutlarında taşma olmadan açıldı; tarayıcı konsolunda hata görülmedi.
- Mevcut macOS `.app` çıktısı 348 MB, DMG 134 MB; kopyalanan `node_modules` yaklaşık 84 MB.
- Bu incelemede kod değiştirilmedi; aşağıdaki maddeler henüz uygulanmadı.

---

## 2. 🐛 Sorunlar & Hatalar (Issues)
*Uygulama ile ilgili tespit edilen aktif sorunlar ve bug'lar.*

### ISS-001 — macOS paketi doğrulanamıyor ve uygulama ikonu pakete girmiyor

- **Önem:** Kritik
- **Durum:** Açık
- `pack:mac`, electron-builder yerine özel `scripts/build-mac.mjs` betiğini çalıştırdığı için `afterPack` imzalama adımı devreye girmiyor.
- Mevcut paket `codesign --verify --deep --strict` kontrolünde `code has no resources but signature indicates they must be present` hatası veriyor.
- Özel betik `build/icon.icns` veya `build/icon.png` dosyasını uygulamaya kopyalamıyor. Paket içindeki `CFBundleIconFile` hâlâ `electron.icns` değerinde.
- `electron/main.cjs` paket içinde bulunmayan `build/icon.png` yolunu kullanıyor.
- Windows çıktısı da `signAndEditExecutable: false` nedeniyle imzasız.

### ISS-002 — Yedek geri yükleme şeması doğrulanmıyor

- **Önem:** Kritik
- **Durum:** Açık
- `parseSnapshot`, JSON dizilerini alan türlerini ve izin verilen durum değerlerini kontrol etmeden `Book[]`/`Media[]` kabul ediyor.
- Geçersiz `status`, `genre`, tarih veya sayısal alanlar UI çökmesine ya da bozuk veriye neden olabilir.
- Dosya sürümü okunuyor ancak desteklenmeyen gelecek sürümleri reddetmek için kullanılmıyor.
- Geri yükleme öncesindeki güvenlik yedeğinde `createBackup()` sonucundaki `ok` alanı kontrol edilmiyor; yedek alınamasa da geri yükleme devam ediyor.
- Yedek dosyası ve kayıt sayısı için üst sınır yok.

### ISS-003 — Asenkron kayıt hatalarında formlar kapanıyor ve veri girişi kayboluyor

- **Önem:** Yüksek
- **Durum:** Açık
- Kitap ve medya formlarında `onSave` dönüş tipi `void`; gerçekte verilen async fonksiyon beklenmeden modal kapatılıyor.
- IndexedDB yazımı başarısız olursa kullanıcı hata mesajı görmeden form verisini kaybedebilir.
- İlk veritabanı yükleme, toplu işlemler, içe aktarma ve bazı yedekleme akışlarında ortak hata yönetimi yok.
- Uygulama seviyesinde error boundary bulunmuyor.

### ISS-004 — İçe aktarmada bilinmeyen durumlar yanlışlıkla tamamlanmış sayılıyor

- **Önem:** Yüksek
- **Durum:** Açık
- Tanınmayan kitap durumunun varsayılanı ilk seçenek olan **Okundu**, medya durumunun varsayılanı **İzlendi** oluyor.
- Yalnızca boşluk içeren başlık/yazar alanları geçerli kabul edilebiliyor.
- Aynı hedef alana birden fazla kaynak sütun eşlenebiliyor; son sütun önceki veriyi sessizce eziyor.
- Sıfır geçerli satır varken içe aktarma düğmesi devre dışı kalmıyor.
- Başlık satırı ilk satır değilse hata raporundaki satır numarası gerçek dosya satırıyla uyuşmuyor.
- Dosya okuma/ayrıştırma hataları kullanıcı dostu bir hata durumuna çevrilmiyor.

### ISS-005 — Modal açıkken global klavye kısayolları arka planı değiştiriyor

- **Önem:** Yüksek
- **Durum:** Açık
- Tarayıcı testinde Ayarlar açıkken `2` tuşu arka planda Filmler bölümüne geçti.
- `/` kısayolu odağı modalın arkasındaki arama alanına taşıdı.
- Form açıkken bölüm değiştirme, `n` ve `/` kısayolları formun sıfırlanmasına veya odak kaybına yol açabilir.

### ISS-006 — Modal, drawer, tablo ve bildirim erişilebilirliği eksik

- **Önem:** Orta/Yüksek
- **Durum:** Açık
- Modal için `role="dialog"`, `aria-modal`, başlık bağlantısı, odak kilidi ve odağı açan elemana geri döndürme yok.
- Kapalı drawer bileşenleri DOM ve erişilebilirlik ağacında kalıyor.
- Doğrulama hataları `aria-invalid`/`aria-describedby` ile alanlara bağlanmıyor ve ilk hatalı alana odak geçmiyor.
- Tablo satırları ayrıntı açmak için yalnızca fareyle kullanılabiliyor.
- Tablo seçim kutularının erişilebilir adları; toast alanının `aria-live` tanımı ve toast kapatma düğmesinin etiketi yok.
- Sütun sıralama düğmeleri yalnızca hover durumunda görünür olduğundan klavye kullanıcıları için sorunlu.

### ISS-007 — Film/dizi filtreleri ortak ve medya araması Türkçe karakterlerde hatalı

- **Önem:** Orta
- **Durum:** Açık
- Film ve dizi aynı `search`, `statusFilter` ve `genreFilter` durumunu paylaşıyor.
- Yalnızca filmlerde bulunan bir tür filtresi Diziler'e geçildiğinde görünmeyen aktif filtre olarak kalıp listeyi boşaltabiliyor.
- Medya araması `toLowerCase()` kullanıyor; `İ/ı` içeren Türkçe başlıklarda eşleşme kaçırabilir. Kitap aramasında kullanılan `toLocaleLowerCase('tr')` davranışıyla tutarsız.

### ISS-008 — Güncel bağımlılık güvenlik uyarıları bulunuyor

- **Önem:** Kritik/Yüksek
- **Durum:** Açık
- `npm audit --omit=dev`: doğrudan üretim bağımlılığı `nanoid@5.1.9` için 1 yüksek seviye uyarı. Uygulamadaki mevcut `nanoid()` kullanımı sorunlu boyut parametresini almıyor olsa da bağımlılık güncellenmeli.
- Paketlenen `electron@41.2.1` için birden fazla yüksek/orta seviye güvenlik uyarısı var.
- Tüm bağımlılık zincirinde 1 kritik, 20 yüksek, 1 orta ve 2 düşük uyarı raporlandı. Önemli kısmı eski `electron-builder@25.1.8`, `tar`, Vite ve PostCSS zincirinden geliyor.

### ISS-009 — Electron ve gizli anahtar güvenliği sıkılaştırılmalı

- **Önem:** Yüksek
- **Durum:** Açık
- `index.html` içinde Content Security Policy bulunmuyor.
- `setWindowOpenHandler`, protokol veya domain allowlist'i olmadan gelen URL'yi `shell.openExternal` ile açıyor.
- Gemini API anahtarı Zustand persist üzerinden düz localStorage içinde tutuluyor.
- AI IPC çağrısında gönderen pencere, mime türü ve payload boyutu doğrulanmıyor.
- `backup.write`, `backup.read` ve AI IPC kanallarında savunma amaçlı boyut/tip sınırları eksik.
- `backup.read` API'si arayüzde kullanılmadığı hâlde renderer'a açılıyor.

### ISS-010 — Başlangıç paketi ve masaüstü dağıtımı gereğinden büyük

- **Önem:** Orta
- **Durum:** Açık
- Üretim JavaScript dosyası 880,58 KB; `xlsx` ve içe/dışa aktarma ekranları başlangıç paketine dâhil.
- Özel macOS betiği üretim bağımlılıklarını ham olarak uygulamaya kopyalıyor; renderer bağımlılıklarının çoğu zaten Vite bundle içinde.
- `date-fns` ve `dexie-react-hooks` kaynak kodda kullanılmıyor.
- `electron/entitlements.plist` içindeki debugger, DYLD environment, unsigned executable memory ve library validation kapatma yetkileri fazla geniş; şu an özel macOS akışında kullanılmıyor olsa da ileride etkinleştirilirse daraltılmalı.

### ISS-011 — Form, dosya ve dışa aktarma girdilerinde sınırlar eksik

- **Önem:** Orta
- **Durum:** Açık
- Sayfa, yayın yılı, süre, sezon ve izlenme yılı alanlarında `min`, `max` ve mantıksal doğrulama yok.
- Okuma bitiş tarihi başlangıçtan önce seçilebiliyor; ISBN biçimi doğrulanmıyor.
- Fotoğraf, JSON, CSV ve Excel dosyaları için dosya boyutu/kayıt sayısı sınırı yok; büyük dosyalar renderer'ı dondurabilir.
- CSV hücreleri dışa aktarılırken `=`, `+`, `-` veya `@` ile başlayan değerler spreadsheet formül enjeksiyonuna karşı temizlenmiyor.
- Manuel kitap formu yazarı zorunlu tutarken fotoğraftan ekleme boş yazara izin veriyor; veri kuralları tutarsız.

### ISS-012 — Otomatik test, lint ve CI bulunmuyor

- **Önem:** Orta
- **Durum:** Açık
- Projede unit, component veya E2E test dosyası yok.
- ESLint/Prettier yapılandırması ve CI iş akışı bulunmuyor.
- Filtreler, duplicate tespiti, import eşleme, yedek doğrulama ve Electron paketleme gibi kritik davranışlar regresyona açık.

### ISS-013 — Gizlilik açıklaması gerçek ağ trafiğini tam yansıtmıyor

- **Önem:** Orta
- **Durum:** Açık
- Uygulama Google Fonts'a her açılışta, kart görünümünde OpenLibrary kapak servisine istek gönderebiliyor.
- Fotoğraftan eklemede görsel Gemini'ye; bulunan kitap başlık/yazarları Google Books'a gönderiliyor.
- README yalnızca yerel saklama ve Gemini anahtarını açıklıyor; Google Fonts, OpenLibrary ve Google Books trafiği yeterince belirtilmiyor.

---

## 3. 💡 Sorunlara Çözüm Önerileri (Proposed Solutions)
*YZ Agent'ları tarafından sorunlar için sunulan çözüm fikirleri (Model adı zorunludur).*

### SOL-001 — Standart ve doğrulanabilir dağıtım hattı

- **İlgili:** ISS-001, ISS-008, ISS-010
- **Öneri:** `[Model: GPT-5 Codex]` macOS paketini electron-builder üzerinden üret; özel kopyalama betiğini kaldır veya yalnızca electron-builder öncesi/sonrası sınırlı görevlerde kullan. İkonu bundle içine koy, `CFBundleIconFile` değerini doğrula, bütün dosya değişikliklerinden sonra imzala. Genel dağıtım hedefleniyorsa hardened runtime, Developer ID ve notarization kullan. Windows için de code signing planla. CI'da paketi açıp `codesign --verify` ve temel başlatma smoke testi çalıştır.

### SOL-002 — Sürümlü ve doğrulanan yedek formatı

- **İlgili:** ISS-002
- **Öneri:** `[Model: GPT-5 Codex]` yedek verisini kaydetmeden önce ve geri yüklerken runtime şemasıyla doğrula. İzin verilen status/type değerlerini, zorunlu alanları, alan uzunluklarını ve sayısal sınırları kontrol et. Desteklenmeyen sürümü reddet veya açık migration çalıştır. Ön güvenlik yedeği `ok:false` dönerse geri yüklemeyi durdurup kullanıcıya net seçenek sun. Büyük dosya ve duplicate ID durumlarını işlem başlamadan raporla.

### SOL-003 — Ortak asenkron işlem ve hata yönetimi

- **İlgili:** ISS-003
- **Öneri:** `[Model: GPT-5 Codex]` form `onSave` sözleşmelerini `Promise<void>` yap; submit işlemini `await` et, işlem sırasında düğmeleri kilitle ve yalnızca başarıdan sonra modalı kapat. Store işlemlerinde ortak hata toast'ı ve gerekirse tekrar deneme kullan. İlk yükleme için loading/error ekranı, uygulama için error boundary ekle.

### SOL-004 — Güvenli içe aktarma doğrulaması

- **İlgili:** ISS-004, ISS-011
- **Öneri:** `[Model: GPT-5 Codex]` tanınmayan durumları otomatik olarak tamamlanmış yapma; güvenli varsayım seç veya kullanıcı eşlemesini zorunlu kıl. Hedef alan eşlemelerini benzersiz yap, alanları trim et, sıfır geçerli satırda işlemi engelle ve gerçek dosya satır numarasını göster. Dosya okuma/parsing hatalarını modal içinde raporla. İçe aktarmadan önce duplicate özetini sun.

### SOL-005 — Erişilebilir modal/drawer altyapısı

- **İlgili:** ISS-005, ISS-006
- **Öneri:** `[Model: GPT-5 Codex]` modal ve drawer'a doğru ARIA rolleri, başlık ilişkisi, focus trap, açan elemana focus return ve arka planı `inert` yapma desteği ekle. Kapalı drawer'ı render etme veya `aria-hidden` uygula. Herhangi bir overlay açıkken global bölüm/yeni kayıt/arama kısayollarını devre dışı bırak. Hata alanına odaklan ve doğrulama mesajlarını input'a bağla.

### SOL-006 — Film ve dizi görünüm durumlarını ayırma

- **İlgili:** ISS-007
- **Öneri:** `[Model: GPT-5 Codex]` film ve dizi için ayrı arama/genre/status filtre durumu tut veya bölüm değişiminde geçersiz filtreleri temizle. Aramada hem sorgu hem alanlar için `toLocaleLowerCase('tr')` kullan ve Türkçe karakter testleri ekle.

### SOL-007 — Bağımlılık güncelleme ve güvenlik politikası

- **İlgili:** ISS-008, ISS-012
- **Öneri:** `[Model: GPT-5 Codex]` önce patch/minor kapsamındaki `nanoid`, Electron ve PostCSS düzeltmelerini uygula; sonra electron-builder ve Vite major yükseltmelerini ayrı dallarda ele al. Her yükseltmeden sonra typecheck, build, import/export ve paket smoke testlerini çalıştır. CI'a düzenli audit ve bağımlılık güncelleme kontrolü ekle; audit sonuçlarını son kullanıcı runtime'ı ile yalnızca build zincirini etkileyenler olarak ayır.

### SOL-008 — Electron savunma katmanlarını güçlendirme

- **İlgili:** ISS-009
- **Öneri:** `[Model: GPT-5 Codex]` CSP ekle; `shell.openExternal` için yalnızca `https:` ve bilinen hostları kabul et. `will-navigate` ile uygulama dışı navigasyonu engelle. IPC sender'ını ana pencereyle doğrula; argüman şemaları ve boyut limitleri koy. Kullanılmayan preload/IPC metotlarını kaldır. Gemini anahtarını Electron `safeStorage` veya işletim sistemi anahtarlığında sakla.

### SOL-009 — Bundle ve paket boyutu optimizasyonu

- **İlgili:** ISS-010
- **Öneri:** `[Model: GPT-5 Codex]` import/export dialoglarını ve `xlsx` modülünü dynamic import ile lazy-load et. `date-fns` ve `dexie-react-hooks` bağımlılıklarını kaldır. Masaüstü paketinde renderer'ın zaten bundle edilmiş bağımlılıklarını tekrar kopyalama; electron-builder'ın ASAR ve production dependency analizini kullan. Değişiklik öncesi/sonrası JS, `.app` ve DMG boyutlarını CI çıktısında karşılaştır.

### SOL-010 — Tutarlı veri doğrulama katmanı

- **İlgili:** ISS-002, ISS-004, ISS-011
- **Öneri:** `[Model: GPT-5 Codex]` manuel form, fotoğraf, dosya importu ve yedek geri yüklemenin kullandığı tek bir normalizasyon/doğrulama modülü oluştur. Yazarın zorunlu mu opsiyonel mi olduğuna ürün kararı ver ve her akışta aynı kuralı uygula. Yıl, sayfa, süre, sezon, tarih ve ISBN kurallarını merkezi tut. CSV dışa aktarımında formül başlangıç karakterlerini güvenli biçimde kaçır.

### SOL-011 — Gizlilik ve çevrimdışı çalışma iyileştirmesi

- **İlgili:** ISS-013
- **Öneri:** `[Model: GPT-5 Codex]` README ve uygulama içi gizlilik açıklamasına Gemini, Google Books, OpenLibrary ve Google Fonts veri akışlarını ekle. Fontları uygulama içine göm veya sistem fontlarına dön. Kapak sorgusunu kullanıcı tercihi hâline getir; çevrimdışı modda üçüncü taraf isteklerini kapat.

### SOL-012 — Test ve kalite kapıları

- **İlgili:** ISS-003–ISS-012
- **Öneri:** `[Model: GPT-5 Codex]` Vitest ile filtre/import/yedek birim testleri, React Testing Library ile form/modal testleri ve Playwright/Electron ile temel kullanıcı akışları ekle. ESLint ve format kontrolünü kur. CI sırası: install → typecheck → lint → unit/component test → build → Electron smoke/package doğrulama → audit raporu.

---

## 4. 🧪 Kontrol Edilecek Çözümler (Pending Verification)
*Agent tarafından yapılmış ancak henüz geliştirici/kullanıcı tarafından test edilip onaylanmamış çözümler.*

- *(Henüz onay bekleyen çözüm bulunmuyor)*

---

## 5. 🚀 Geliştirme Önerileri (Improvement Suggestions)
*Sadece kullanıcı açıkça tavsiye istediğinde YZ Agent'ı tarafından proje okunarak buraya eklenen özellik/mimari tavsiyeleri.*

### IMP-001 — Kitap durum modelini iki eksene ayır

- **Öneri:** `[Model: GPT-5 Codex]` mevcut `mevcut/satın alınacak/okunacak/okundu` alanı sahiplik ve okuma durumunu karıştırıyor. `ownershipStatus` ve `readingStatus` alanlarını ayır; “okuyor” durumunu ve okuma ilerlemesini ekle.

### IMP-002 — Modelde bulunan puan ve etiket alanlarını tamamla

- **Öneri:** `[Model: GPT-5 Codex]` `Book.rating` ve `Book.tags` alanlarını form, liste, detay, filtre, import ve export akışlarına ekle. Yakın vadede kullanılmayacaksa ölü alan olarak kalmaması için modelden çıkar.

### IMP-003 — Uygulama içi yedek geçmişi

- **Öneri:** `[Model: GPT-5 Codex]` mevcut fakat UI'da kullanılmayan `backup.list`, `backup.read` ve `backup.lastInfo` yetenekleriyle tarih, boyut ve kayıt sayısı gösteren bir yedek geçmişi ekranı oluştur; seçilen yedeği önizleyerek geri yüklet. Özellik yapılmayacaksa kullanılmayan IPC yüzeyini kaldır.

### IMP-004 — ISBN/barkod ve çevrimiçi künye araması

- **Öneri:** `[Model: GPT-5 Codex]` barkod veya elle ISBN girildiğinde Google Books/OpenLibrary üzerinden kontrollü künye araması sun. Dış servise gönderilen veriyi kullanıcıya açıkça belirt ve sonuç eklenmeden önce önizleme göster.

### IMP-005 — Duplicate birleştirme merkezi

- **Öneri:** `[Model: GPT-5 Codex]` yalnızca tekrarları filtrelemek yerine iki kaydı karşılaştıran, alan bazında tercih yaptıran “birleştir” akışı ekle. Dosya ve fotoğraf importunda “atla / yeni ekle / mevcutla birleştir” seçenekleri sun.

### IMP-006 — Okuma takibi ve istatistikler

- **Öneri:** `[Model: GPT-5 Codex]` okuma yüzdesi/sayfası, başlangıç-bitiş geçmişi, yıllık hedef, aylık okunan sayfa/kitap ve tür dağılımı ekle. Film/dizi için izleme geçmişi ve yıllık özet düşünülebilir.

### IMP-007 — Ödünç verme takibi

- **Öneri:** `[Model: GPT-5 Codex]` kitap için ödünç verilen kişi, tarih, planlanan iade ve iade edildi durumu ekle; kişisel kütüphane kullanımında yüksek değer sağlar.

### IMP-008 — Büyük koleksiyon performansı

- **Öneri:** `[Model: GPT-5 Codex]` binlerce kayıt senaryosu için sanal listeleme veya sayfalama, IndexedDB indeksli sorgular ve parçalı import kullan. Önce gerçekçi 1.000/10.000 kayıt performans testi oluştur.

### IMP-009 — Görsel ve bilgi zenginleştirme

- **Öneri:** `[Model: GPT-5 Codex]` kitap detay drawer'ında kapağı göster; kartlarda kitap kapağını kırpmak yerine portre oranını koru. Film/dizi için isteğe bağlı poster alanı ekle; harici metadata servisi kullanılacaksa kullanıcı anahtarı ve gizlilik tercihi sun.

### IMP-010 — Dağıtım ve ürün bilgileri

- **Öneri:** `[Model: GPT-5 Codex]` Intel/Universal macOS, Windows imzalı kurulum ve yapılandırılmış Linux paket scripti ekle. Hakkında/sürüm ekranı, changelog ve isteğe bağlı güvenli güncelleme kontrolü oluştur.

### IMP-011 — Form deneyimi ve geri bildirim

- **Öneri:** `[Model: GPT-5 Codex]` form kirliyken backdrop/Escape ile çıkışta kaydedilmemiş değişiklik uyarısı göster. Toplu durum güncellemelerinde başarı toast'ı ekle; toplu silmede geri alma yanında isteğe bağlı doğrulama kullan. Kart görünümüne seçim affordance'ı ekle.

### IMP-012 — Çıkarılabilecek/sadeleştirilebilecek parçalar

- **Öneri:** `[Model: GPT-5 Codex]` kullanılmayan `date-fns` ve `dexie-react-hooks` bağımlılıklarını kaldır. Uygulanmayacaksa ölü `rating/tags` alanlarını ve kullanılmayan backup IPC metotlarını çıkar. Gerekli olmayan geniş macOS entitlement'larını sil; dış Google Fonts bağımlılığını kaldır veya yerel fontlarla değiştir.

---

## 6. 🚫 Reddedilen Öneriler (Rejected Suggestions)
*Kullanıcı tarafından reddedilen ve tekrar önerilmemesi gereken çözümler/özellikler.*

- *(Henüz reddedilen öneri bulunmuyor)*
