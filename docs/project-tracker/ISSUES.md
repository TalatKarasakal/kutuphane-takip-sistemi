# Aktif Sorunlar

> Yalnızca üzerinde çalışılacak sorun bölümünü okuyun. İş akışı ve güncel sıra için [PROJECT_TRACKER.md](../../PROJECT_TRACKER.md) dosyasını kullanın.

## Kayıt Şablonu

Her sorun; öncelik, önem, durum, sorumlu, tarihler, bağımlılıklar, bulgular, kabul kriterleri ve doğrulama adımları içermelidir. Kabul kriterleri tamamlanmadan kayıt “Kontrol Edilecek” durumuna taşınmaz.

---

### ISS-001 — macOS paketi doğrulanamıyor ve uygulama ikonu pakete girmiyor

- **Öncelik:** P0
- **Önem:** Kritik
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-008 tamamlandıktan sonra son paket doğrulaması tekrarlanmalı.

#### Bulgular

- `pack:mac`, electron-builder yerine özel `scripts/build-mac.mjs` betiğini çalıştırdığı için `afterPack` imzalama adımı devreye girmiyor.
- Mevcut paket `codesign --verify --deep --strict` kontrolünde `code has no resources but signature indicates they must be present` hatası veriyor.
- Özel betik `build/icon.icns` veya `build/icon.png` dosyasını uygulamaya kopyalamıyor; `CFBundleIconFile` hâlâ `electron.icns`.
- `electron/main.cjs` paket içinde bulunmayan `build/icon.png` yolunu kullanıyor.
- Windows çıktısı da `signAndEditExecutable: false` nedeniyle imzasız.

#### Kabul Kriterleri

- [ ] macOS paketi tek, belgelenmiş ve tekrarlanabilir bir komutla üretiliyor.
- [ ] Finder, Dock ve pencere uygulamanın kendi ikonunu gösteriyor.
- [ ] `codesign --verify --deep --strict` hatasız tamamlanıyor.
- [ ] Genel dağıtım hedefleniyorsa Gatekeeper/notarization doğrulaması başarılı.
- [ ] Windows imzalama kararı ve yayın prosedürü belgelenmiş.

#### Doğrulama

- `npm run pack:mac`
- `codesign --verify --deep --strict --verbose=2 "release/mac-arm64/Kütüphanem.app"`
- `/usr/libexec/PlistBuddy -c "Print :CFBundleIconFile" "release/mac-arm64/Kütüphanem.app/Contents/Info.plist"`
- `spctl --assess --type execute --verbose=4 "release/mac-arm64/Kütüphanem.app"` *(notarized dağıtımda)*

---

### ISS-002 — Yedek geri yükleme şeması doğrulanmıyor

- **Öncelik:** P0
- **Önem:** Kritik
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-011 ile ortak doğrulama katmanı tercih edilmeli.

#### Bulgular

- `parseSnapshot`, JSON dizilerini alan türlerini ve izin verilen durum değerlerini kontrol etmeden `Book[]`/`Media[]` kabul ediyor.
- Geçersiz status, genre, tarih veya sayısal alanlar UI çökmesine ya da bozuk veriye neden olabilir.
- Dosya sürümü okunuyor ancak desteklenmeyen gelecek sürümleri reddetmek için kullanılmıyor.
- Güvenlik yedeğinde `createBackup()` sonucundaki `ok` alanı kontrol edilmiyor; yedek alınamasa da geri yükleme devam ediyor.
- Yedek dosyası ve kayıt sayısı için üst sınır yok.

#### Kabul Kriterleri

- [ ] Geçersiz alan tipi, status/type değeri, duplicate ID ve desteklenmeyen sürüm işlem başlamadan reddediliyor.
- [ ] Doğrulama hatası kullanıcıya kayıt/satır bağlamıyla gösteriliyor.
- [ ] Güvenlik yedeği başarısızsa mevcut veri kullanıcı onayı olmadan değiştirilmiyor.
- [ ] Başarısız geri yüklemede mevcut veritabanı olduğu gibi kalıyor.
- [ ] Dosya boyutu ve kayıt sayısı sınırları tanımlı ve testli.

#### Doğrulama

- `npm run typecheck`
- `npm run build`
- Geçerli, bozuk JSON, yanlış status, duplicate ID, gelecek şema sürümü ve başarısız güvenlik yedeği fixture'larıyla otomatik test.

---

### ISS-003 — Asenkron kayıt hatalarında formlar kapanıyor ve veri girişi kayboluyor

- **Öncelik:** P1
- **Önem:** Yüksek
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** Yok.

#### Bulgular

- Kitap ve medya formlarında `onSave` dönüş tipi `void`; async fonksiyon beklenmeden modal kapatılıyor.
- IndexedDB yazımı başarısız olursa kullanıcı hata mesajı görmeden form verisini kaybedebilir.
- İlk veritabanı yükleme, toplu işlemler, içe aktarma ve bazı yedekleme akışlarında ortak hata yönetimi yok.
- Uygulama seviyesinde error boundary bulunmuyor.

#### Kabul Kriterleri

- [ ] Formlar kaydetme Promise'i başarıyla tamamlanmadan kapanmıyor.
- [ ] İşlem sürerken çift gönderim engelleniyor ve görünür yükleniyor durumu gösteriliyor.
- [ ] Veritabanı hatasında form değerleri korunuyor ve kullanıcıya anlaşılır hata gösteriliyor.
- [ ] İlk yükleme için loading/error durumu, beklenmeyen render hataları için error boundary var.
- [ ] Toplu işlemler ve import/backup akışları aynı hata sözleşmesini kullanıyor.

#### Doğrulama

- `npm run typecheck`
- `npm run build`
- Başarılı kayıt, reddedilen Promise, çift tıklama ve ilk DB yükleme hatası senaryolarıyla component/integration testi.

---

### ISS-004 — İçe aktarmada bilinmeyen durumlar yanlışlıkla tamamlanmış sayılıyor

- **Öncelik:** P1
- **Önem:** Yüksek
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-011 ile ortak normalizasyon kuralları kullanılmalı.

#### Bulgular

- Tanınmayan kitap durumunun varsayılanı **Okundu**, medya durumunun varsayılanı **İzlendi** oluyor.
- Yalnızca boşluk içeren başlık/yazar alanları geçerli kabul edilebiliyor.
- Aynı hedef alana birden fazla kaynak sütun eşlenebiliyor; son sütun önceki veriyi sessizce eziyor.
- Sıfır geçerli satır varken içe aktarma düğmesi devre dışı kalmıyor.
- Başlık satırı ilk satır değilse hata satır numarası gerçek dosya satırıyla uyuşmuyor.
- Dosya okuma/ayrıştırma hataları kullanıcı dostu bir hata durumuna çevrilmiyor.

#### Kabul Kriterleri

- [ ] Bilinmeyen durum güvenli varsayıma düşüyor veya kullanıcı eşlemesi zorunlu oluyor.
- [ ] Zorunlu metinler trim ediliyor; boş kayıt içe alınmıyor.
- [ ] Bir hedef alan yalnızca bir kaynak sütuna eşlenebiliyor.
- [ ] Sıfır geçerli satırda import başlatılamıyor.
- [ ] Hata satırları dosyadaki gerçek satır numarasını gösteriyor.
- [ ] Parse hataları modal içinde açıklanıyor; uygulama hata diyaloğuna düşmüyor.

#### Doğrulama

- `npm run typecheck`
- Bilinmeyen durum, boşluk başlık, duplicate eşleme, farklı header satırı, sıfır geçerli kayıt ve bozuk dosya fixture'larıyla otomatik test.

---

### ISS-005 — Modal açıkken global klavye kısayolları arka planı değiştiriyor

- **Öncelik:** P1
- **Önem:** Yüksek
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-006 ile aynı overlay altyapısında çözülmeli.

#### Bulgular

- Tarayıcı testinde Ayarlar açıkken `2` tuşu arka planda Filmler bölümüne geçti.
- `/` kısayolu odağı modalın arkasındaki arama alanına taşıdı.
- Form açıkken bölüm değiştirme, `n` ve `/` kısayolları formun sıfırlanmasına veya odak kaybına yol açabilir.

#### Kabul Kriterleri

- [ ] Modal/drawer açıkken `1`, `2`, `3`, `n` ve `/` arka planı etkilemiyor.
- [ ] Escape yalnızca en üst overlay'i kapatıyor.
- [ ] Overlay kapandıktan sonra global kısayollar yeniden çalışıyor.
- [ ] Form verisi kısayol nedeniyle sıfırlanmıyor.

#### Doğrulama

- `npm run build`
- Her modal ve drawer açıkken ilgili tuşları kullanan tarayıcı/Electron E2E testi.

---

### ISS-006 — Modal, drawer, tablo ve bildirim erişilebilirliği eksik

- **Öncelik:** P1
- **Önem:** Orta/Yüksek
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-005 ile ortak overlay altyapısı.

#### Bulgular

- Modal için dialog rolü, `aria-modal`, başlık bağlantısı, focus trap ve focus return yok.
- Kapalı drawer bileşenleri DOM ve erişilebilirlik ağacında kalıyor.
- Doğrulama hataları alanlara ARIA ile bağlanmıyor ve ilk hatalı alana odak geçmiyor.
- Tablo satırları ayrıntı açmak için yalnızca fareyle kullanılabiliyor.
- Seçim kutularının adları, toast `aria-live` alanı ve toast kapatma etiketi eksik.
- Sütun sıralama düğmeleri yalnızca hover durumunda görünür.

#### Kabul Kriterleri

- [ ] Modal/drawer ekran okuyucuda doğru ad ve rolle duyuruluyor; arka plan inert.
- [ ] Tab odağı overlay dışına kaçmıyor ve kapanınca açan elemana dönüyor.
- [ ] Kapalı drawer erişilebilirlik ağacında bulunmuyor.
- [ ] Hatalı input'lar programatik olarak hata metnine bağlı ve ilk hataya odaklanıyor.
- [ ] Tablo satırları, seçimler, toast'lar ve sütun yönetimi klavyeyle kullanılabiliyor.

#### Doğrulama

- Klavyeyle Tab/Shift+Tab/Enter/Space/Escape senaryoları.
- Erişilebilirlik ağacı snapshot testi ve otomatik axe kontrolü eklendiğinde sıfır kritik ihlal.
- `npm run typecheck && npm run build`

---

### ISS-007 — Film/dizi filtreleri ortak ve medya araması Türkçe karakterlerde hatalı

- **Öncelik:** P1
- **Önem:** Orta
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** Yok.

#### Bulgular

- Film ve dizi aynı search, status ve genre filtre durumunu paylaşıyor.
- Yalnızca filmlerde bulunan bir tür filtresi Diziler'e geçildiğinde görünmeyen aktif filtre olarak kalabiliyor.
- Medya araması `toLowerCase()` kullandığı için `İ/ı` içeren Türkçe başlıklarda eşleşme kaçırabilir.

#### Kabul Kriterleri

- [ ] Film ve dizi filtre/arama durumu birbirini beklenmedik biçimde etkilemiyor.
- [ ] Bölüm değişiminde görünmeyen aktif filtre oluşmuyor.
- [ ] `İ`, `I`, `i`, `ı` örnekleri Türkçe locale beklentisine göre aranabiliyor.
- [ ] Arama davranışı kitap ve medya bölümlerinde tutarlı.

#### Doğrulama

- Film/dizi geçişi ve `İzmir`, `Işık`, `ışık` örnekleriyle unit/component testleri.
- `npm run typecheck`

---

### ISS-008 — Güncel bağımlılık güvenlik uyarıları bulunuyor

- **Öncelik:** P0
- **Önem:** Kritik/Yüksek
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** Yok; ISS-001 ve ISS-009 son doğrulaması bundan sonra yapılmalı.

#### Bulgular

- `npm audit --omit=dev`, `nanoid@5.1.9` için bir yüksek seviye uyarı raporluyor.
- Paketlenen `electron@41.2.1` için birden fazla yüksek/orta seviye güvenlik uyarısı var.
- Tüm zincirde 1 kritik, 20 yüksek, 1 orta ve 2 düşük uyarı raporlandı; önemli kısmı electron-builder, tar, Vite ve PostCSS zincirinde.

#### Kabul Kriterleri

- [ ] Doğrudan production bağımlılıklarında kabul edilmemiş yüksek/kritik açık yok.
- [ ] Paketlenen Electron sürümü bilinen ilgili advisory aralıklarının dışında.
- [ ] Build-only açıklar risk ve düzeltme planıyla belgelenmiş veya giderilmiş.
- [ ] Lockfile güncel, typecheck/build ve paket smoke testi başarılı.

#### Doğrulama

- `npm audit --omit=dev`
- `npm audit`
- `npm ls electron electron-builder nanoid postcss vite --depth=0`
- `npm run typecheck && npm run build`

---

### ISS-009 — Electron ve gizli anahtar güvenliği sıkılaştırılmalı

- **Öncelik:** P1
- **Önem:** Yüksek
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-008 sonrasında güncel Electron üzerinde doğrulanmalı.

#### Bulgular

- `index.html` içinde Content Security Policy bulunmuyor.
- Dış URL açma işlemi protokol/domain allowlist'i olmadan `shell.openExternal` çağırıyor.
- Gemini API anahtarı düz localStorage içinde tutuluyor.
- AI IPC çağrısında gönderen pencere, mime türü ve payload boyutu doğrulanmıyor.
- Backup/AI IPC kanallarında tip ve boyut sınırları eksik; kullanılmayan backup read yüzeyi renderer'a açık.

#### Kabul Kriterleri

- [ ] Üretim CSP yalnızca gereken kaynakları/protokolleri açıyor.
- [ ] Harici açma ve navigasyon yalnızca onaylı HTTPS hedeflerinde çalışıyor.
- [ ] Gemini anahtarı localStorage'da düz metin olarak bulunmuyor.
- [ ] IPC çağrıları sender, argüman şeması, mime ve boyut bakımından doğrulanıyor.
- [ ] Kullanılmayan preload/IPC yüzeyleri kaldırılmış.

#### Doğrulama

- `npm run build`
- Üretim Electron penceresinde CSP ihlal logları, engellenen protokol/domain ve aşırı payload testleri.
- Uygulama depolamasında API anahtarının düz metin bulunmadığının manuel kontrolü.

---

### ISS-010 — Başlangıç paketi ve masaüstü dağıtımı gereğinden büyük

- **Öncelik:** P2
- **Önem:** Orta
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-001 paketleme yaklaşımıyla birlikte ele alınmalı.

#### Bulgular

- Üretim JavaScript dosyası 880,58 KB; xlsx ve import/export ekranları başlangıç paketinde.
- Özel macOS betiği renderer bağımlılıklarını ham olarak uygulamaya tekrar kopyalıyor.
- `date-fns` ve `dexie-react-hooks` kaynak kodda kullanılmıyor.
- macOS entitlement listesi gereğinden geniş.

#### Kabul Kriterleri

- [ ] xlsx ve ağır dialog kodu ilk açılış bundle'ından ayrılmış.
- [ ] Kullanılmayan doğrudan bağımlılıklar kaldırılmış.
- [ ] Masaüstü paketi yalnızca runtime için gereken dosyaları içeriyor.
- [ ] Önce/sonra JS, `.app` ve DMG boyutları kaydedilmiş; anlamlı küçülme doğrulanmış.
- [ ] Entitlement listesi yalnızca gerçek gereksinimlerle sınırlı.

#### Doğrulama

- `npm run build`
- `du -sh release/mac-arm64/Kütüphanem.app release/mac-arm64/Kütüphanem.app/Contents/Resources/app/node_modules`
- `ls -lh release/*.dmg`
- Üretim çıktısında chunk boyutlarının karşılaştırılması.

---

### ISS-011 — Form, dosya ve dışa aktarma girdilerinde sınırlar eksik

- **Öncelik:** P1
- **Önem:** Orta
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-002 ve ISS-004 ile ortak normalizasyon katmanı önerilir.

#### Bulgular

- Sayfa, yıl, süre, sezon ve izlenme yılı alanlarında min/max ve mantıksal kontrol yok.
- Okuma bitiş tarihi başlangıçtan önce seçilebiliyor; ISBN doğrulanmıyor.
- Fotoğraf, JSON, CSV ve Excel için dosya boyutu/kayıt sayısı sınırı yok.
- CSV hücreleri spreadsheet formül enjeksiyonuna karşı temizlenmiyor.
- Manuel form yazarı zorunlu tutarken fotoğraf akışı boş yazara izin veriyor.

#### Kabul Kriterleri

- [ ] Tüm giriş kanalları aynı merkezi alan kurallarını kullanıyor.
- [ ] Sayısal/tarih/ISBN sınırları hem UI hem runtime katmanında uygulanıyor.
- [ ] Dosya ve IPC boyut/kayıt sınırları kullanıcıya açık hata gösteriyor.
- [ ] CSV formül başlangıç karakterleri güvenli şekilde kaçırılıyor.
- [ ] Yazar zorunluluğu ürün kararıyla tutarlı hâle getirilmiş.

#### Doğrulama

- Sınır içi/dışı sayılar, ters tarih, ISBN örnekleri, büyük dosya ve formül hücresi testleri.
- `npm run typecheck && npm run build`

---

### ISS-012 — Otomatik test, lint ve CI bulunmuyor

- **Öncelik:** P2
- **Önem:** Orta
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** Yok; diğer sorunların kalıcı doğrulamasını kolaylaştırır.

#### Bulgular

- Unit, component veya E2E test dosyası yok.
- ESLint/Prettier yapılandırması ve CI iş akışı bulunmuyor.
- Filtre, duplicate, import, yedek ve paketleme davranışları regresyona açık.

#### Kabul Kriterleri

- [ ] Unit/component/E2E test katmanlarının kapsamı ve komutları tanımlı.
- [ ] Filtre, import ve yedek gibi saf mantıklar için başlangıç regresyon testleri var.
- [ ] Modal/form ve en az bir Electron smoke akışı otomatik test ediliyor.
- [ ] Lint ve format kontrolü mevcut.
- [ ] CI typecheck, tracker check, lint, test ve build başarısızlığında commit/PR'ı kırıyor.

#### Doğrulama

- `npm run tracker:check`
- `npm run typecheck`
- Eklenecek `npm run lint` ve `npm test` komutları.
- CI iş akışının temiz checkout üzerinde başarılı çalışması.

---

### ISS-013 — Gizlilik açıklaması gerçek ağ trafiğini tam yansıtmıyor

- **Öncelik:** P1
- **Önem:** Orta
- **Durum:** Açık
- **Sorumlu:** Atanmadı
- **Oluşturma:** 2026-08-08
- **Son Güncelleme:** 2026-08-08
- **Bağımlılıklar:** ISS-009 kapsamında hangi üçüncü taraf isteklerinin korunacağı netleşmeli.

#### Bulgular

- Uygulama Google Fonts'a her açılışta, kart görünümünde OpenLibrary'e istek gönderebiliyor.
- Fotoğraftan eklemede görsel Gemini'ye; kitap başlık/yazarları Google Books'a gönderiliyor.
- README bu üçüncü taraf veri akışlarının tamamını açıklamıyor.

#### Kabul Kriterleri

- [ ] README ve uygulama içi açıklama her üçüncü tarafı, gönderilen veriyi ve amacı listeliyor.
- [ ] API anahtarının saklanma yöntemi ve yedeklere dâhil edilmediği doğru anlatılıyor.
- [ ] Çevrimdışı kullanımda hangi özelliklerin çalışmadığı açık.
- [ ] Harici kapak/font istekleri ürün tercihine göre kaldırılmış veya kullanıcıya kontrol verilmiş.

#### Doğrulama

- `rg -n "https://|fetch\(|new Image|@import url" src electron index.html README.md`
- Uygulama temiz profille açılarak ağ isteklerinin dokümantasyonla karşılaştırılması.
