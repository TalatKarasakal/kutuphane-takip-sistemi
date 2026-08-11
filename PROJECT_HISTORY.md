# Proje Takip Geçmişi

> Tamamlanıp kullanıcı tarafından doğrulanan işler ile reddedilen öneriler burada kalıcı olarak saklanır. Aktif işler için [PROJECT_TRACKER.md](PROJECT_TRACKER.md) dosyasını kullanın.

## Arşivleme Kuralları

1. Bir çözüm ancak kabul kriterleri karşılandıktan ve kullanıcı doğruladıktan sonra “Tamamlananlar” bölümüne taşınır.
2. Kayıtta özgün kimlik, karar tarihi, doğrulayan kişi, commit kimliği ve doğrulama özeti korunur.
3. Reddedilen öneriler karar gerekçesiyle saklanır; kimliği gelecekte başka kayıt için yeniden kullanılmaz.
4. Aktif tracker sayaçları ve backlog aynı commit içinde güncellenir.
5. Arşiv kayıtları silinmez; maddi bir hata varsa yeni tarihli düzeltme notu eklenir.

---

## 2026

### Tamamlanan ve Doğrulanan İşler

- *(Henüz doğrulanmış tamamlanmış iş bulunmuyor.)*

### Reddedilen Öneriler

- **Kimlik ve başlık:** IMP-001 — Kitap durum modelini iki eksene ayır
  - **Tür:** Reddedilen öneri
  - **Karar tarihi:** 2026-08-08
  - **Uygulayan:** Kullanıcı kararı
  - **Doğrulayan:** Kullanıcı
  - **Commit:** `2e712f9` (öneri kaydı; ret kararı bu tracker uzlaştırmasında işlendi)
  - **Sonuç:** Mevcut tek durum modeli korunuyor.
  - **Doğrulama:** Uygulanmadığı veri modeli ve arayüz üzerinden kontrol edildi.
  - **Karar gerekçesi:** Kullanıcı `IMP-001` için gereksinim olmadığını belirtti.
- **Kimlik ve başlık:** IMP-006 — Okuma takibi ve istatistikler
  - **Tür:** Reddedilen öneri
  - **Karar tarihi:** 2026-08-08
  - **Uygulayan:** Kullanıcı kararı
  - **Doğrulayan:** Kullanıcı
  - **Commit:** `2e712f9` (öneri kaydı; ret kararı bu tracker uzlaştırmasında işlendi)
  - **Sonuç:** İlerleme, hedef ve istatistik ekranları eklenmedi.
  - **Doğrulama:** İlgili model ve ekranların eklenmediği kontrol edildi.
  - **Karar gerekçesi:** Kullanıcı `IMP-006` için gereksinim olmadığını belirtti.
- **Kimlik ve başlık:** IMP-015 — Çoklu dil ve yerelleştirme desteği
  - **Tür:** Reddedilen öneri
  - **Karar tarihi:** 2026-08-08
  - **Uygulayan:** Kullanıcı kararı
  - **Doğrulayan:** Kullanıcı
  - **Commit:** `6566d9e` (öneri kaydı; ret kararı bu tracker uzlaştırmasında işlendi)
  - **Sonuç:** Türkçe tek dil yapısı ve mevcut metin yerleşimi korundu.
  - **Doğrulama:** i18n bağımlılığı ve locale kaynakları eklenmediği kontrol edildi.
  - **Karar gerekçesi:** Kullanıcı `IMP-015` için gereksinim olmadığını belirtti.

---

## Kayıt Şablonu

Yeni arşiv kaydı aşağıdaki alanları içermelidir:

- **Kimlik ve başlık:** Aktif kayıttaki özgün kimlik
- **Tür:** Sorun çözümü / geliştirme / reddedilen öneri
- **Karar tarihi:** YYYY-MM-DD
- **Uygulayan:** Geliştirici veya agent/model
- **Doğrulayan:** Kullanıcı/geliştirici
- **Commit:** Tam commit kimliği
- **Sonuç:** Nelerin değiştiğinin kısa özeti
- **Doğrulama:** Çalıştırılan komutlar ve manuel senaryolar
- **Karar gerekçesi:** Özellikle reddedilen kayıtlarda zorunlu
