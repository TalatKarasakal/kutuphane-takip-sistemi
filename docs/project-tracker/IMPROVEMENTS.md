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

### IMP-028 — Yerel modelin raf fotoğraflarını okuyamaması ve fotoğraf sırası

- **Öncelik:** P1
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` Yerel modelde fotoğraftan ekleme yalnız tek bir kitabın karşıdan çekildiği kareyi okuyabiliyor, raf fotoğraflarının tamamı başarısız oluyordu. Ölçümde neden modelin yeteneği değil, isteğin kendisi çıktı: Ollama'nın varsayılan bağlamı (4096) bir raf fotoğrafının görsel token'ları, istem ve düşünme adımı için yetmiyor, pencere taşınca model boş yanıt döndürüyor ve bu arayüzde "kitap algılanamadı" olarak görünüyordu. Üç düzeltme: (1) `num_ctx` 8192'ye çıkarıldı; (2) düşünme adımı, destekleyen modellerde `think: false` ile kapatıldı — yetenek `/api/show` ile önbellekli olarak sorulur, çünkü desteklemeyen bir modele bu alan gönderilirse istek reddedilir; (3) bazı modeller `think: false` altında yanıtı `content` yerine `thinking` alanına yazdığı için iki alan da çözümlenir. Ayrıca yerel modellere ayrı bir istem verildi: "kitabı tanı" yerine "sırtta yazanı oku" diyen sürüm uydurmayı sıfırladı. Çok satırlı sırtlarda başlığa karışan satır sonları tek boşluğa indirgeniyor. İkinci parça: aynı anda tek fotoğraf yerine birden çok fotoğraf seçilip sıraya alınabiliyor; sırayla işlenip sonuçlar tek gözden geçirme listesinde toplanıyor, satırlarda kaynak fotoğrafın adı gösteriliyor, fotoğraflar arası mükerrerler işaretleniyor ve düşen fotoğraf sıranın kalanını durdurmuyor.

### IMP-029 — Kişisel palete geçiş ve arayüz cilası

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` Arayüz Tailwind'in hazır renklerini (emerald/sky/amber/rose/indigo…) kullanıyordu; renkler kişisel tasarım paletine taşındı (kariyer-vault, `08-Tercihler/tasarim-tercihleri.md`, "Palet A"). Altı aile — Petrol, Elektrik Mavi, Turkuaz, Bordo, Nötr, Kemik — `tailwind.config.ts` içinde rampa olarak tanımlandı; temaya göre değişen anlamsal belirteçler `src/index.css` içinde kaldı. Palet A vurguyu Bordo'ya verir ama bordoyu "seyrek kullanılır" diye işaretler; bir uygulama arayüzünde birincil vurgu düğme/sekme/odak halkasında sürekli göründüğü için roller ters çevrildi: birincil Turkuaz, ikincil (seyrek) Bordo, bağlantı/seçili durum Elektrik Mavi. Kontrast için iki sapma yapıldı: koyu temada ikincil metin Petrol 400 yerine 300, açık temada Kemik rozet yazısı için aileye 800 kademesi eklendi. Durum renkleri korundu ama palete oturtuldu: Turkuaz (okundu/izlendi), Elektrik Mavi (okunacak/izlenecek), Kemik (elimde mevcut), Bordo (satın alınacak). Vurgu rengi seçimi (turkuaz/kırmızı) kaldırıldı — her iki renk zaten palette. Renk katkısı: kenar çubuğu başlığında iki vurgu ailesinden geçen renk alanı, durum filtrelerinde renk noktası + seçili satırda kendi renginde kenar çubuğu ve pay çubuğu, üst çubukta ince renk geçişi. Yan iş olarak kitap ve medya kenar çubuklarının kopyaladığı `FilterCard`/`FilterRow` ortak `layout/FilterPanel.tsx` dosyasına, dört bileşende kopyalanan durum→renk haritası da `constants/statuses.ts` içindeki tek kaynağa alındı.

### IMP-030 — CSP worker engeli, geniş ekran tablosu ve renk ayrımı

- **Öncelik:** P1
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` Üç iş. (1) `index.html` içindeki CSP `worker-src` tanımlamıyordu, bu yüzden `script-src 'self'` yedeğe düşüyor ve blob'dan worker açmak engelleniyordu; barkod okuyucu (`@zxing/browser`) tam olarak böyle çalıştığı için ISBN barkod taraması sessizce çalışmıyordu. `worker-src 'self' blob:` eklendi. (2) Geniş ekranda tablonun fazla genişliği sayı ve rozet sütunlarında birikiyor, uzun kitap adları ise dar kalıyordu; sayısal sütunlara, durum sütununa ve satır eylem sütununa sabit genişlik verildi, artan alan başlık/yazar sütunlarına aktı (1500 px'de başlık 263→280, yazar 221→235, durum 206→165 px). (3) Arama alanı üst çubuktan kenar çubuğunun tepesine, uygulama kimliği kenar çubuğundan üst çubuğun soluna taşındı. Ayrıca yüzey kademeleri ayrıldı: kenar çubuğu ile kartlar ikisi de beyazdı, aynı tonlar üst üste binince okuma zorlaşıyordu. Yeni `--panel` belirteciyle zemin < panel < yüzey kademesi kuruldu, kenarlık ve ikincil metin bir tık koyulaştırıldı. Bordo daha görünür hâle geldi: kimlik simgesi turkuazdan bordoya geçen bir alan taşıyor, arama şeridi iki vurgu ailesini birleştiriyor, filtre kutuları başlıklarında kendi renk çubuklarını taşıyor (Durum turkuaz, Etiketler mavi, Tür ve Tekrar Edenler bordo, Ödünç kemik).

### IMP-031 — Yığın sırası hatası, boş tür kartı ve renk ayarları

- **Öncelik:** P1
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` Kullanıcı geri bildirimi üzerine sekiz düzeltme. Bir gerçek hata: üst çubuğun `z-index`i yoktu, DOM'da sonra gelen içerik alanındaki konumlandırılmış öğeler (kart kaplamaları `z-10`, sıralama başlıkları) açılır menünün üstüne çiziliyordu; kart görünümünde "Ayarları Aç" tıklanamıyor, tablo görünümünde sıralama okları menünün içinden görünüyordu. Üst çubuk `z-30` ile kendi yığın bağlamını kuruyor; sıra içerik < üst çubuk(30) < drawer(40) < modal(50) < toast(60). Diğerleri: tür kartı yalnız tür varsa görünüyor (boşken "Henüz tür eklenmemiş" satırı yerine kart hiç çizilmiyor); arama ile filtreler arasındaki ayraç ve renk şeridi kaldırıldı — iki yakın tonu ayırmıyor, yalnız gürültü katıyordu; arama yer tutucusu "Arama" oldu; yarıçaplar tek ölçeğe indi (denetimler `lg`, kapsayıcılar `xl`, rozetler `full`; kalan `md` ve çıplak `rounded` kullanımları ayıklandı). Turkuaz tonu paletle uyumlandı: birincil vurgu Turkuaz 800 (#0E6E66) koyu yeşile kaçıyordu, paletin turkuaz referansları (#14b8a6, #1abc9c) daha açık; 700 ile 800 arası bir ton (#107B72) seçildi — beyaz yazıyla 5,1:1 veriyor, 700 ise 4,33:1'de kalıyordu. Bordo payı artırıldı: kimlik simgesi turkuazdan bordoya geçiyor, üst çubuk çizgisi ağırlıklı bordo, "filtreleri temizle" ve ödünç kartı bordo, toplu seçim çubuğu bordo zeminli, tür rozetlerinde iki bordo kademesi var.

### IMP-032 — Açık tema yeniden kurgulandı, çerçeve ile içerik ayrıldı

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` Kullanıcı açık temanın fazla mavi olduğunu, üst çubuk ile içerik alanının aynı tonda durduğunu ve ayırıcı çizgilerin görünmediğini bildirdi. Açık tema yüzeyleri Petrol ailesinden Nötr ailesine çekildi; mavi artık zeminde değil, yalnız kimlik kutucuğunda ve seçili/bağlantı durumlarında. Üst çubuk ve kenar çubuğu ortak `--panel` tonunu paylaşıyor, böylece uygulama çerçevesi tek parça okunup içerik zemininden ayrışıyor. Yeni `--edge` belirteci iki ayıracı (üst çubuğun altı, kenar çubuğunun sağı) aynı ve belirgin çizgiyle çiziyor; açık temada 1 px ayıraç için 3:1 hedefi gözetildi. Kimlik kutucuğu kullanıcının onayladığı mavi geçişe döndü (Elektrik Mavi 400→800, tema belirteci değil sabit ramp değerleri, iki temada aynı görünsün diye). Birincil dolgu paletin turkuazına (Turkuaz 500) döndü; bu parlaklıkta beyaz yazı 2,3:1 verdiği için dolgu üstündeki yazı koyu, yazı/simge olarak kullanılan turkuaz ise ayrı bir `--primary-ink` belirteci (açık temada Turkuaz 800, koyuda 400). Açık temada ikincil metin panel üstünde 4,36:1'de kaldığı için bir kademe koyulaştırıldı.

### IMP-033 — Token setine göre arayüz revizyonu

- **Öncelik:** P1
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` Arayüz, kullanıcının verdiği token setine göre yeniden kuruldu; spesifikasyon `docs/design/arayuz-token-seti.md` altında saklanıyor. Renkler yorumlanmadan birebir alındı. Beş yüzey kademesi kuruldu (pencere zemini < kenar çubuğu < üst bar < panel < satır); üst bar ile kenar çubuğu artık ayrı token taşıyor. Aydınlık tema soğuk mavi-gri kağıttan sıcak kağıda (#E7E2D8 ailesi) geçti, mürekkep lacivert oldu. Birincil eylem bordo; turkuaz eylem rengi olmaktan çıkıp yalnız durum göstergesi (`--success`) olarak kaldı. Tür etiketleri tek tip nötr görünüme indi — on bir tür için on bir renk anlam taşımıyordu; durum etiketleri renkli kaldı çünkü orada renk anlam ifade ediyor. Tablo: satır yüksekliği 52 px, zebra, satır ayırıcı, yapışkan başlık, oranlı sütun genişlikleri, yayınevi tek satırda kesilip tam adı `title` özniteliğinde. Seçim kutusu özel biçimlendirildi (işaretliyken bordo dolgu, beyaz onay imi) ve uygulamadaki on iki kutunun tamamına uygulandı. Kenar çubuğu filtreleri kendi kaplarına alındı, sayılar tablo rakamlı ve sağa hizalı. Odak halkası her yerde bordo. Tailwind renk katmanı token'lara bağlandı; eski rampalar (Petrol/Turkuaz/Elektrik/Bordo/Kemik/Nötr) ve `--primary`/`--secondary`/`--surface` belirteçleri kaldırıldı.

### IMP-034 — Vurgu rengi temaya göre değişiyor

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` `docs/design/tema-vurgusu.md` uyarınca `--accent` iki temada farklı aileden geliyor: aydınlıkta turkuaz (#0E6E66, hover #0A5751), karanlıkta bordo (#B23A4B) olduğu gibi kalıyor. Bordo aydınlıkta eylem rengi olmaktan çıkıp yeni `--warn` token'ına taşındı ve yalnız durum/hata rengi olarak kullanılıyor; karanlıkta `--warn` vurguyla aynı değerde. Token üzerinden geldiği için ekleme düğmesi, aktif filtre, bölüm başlığı çubukları, seçim kutusu, odak halkası, sıralama oku ve aktif görünüm düğmesi kendiliğinden turkuaza döndü. Aydınlıkta "Okundu" yeşili turkuaz vurgudan ayrışsın diye #1E7F52'den #2F7D32'ye çekildi. Durum rozetleri biçim kazandı: "Okundu" ve "Okunacak" dolgulu, "Elimde Mevcut" ve "Satın Alınacak" yalnız kenarlıklı — bordo dolgu karanlık temada birincil düğmeyle yarışıyordu. Sol üstteki uygulama simgesi karanlıkta vurgu tonunda yumuşak dolgu, kenarlık ve bordo ikon aldı; aydınlıkta lacivert/beyaz olarak korundu. Hata ve yıkıcı eylem yüzeyleri (bildirim, silme düğmesi, form hata metni, içe aktarma uyarıları) `--warn`a bağlandı.

### IMP-035 — Turkuaz iki tona ayrıldı, satır hover eylemi kaldırıldı

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` `docs/design/turkuaz-tonu.md` uyarınca aydınlık temada vurgu iki tona ayrıldı: beyaz metin taşıyan yüzeyler `--accent` (#0F7E74, ölçülen 4,93:1), metin taşımayan işaretler yeni `--accent-mark` (#16A398, grafik öğe olarak 3,04:1). İşaret tonu şu yerlere uygulandı: bölüm başlığı çubukları, aktif filtrenin sol çubuğu, seçim kutusunun işaretli dolgusu, odak halkası, aktif sıralama oku, üst bardaki aktif bölüm ve görünüm düğmesi. Karanlık temaya dokunulmadı; orada `--accent-mark` vurguyla aynı değerde tanımlandı, böylece sınıflar iki temada da çalışıyor. Tablo satırlarının solundaki dikey çubuk kullanıcı kararıyla durum rengini korudu — turkuaza çevrilseydi satırdaki durum kodlaması kalkacaktı. İkinci iş: satır hover'ında beliren hızlı durum değiştirme düğmesi ("→ Okundu ✓") ekrana sığmayıp kırpıldığı için kaldırıldı; `NEXT_STATUS`/`NEXT_LABEL` eşlemeleri, eylem hücresi, karşılığı olan boş başlık sütunu ve tıklama işleyicisi temizlendi, `colSpan` değerleri düzeltildi. Hover artık yalnız zemin değişimi. Durum değiştirme toplu seçim çubuğundan ve detay görünümünden sürüyor.

### IMP-036 — Aydınlık temada vurgu lacivert

- **Öncelik:** P2
- **Durum:** Uygulandı · Kontrol Bekliyor
- **Sorumlu:** Claude
- **Son Güncelleme:** 2026-08-14
- **Öneri:** `[Model: Claude Opus 5]` `docs/design/lacivert-vurgu.md` uyarınca aydınlık temada vurgu turkuazdan lacivere geçti: `--accent` #1E3A6E, `--accent-hot` #162C55, `--accent-soft` rgba(30,58,110,0.12). Bir önceki turda eklenen `--accent-mark` token'ı tamamen kaldırıldı — lacivert beyaz metinle zaten yüksek kontrast verdiği için ikili ton ayrımına gerek kalmadı; kullandığı yerler (bölüm başlığı çubukları, aktif filtre çubuğu, seçim kutusu dolgusu, odak halkası, sıralama oku, aktif görünüm düğmesi) `--accent`e döndü. Lacivert vurgu ile "Okunacak" durumu (`--glow`) aynı aileden geldiği için rozet aydınlık temada dolgusuz hâle getirildi: açık zemin (`--glow-soft`), kenarlık (`--glow-line`) ve renkli yazı. Karanlık temada vurgu bordo olduğu için çakışma yok, rozet orada dolgulu kaldı. Uygulama simgesi aydınlık temada artık `--accent` üzerinden besleniyor (önceden ayrı `--navy` token'ı kullanıyordu); karanlıkta bordo tonunda kalmaya devam ediyor.
