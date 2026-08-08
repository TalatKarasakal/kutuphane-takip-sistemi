# Önerilen Çözümler

> Sorunların kanıtları ve kabul kriterleri için [ISSUES.md](ISSUES.md), güncel sıra için [PROJECT_TRACKER.md](../../PROJECT_TRACKER.md) dosyasını kullanın.

---

### SOL-001 — Standart ve doğrulanabilir dağıtım hattı

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-001, ISS-008, ISS-010
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` macOS paketini electron-builder üzerinden üret; özel kopyalama betiğini kaldır veya yalnızca sınırlı öncesi/sonrası görevlerde kullan. İkonu bundle içine koy, `CFBundleIconFile` değerini doğrula ve bütün değişikliklerden sonra imzala. Genel dağıtımda hardened runtime, Developer ID ve notarization; Windows'ta code signing kullan. CI'da paket, imza ve başlatma smoke testi çalıştır.

### SOL-002 — Sürümlü ve doğrulanan yedek formatı

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-002
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` yedek verisini runtime şemasıyla doğrula. İzin verilen status/type değerlerini, zorunlu alanları, uzunlukları ve sayısal sınırları kontrol et. Desteklenmeyen sürümü reddet veya açık migration çalıştır. Güvenlik yedeği `ok:false` dönerse geri yüklemeyi durdur; büyük dosya ve duplicate ID durumlarını işlem başlamadan raporla.

### SOL-003 — Ortak asenkron işlem ve hata yönetimi

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-003
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` form `onSave` sözleşmelerini `Promise<void>` yap; submit işlemini `await` et, işlem sırasında düğmeleri kilitle ve yalnızca başarıdan sonra modalı kapat. Store işlemlerinde ortak hata toast'ı kullan. İlk yükleme için loading/error ekranı, uygulama için error boundary ekle.

### SOL-004 — Güvenli içe aktarma doğrulaması

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-004, ISS-011
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` tanınmayan durumları tamamlanmış sayma; güvenli varsayım seç veya kullanıcı eşlemesini zorunlu kıl. Hedef eşlemelerini benzersiz yap, alanları trim et, sıfır geçerli satırda işlemi engelle ve gerçek dosya satırını göster. Parse hatalarını modal içinde raporla ve duplicate özetini import öncesinde sun.

### SOL-005 — Erişilebilir modal/drawer altyapısı

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-005, ISS-006
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` modal ve drawer'a doğru ARIA rolleri, başlık ilişkisi, focus trap, focus return ve inert arka plan desteği ekle. Kapalı drawer'ı render etme veya erişilebilirlik ağacından çıkar. Overlay açıkken global kısayolları devre dışı bırak. Hata alanına odaklan ve doğrulama mesajlarını input'a bağla.

### SOL-006 — Film ve dizi görünüm durumlarını ayırma

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-007
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` film ve dizi için ayrı arama/genre/status filtre durumu tut veya bölüm değişiminde geçersiz filtreleri temizle. Aramada sorgu ve alanlar için `toLocaleLowerCase('tr')` kullan; Türkçe karakter regresyon testleri ekle.

### SOL-007 — Bağımlılık güncelleme ve güvenlik politikası

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-008, ISS-012
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` önce patch/minor kapsamındaki nanoid, Electron ve PostCSS düzeltmelerini uygula; electron-builder ve Vite major yükseltmelerini ayrı değişiklikler olarak ele al. Her yükseltmeden sonra typecheck, build, import/export ve paket smoke testlerini çalıştır. Audit sonuçlarını runtime ve build zinciri olarak sınıflandır.

### SOL-008 — Electron savunma katmanlarını güçlendirme

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-009
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` CSP ekle; `shell.openExternal` için yalnızca onaylı HTTPS hostlarını kabul et ve dış navigasyonu engelle. IPC sender'ını ana pencereyle doğrula; argüman şemaları ve boyut limitleri koy. Kullanılmayan preload/IPC metotlarını kaldır. Gemini anahtarını Electron `safeStorage` veya işletim sistemi anahtarlığında sakla.

### SOL-009 — Bundle ve paket boyutu optimizasyonu

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-010
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` import/export dialoglarını ve xlsx modülünü dynamic import ile lazy-load et. Kullanılmayan bağımlılıkları kaldır. Renderer'ın bundle edilmiş bağımlılıklarını tekrar kopyalama; electron-builder'ın ASAR ve production dependency analizini kullan. Önce/sonra JS, app ve DMG boyutlarını karşılaştır.

### SOL-010 — Tutarlı veri doğrulama katmanı

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-002, ISS-004, ISS-011
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` manuel form, fotoğraf, dosya importu ve yedek geri yüklemenin kullandığı tek normalizasyon/doğrulama modülü oluştur. Yazar zorunluluğuna ürün kararı ver. Yıl, sayfa, süre, sezon, tarih ve ISBN kurallarını merkezi tut. CSV formül başlangıç karakterlerini güvenli biçimde kaçır.

### SOL-011 — Gizlilik ve çevrimdışı çalışma iyileştirmesi

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-013
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` README ve uygulama içi açıklamaya Gemini, Google Books, OpenLibrary ve Google Fonts veri akışlarını ekle. Fontları uygulama içine göm veya sistem fontlarına dön. Kapak sorgusunu kullanıcı tercihi yap; çevrimdışı modda üçüncü taraf isteklerini kapat.

### SOL-012 — Test ve kalite kapıları

- **Durum:** Önerildi
- **Sorumlu:** Atanmadı
- **İlgili:** ISS-003, ISS-004, ISS-005, ISS-006, ISS-007, ISS-008, ISS-009, ISS-010, ISS-011, ISS-012
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` Vitest ile filtre/import/yedek unit testleri, React Testing Library ile form/modal testleri ve Playwright/Electron ile temel kullanıcı akışları ekle. ESLint ve format kontrolünü kur. CI sırası: install → tracker check → typecheck → lint → test → build → Electron smoke/package doğrulama → audit raporu.
