# Geliştirme Önerileri

> Bu belge yalnızca kullanıcı açıkça geliştirme tavsiyesi istediğinde güncellenir. Aktif hata sırası için [PROJECT_TRACKER.md](../../PROJECT_TRACKER.md) dosyasını kullanın.

---

### IMP-001 — Kitap durum modelini iki eksene ayır

- **Öncelik:** P1
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` mevcut sahiplik ve okuma durumlarını `ownershipStatus` ve `readingStatus` olarak ayır; “okuyor” durumunu ve okuma ilerlemesini ekle.

### IMP-002 — Puan ve etiket alanlarını tamamla

- **Öncelik:** P2
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` `Book.rating` ve `Book.tags` alanlarını form, liste, detay, filtre, import ve export akışlarına ekle. Yakın vadede kullanılmayacaksa ölü alan olarak kalmaması için modelden çıkar.

### IMP-003 — Uygulama içi yedek geçmişi

- **Öncelik:** P1
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` mevcut backup list/read/lastInfo yetenekleriyle tarih, boyut ve kayıt sayısı gösteren yedek geçmişi ekranı oluştur; seçilen yedeği önizleyerek geri yüklet. Özellik yapılmayacaksa kullanılmayan IPC yüzeyini kaldır.

### IMP-004 — ISBN/barkod ve çevrimiçi künye araması

- **Öncelik:** P2
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` barkod veya elle ISBN girildiğinde kontrollü künye araması sun. Dış servise gönderilen veriyi açıkla ve sonuç eklenmeden önce önizleme göster.

### IMP-005 — Duplicate birleştirme merkezi

- **Öncelik:** P1
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` tekrar kayıtları alan bazında karşılaştıran “birleştir” akışı ekle. Dosya ve fotoğraf importunda “atla / yeni ekle / mevcutla birleştir” seçenekleri sun.

### IMP-006 — Okuma takibi ve istatistikler

- **Öncelik:** P2
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` okuma yüzdesi/sayfası, başlangıç-bitiş geçmişi, yıllık hedef, aylık okunan sayfa/kitap ve tür dağılımı ekle. Film/dizi için izleme geçmişi ve yıllık özet düşünülebilir.

### IMP-007 — Ödünç verme takibi

- **Öncelik:** P3
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` kitap için ödünç verilen kişi, tarih, planlanan iade ve iade edildi durumu ekle.

### IMP-008 — Büyük koleksiyon performansı

- **Öncelik:** P2
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` binlerce kayıt için sanal listeleme veya sayfalama, IndexedDB indeksli sorgular ve parçalı import kullan. Önce gerçekçi 1.000/10.000 kayıt performans testi oluştur.

### IMP-009 — Görsel ve bilgi zenginleştirme

- **Öncelik:** P3
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` kitap detayında kapağı göster; kartlarda portre oranını koru. Film/dizi için isteğe bağlı poster alanı ekle; harici servis varsa kullanıcı anahtarı ve gizlilik tercihi sun.

### IMP-010 — Dağıtım ve ürün bilgileri

- **Öncelik:** P2
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` Intel/Universal macOS, Windows imzalı kurulum ve Linux paket scripti ekle. Hakkında/sürüm ekranı, changelog ve isteğe bağlı güvenli güncelleme kontrolü oluştur.

### IMP-011 — Form deneyimi ve geri bildirim

- **Öncelik:** P2
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` form kirliyken kaydedilmemiş değişiklik uyarısı göster. Toplu durum güncellemelerinde başarı toast'ı; toplu silmede geri alma yanında isteğe bağlı doğrulama kullan. Kart görünümüne seçim affordance'ı ekle.

### IMP-012 — Çıkarılabilecek ve sadeleştirilebilecek parçalar

- **Öncelik:** P1
- **Durum:** Fikir
- **Sorumlu:** Atanmadı
- **Son Güncelleme:** 2026-08-08
- **Öneri:** `[Model: GPT-5 Codex]` kullanılmayan `date-fns` ve `dexie-react-hooks` bağımlılıklarını kaldır. Uygulanmayacaksa ölü rating/tags alanlarını ve backup IPC metotlarını çıkar. Gereksiz entitlement'ları sil; dış Google Fonts bağımlılığını kaldır veya yerel fontlarla değiştir.
