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

- *(Henüz reddedilmiş öneri bulunmuyor.)*

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
