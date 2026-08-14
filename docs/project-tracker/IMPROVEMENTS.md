# Geliştirme Önerileri

> Bu belge yalnızca kullanıcı açıkça geliştirme tavsiyesi istediğinde güncellenir. Aktif hata sırası için [PROJECT_TRACKER.md](../../PROJECT_TRACKER.md) dosyasını kullanın.

---

### IMP-001 — Kitap durum modelini iki eksene ayır

- **Öncelik:** P1
- **Durum:** Reddedildi
- **Sorumlu:** Kullanıcı kararı
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` mevcut sahiplik ve okuma durumlarını `ownershipStatus` ve `readingStatus` olarak ayır; “okuyor” durumunu ve okuma ilerlemesini ekle.

### IMP-002 — Puan ve etiket alanlarını tamamla

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` `Book.rating` ve `Book.tags` alanlarını form, liste, detay, filtre, import ve export akışlarına ekle. Yakın vadede kullanılmayacaksa ölü alan olarak kalmaması için modelden çıkar.

### IMP-003 — Uygulama içi yedek geçmişi

- **Öncelik:** P1
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` mevcut backup list/read/lastInfo yetenekleriyle tarih, boyut ve kayıt sayısı gösteren yedek geçmişi ekranı oluştur; seçilen yedeği önizleyerek geri yüklet. Özellik yapılmayacaksa kullanılmayan IPC yüzeyini kaldır.

### IMP-004 — ISBN/barkod ve çevrimiçi künye araması

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` barkod veya elle ISBN girildiğinde kontrollü künye araması sun. Dış servise gönderilen veriyi açıkla ve sonuç eklenmeden önce önizleme göster.

### IMP-005 — Duplicate birleştirme merkezi

- **Öncelik:** P1
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` tekrar kayıtları alan bazında karşılaştıran “birleştir” akışı ekle. Dosya ve fotoğraf importunda “atla / yeni ekle / mevcutla birleştir” seçenekleri sun.

### IMP-006 — Okuma takibi ve istatistikler

- **Öncelik:** P2
- **Durum:** Reddedildi
- **Sorumlu:** Kullanıcı kararı
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` okuma yüzdesi/sayfası, başlangıç-bitiş geçmişi, yıllık hedef, aylık okunan sayfa/kitap ve tür dağılımı ekle. Film/dizi için izleme geçmişi ve yıllık özet düşünülebilir.

### IMP-007 — Ödünç verme takibi

- **Öncelik:** P3
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` kitap için ödünç verilen kişi, tarih, planlanan iade ve iade edildi durumu ekle.

### IMP-008 — Büyük koleksiyon performansı

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` binlerce kayıt için sanal listeleme veya sayfalama, IndexedDB indeksli sorgular ve parçalı import kullan. Önce gerçekçi 1.000/10.000 kayıt performans testi oluştur.

### IMP-009 — Görsel ve bilgi zenginleştirme

- **Öncelik:** P3
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` kitap detayında kapağı göster; kartlarda portre oranını koru. Film/dizi için isteğe bağlı poster alanı ekle; harici servis varsa kullanıcı anahtarı ve gizlilik tercihi sun.

### IMP-010 — Dağıtım ve ürün bilgileri

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` Intel/Universal macOS, Windows imzalı kurulum ve Linux paket scripti ekle. Hakkında/sürüm ekranı, changelog ve isteğe bağlı güvenli güncelleme kontrolü oluştur.

### IMP-011 — Form deneyimi ve geri bildirim

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` form kirliyken kaydedilmemiş değişiklik uyarısı göster. Toplu durum güncellemelerinde başarı toast'ı; toplu silmede geri alma yanında isteğe bağlı doğrulama kullan. Kart görünümüne seçim affordance'ı ekle.

### IMP-012 — Çıkarılabilecek ve sadeleştirilebilecek parçalar

- **Öncelik:** P1
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: GPT-5 Codex]` kullanılmayan `date-fns` ve `dexie-react-hooks` bağımlılıklarını kaldır. Uygulanmayacaksa ölü rating/tags alanlarını ve backup IPC metotlarını çıkar. Gereksiz entitlement'ları sil; dış Google Fonts bağımlılığını kaldır veya yerel fontlarla değiştir.

### IMP-013 — Atomik veri işlemleri ve görsel önbellekleme mimarisi

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: Gemini 3.6 Flash]` IndexedDB (Dexie) katmanında toplu ekleme/güncelleme/silme işlemlerini atomik transaction kapsamına alarak veri bütünlüğünü garanti altına al. Kitap kapak görselleri ve fotoğrafları için yerel IndexedDB Blob önbelleği oluştur.

### IMP-014 — Hızlı erişim komut paleti (Command Palette — Cmd/Ctrl + K)

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: Gemini 3.6 Flash]` Masaüstü deneyimini ve verimliliği artırmak için `Cmd+K` / `Ctrl+K` ile açılan gelişmiş komut paleti bileşeni ekle. Klavyeden hızlı arama, sayfa geçişleri, yeni kitap/medya ekleme ve filtre sıfırlama eylemleri sağla.

### IMP-015 — Çoklu dil ve yerelleştirme (i18n) desteği

- **Öncelik:** P3
- **Durum:** Reddedildi
- **Sorumlu:** Kullanıcı kararı
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: Gemini 3.6 Flash]` Uygulama arayüz metinlerini bileşenlerden ayırarak `locales/tr.json` ve `locales/en.json` yapılandırmasına taşı; hafif bir i18n dil yönetim katmanı ekle.

### IMP-016 — Dinamik tema mimarisi ve OS teması entegrasyonu

- **Öncelik:** P3
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: Gemini 3.6 Flash]` Koyu tema yanında açık tema ve işletim sistemi tema tercihine (Electron `nativeTheme` IPC) otomatik uyum sağlayan esnek CSS Variable / Tailwind dark mode entegrasyonu sağla.

### IMP-017 — Etiket (Tag) ve dinamik renkli kategori yönetim merkezi

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Codex
- **Son Güncelleme:** 2026-08-11
- **Öneri:** `[Model: Gemini 3.6 Flash]` Kitap ve medya kayıtlarına uygulanabilir özel renkli etiket yönetimi (Tag Manager) ekle. Çoklu etiket filtreleme (AND/OR mantığı) ve etiket bazlı hızlı gruplama desteği oluştur.

### IMP-018 — Gelişmiş filtreleme ve kaydedilmiş akıllı görünümler

- **Öncelik:** P2
- **Durum:** Önerildi
- **Sorumlu:** Antigravity
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Gemini 3.6 Flash]` Sık kullanılan filtre, sıralama ve arama parametrelerinin (örn: "Okunacak Bilimkurgu", "5 Yıldızlı Filmler", "Ödünç Verilen Kitaplar") özel isimlerle "Akıllı Görünüm" olarak kaydedilmesi ve tek tıkla erişilebilmesini sağla.

### IMP-019 — Dışa aktarılabilir ve yazdırılabilir katalog/envanter raporu (PDF/HTML)

- **Öncelik:** P3
- **Durum:** Önerildi
- **Sorumlu:** Antigravity
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Gemini 3.6 Flash]` Mevcut ham veri aktarımlarının (CSV/JSON/XLSX) yanı sıra, seçili koleksiyon veya tüm kütüphane için görsel olarak düzenlenmiş, kapaklı veya detaylı envanter raporu (yazdırılabilir HTML / PDF dışa aktarım) oluşturma imkanı sağla.

### IMP-020 — Fiziksel raf/konum yönetimi ve kitap serisi takibi

- **Öncelik:** P2
- **Durum:** Önerildi
- **Sorumlu:** Antigravity
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Gemini 3.6 Flash]` Kitaplar için fiziki kütüphane raf konumu (örn: "Salon A-2 Rafı", "Çalışma Odası") ve ait olduğu seri/cilt sırası (örn: "Vakıf Serisi #2") bilgilerini modele ekleyerek raf ve seri bazlı gruplama/filtreleme olanağı sun.


### IMP-021 — Film ve dizilerde fotoğraftan içerik ekleme

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Claude Opus 5]` Kitaplardaki "Fotoğraftan Ekle" akışını film ve dizilere genişlet. Afiş, DVD/Blu-ray kapağı veya yayın listesi ekran görüntüsünden yapımları algıla; yönetmen, tür, çıkış yılı, süre ve sezon alanlarını doldur. Kitaplardan farklı olarak anahtarsız bir film katalog servisi bulunmadığı için künye doğrudan modelden gelir ve eklemeden önce gözden geçirme tablosunda onaylanır. Ortak diyalog `components/import/PhotoImportDialog.tsx` altında birleştirilir.

### IMP-022 — Ana sayfadaki ikincil eylemleri menülere taşı

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Claude Opus 5]` Üst çubuktaki "Fotoğraftan Ekle", "İçe Aktar" ve "Dışa Aktar" butonlarını ana yüzeyden kaldır. Fotoğraftan ekleme, ekleme butonuna tutturulmuş açılır menünün en altına; içe/dışa aktarma ise ayarlar butonunun menüsüne gömülür. Menüler `ui/MenuButton` ile ortak, klavye ve ekran okuyucu uyumlu (role="menu", ok tuşları, Escape) tek bir bileşenden gelir; aynı eylemler komut paletinde de erişilebilir kalır.

### IMP-023 — macOS ızgarasına uygun uygulama simgesi ve göründüğe göre değişen Dock simgesi

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Claude Opus 5]` Simgeyi Apple'ın macOS 26 ızgarasına oturt: logo saydam zeminli katmana ayrılır, kare/köşe yuvarlaklığı, kenar boşluğu ve gölge Icon Composer belgesi (`build/appicon.icon`) üzerinden `actool` + IconServices ile üretilir. Koyu ve açık zeminli iki ana görsel basılır; Dock simgesi `nativeTheme` değişiminde koyu temada siyah, açık temada beyaz zeminli sürüme geçer. `scripts/build-icons.sh` çizim değiştiğinde tüm çıktıları (png/icns/ico) yeniden üretir.

### IMP-024 — Yerel yapay zekâ sağlayıcısı (bulut yerine bu bilgisayar)

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Claude Opus 5]` Fotoğraftan eklemeyi tek sağlayıcıya (Gemini) bağlı olmaktan çıkar. Ayarlar'dan "Gemini (bulut)" ile "Bu bilgisayar" arasında seçim yapılabilsin; yerel seçenekte Ollama uyumlu bir sunucuya bağlanılsın, kurulu modeller görsel desteği bilgisiyle listelensin. Görsel bilgisayardan çıkmadığı için yerel sağlayıcı çevrimdışı modda da çalışır; kitaplarda künye zenginleştirmesi ağ gerektirdiğinden çevrimdışıyken atlanır. Ana sürecin arayüzden gelen adrese güvenmemesi için hedef `localhost`/`127.0.0.1`/`::1` ile sınırlandırılır ve yalnız kökeni kullanılır.

### IMP-025 — Fotoğraf algılamasını arka plan işine çevir

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Claude Opus 5]` Algılama, özellikle yerel modelde dakikaları bulabildiği için kullanıcıyı bekletmesin. İş durumu diyalogdan çıkarılıp `store/photoImportStore` içine alınsın; pencere kapatıldığında iş sürsün, üst çubukta dönen bir gösterge işi izlesin ve sonuç hazır olunca vurgulu bir düğmeye dönüşüp gözden geçirme listesini geri getirsin. Diyalog kapalıyken biten iş bildirimle duyurulsun, bırakılan işin geç gelen sonucu ekrana basılmasın, iş başka bir bölümde başlatıldıysa göstergeye tıklandığında o bölüme geçilsin.

### IMP-026 — Arayüz gözden geçirmesi ve görünüm düzeltmeleri

- **Öncelik:** P1
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Claude Opus 5]` Kullanım sürecine geçmeden önce bütün ekranları (kitap/film/dizi, tablo ve kart görünümü, detay paneli, formlar, içe/dışa aktarma, ayarlar, komut paleti, fotoğraftan ekleme, açık/koyu tema, dar pencere) tarayıp arayüz kusurlarını gider. Bulunanlar: kart görünümünde mutlak konumlu onay kutusu başlıkların ilk harflerini örtüyordu — onay kutusu akışa alındı ve kart, içeriğin üstüne serilen bir düğmeyle tıklanabilir tutuldu; koyu temada `color-scheme` bildirilmediği için tarih seçici, açılır liste ve onay kutusu gibi tarayıcı denetimleri açık temada kalıyordu; durum rozetleri tabloda iki satıra taşarak satır yüksekliğini bozuyordu.

### IMP-027 — Paketlenen macOS uygulamasının açılmaması

- **Öncelik:** P0
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-13
- **Öneri:** `[Model: Claude Opus 5]` Paketlenen uygulama hiçbir zaman açılmıyordu; kurulu sürüm de dâhil her yapı açılışta SIGTRAP ile ölüyordu, bu yüzden yalnızca geliştirme sürümü çalıştırılabiliyor ve Dock'ta "Electron" adı görünüyordu. İki bağımsız neden bulundu: (1) `productName` ASCII olmayan bir karakter içerdiğinde ("Kütüphanem") macOS paketlenen uygulamayı başlatamıyor; (2) yerel ad-hoc imzada Electron çerçevesi ana ikiliyle aynı kimliği taşımadığı için sertleştirilmiş çalışma zamanının kitaplık doğrulaması çerçeveyi reddediyor. Çözüm: paketin **içindeki** adlar ASCII'ye indirildi — çalıştırılabilir dosya, `CFBundleName` ve yardımcı süreç paketleri. Bunlardan herhangi biri Türkçe olduğunda uygulama açılmıyor; `mac.executableName` ile yalnız ikiliyi ASCII yapmak da yetmiyor, yardımcı süreç adları da ASCII olmalı. Paketin **klasör adı** ise serbest: `Kütüphanem.app` olarak adlandırıldığında uygulama sorunsuz açılıyor ve imza bozulmuyor, bu yüzden kullanıcı hem Finder'da hem Dock'ta Türkçe adı görüyor. Ayrıca `com.apple.security.cs.disable-library-validation` izni eklendi: yerel ad-hoc imzada kitaplık doğrulaması Electron çerçevesini reddediyordu. DMG adımı paketi ürün adıyla aradığı için yeniden adlandırma yalnız doğrudan kullanılan çıktılarda yapılır; `scripts/install-mac.sh` bu paketi üretip /Applications'a kurar. Windows tarafında da paket adı ASCII kaldı; kullanıcıya görünen ad NSIS kısayolu ve kaldırma kaydı için Türkçe verildi. Ayrıca Windows simgesi ayrıldı: macOS ana görseli maske ve gölgeyi kendi içinde taşıdığı için Windows görev çubuğunda küçük ve gölgeli duruyordu; tam kanarlı, gölgesiz ayrı bir `.ico` üretiliyor.
